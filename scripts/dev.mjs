import { createServer as createViteServer } from "vite";
import { createClubServer } from "../server/index.mjs";

try {
  process.loadEnvFile(".env");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const backend = createClubServer();
let frontend;
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  await frontend?.close();
  backend.close();
  backend.closeAllConnections();
}

process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

function listen(port) {
  return new Promise((resolve, reject) => {
    function onError(error) {
      backend.off("listening", onListening);
      reject(error);
    }
    function onListening() {
      backend.off("error", onError);
      resolve();
    }
    backend.once("error", onError);
    backend.once("listening", onListening);
    backend.listen(port, "127.0.0.1");
  });
}

try {
  const preferredPort = Number(process.env.PORT || 3001);
  try {
    await listen(preferredPort);
  } catch (error) {
    if (error.code !== "EADDRINUSE") throw error;
    console.log(`Backend port ${preferredPort} is busy; choosing a free port.`);
    await listen(0);
  }

  const backendUrl = `http://127.0.0.1:${backend.address().port}`;
  console.log(`Club backend ready at ${backendUrl}`);
  frontend = await createViteServer({
    server: {
      host: "127.0.0.1",
      proxy: { "/api": backendUrl },
    },
  });
  if (stopping) {
    await frontend.close();
  } else {
    await frontend.listen();
    frontend.printUrls();
  }
} catch (error) {
  console.error("Could not start the development servers:", error);
  await stop(1);
}
