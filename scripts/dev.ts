import type { AddressInfo } from "node:net";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { createClubServer } from "../server/index.ts";

try {
  process.loadEnvFile(".env");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const backend = createClubServer();
let frontend: ViteDevServer | undefined;
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

function listen(port: number) {
  return new Promise<void>((resolve, reject) => {
    function onError(error: Error) {
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
    if ((error as NodeJS.ErrnoException).code !== "EADDRINUSE") throw error;
    console.log(`Backend port ${preferredPort} is busy; choosing a free port.`);
    await listen(0);
  }

  const backendUrl = `http://127.0.0.1:${(backend.address() as AddressInfo).port}`;
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
