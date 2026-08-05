import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Shows from "@/components/Shows";
import News from "@/components/News";
import About from "@/components/About";
import Footer from "@/components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <Nav />
      <main>
        <Hero />
        <Shows />
        <News />
        <About />
      </main>
      <Footer />
    </div>
  );
}

export default App;
