import Nav from "@/components/Nav";
import Hero from "@/features/hero/Hero";
import Shows from "@/features/shows/Shows";
import News from "@/features/news/News";
import About from "@/features/about/About";
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
