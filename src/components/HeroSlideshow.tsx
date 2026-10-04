import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { photo } from "@/lib/api";

const slides = [
  { image: "run-vocal", alt: "Vocalist in the spotlight at Run In Rhythm Concert" },
  { image: "run-guitar", alt: "KU Acoustic guitarist performing under blue stage lights" },
  { image: "run-duet", alt: "Two KU Acoustic singers sharing the Run In Rhythm stage" },
  { image: "run-stage", alt: "KU Acoustic performers together on the Run In Rhythm stage" },
  { image: "run-crowd", alt: "The audience singing along at Run In Rhythm Concert" },
  { image: "run-family", alt: "The performers and audience together after Run In Rhythm Concert" },
];

export default function HeroSlideshow() {
  const root = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState({ current: 0, previous: -1, direction: 1 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    if (!("IntersectionObserver" in window)) return () => preference.removeEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (root.current) observer.observe(root.current);
    return () => {
      preference.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (paused || hovered || focused || reducedMotion || !visible) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setSlide((previous) => ({
        current: (previous.current + 1) % slides.length,
        previous: previous.current,
        direction: 1,
      }));
    }, 5000);
    return () => window.clearInterval(timer);
  }, [paused, hovered, focused, reducedMotion, visible]);

  function select(index: number, direction = 1) {
    setPaused(true);
    setSlide((previous) => index === previous.current ? previous : ({
      current: (index + slides.length) % slides.length,
      previous: previous.current,
      direction,
    }));
  }

  return (
    <div
      ref={root}
      className="hero-slideshow"
      role="region"
      aria-roledescription="carousel"
      aria-label="KU Acoustic concert photos"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className="hero-slides" aria-live={paused || focused || reducedMotion ? "polite" : "off"}>
        {slides.map((item, index) => (
          <div
            className={`hero-slide${index === slide.current ? " active" : ""}`}
            key={item.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== slide.current}
            style={{ transform: `translateX(${index === slide.current ? 0 : index === slide.previous ? -slide.direction * 100 : slide.direction * 100}%)` }}
          >
            <img className="hero-photo" src={photo(item.image, 1200)} alt={item.alt} loading="eager" decoding="async" fetchPriority={index === 0 ? "high" : "low"} />
          </div>
        ))}
      </div>
      <div className="hero-slide-controls">
        <button type="button" aria-label="Previous photo" onClick={() => select(slide.current - 1, -1)}><ChevronLeft size={17} /></button>
        <div className="hero-slide-dots" aria-label="Choose a photo">
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.image}
              aria-label={`Show photo ${index + 1}: ${item.alt}`}
              aria-current={index === slide.current ? "true" : undefined}
              onClick={() => select(index, index > slide.current ? 1 : -1)}
            ><span /></button>
          ))}
        </div>
        <button type="button" aria-label="Next photo" onClick={() => select(slide.current + 1)}><ChevronRight size={17} /></button>
        {!reducedMotion && (
          <button type="button" aria-label={paused ? "Play photo slideshow" : "Pause photo slideshow"} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
