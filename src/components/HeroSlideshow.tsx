import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { photo } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const slides = [
  { image: "run-vocal", alt: { en: "Vocalist in the spotlight at Run In Rhythm Concert", th: "นักร้องกลางแสงสปอตไลต์ในคอนเสิร์ต Run In Rhythm" } },
  { image: "clubroom-jam", alt: { en: "KU Acoustic members sharing snacks on the clubroom floor", th: "สมาชิก KU Acoustic นั่งล้อมวงกินขนมในห้องชมรม" } },
  { image: "run-guitar", alt: { en: "KU Acoustic guitarist performing under blue stage lights", th: "มือกีตาร์ KU Acoustic เล่นใต้แสงไฟสีฟ้าบนเวที" } },
  { image: "freshy-friends", alt: { en: "The KU Acoustic crew together in front of the Freshy Day stage", th: "ทีม KU Acoustic ถ่ายรูปรวมหน้าเวทีงาน Freshy Day" } },
  { image: "run-duet", alt: { en: "Two KU Acoustic singers sharing the Run In Rhythm stage", th: "นักร้อง KU Acoustic สองคนร่วมเวที Run In Rhythm" } },
  { image: "run-stage", alt: { en: "KU Acoustic performers together on the Run In Rhythm stage", th: "นักแสดง KU Acoustic พร้อมหน้ากันบนเวที Run In Rhythm" } },
  { image: "run-crowd", alt: { en: "The audience singing along at Run In Rhythm Concert", th: "ผู้ชมร้องตามในคอนเสิร์ต Run In Rhythm" } },
  { image: "run-family", alt: { en: "The performers and audience together after Run In Rhythm Concert", th: "นักแสดงและผู้ชมพร้อมหน้ากันหลังคอนเสิร์ต Run In Rhythm" } },
  { image: "hero-vocal", alt: { en: "A KU Acoustic singer on a flower-decked stage at the Royal Project show", th: "นักร้อง KU Acoustic บนเวทีประดับดอกไม้ในงานโครงการหลวง" } },
  { image: "kaset-stage", alt: { en: "Three KU Acoustic vocalists under the stage lights at Kaset Fair", th: "นักร้อง KU Acoustic สามคนใต้แสงไฟบนเวทีงานเกษตรแฟร์" } },
  { image: "royal-guitar", alt: { en: "Two KU Acoustic guitarists playing acoustic guitars at the Royal Project show", th: "มือกีตาร์ KU Acoustic สองคนเล่นกีตาร์โปร่งในงานโครงการหลวง" } },
  { image: "freshy-band", alt: { en: "KU Acoustic in cowboy costumes singing at Freshy Day Freshy Night", th: "KU Acoustic ในชุดคาวบอยร้องเพลงในงาน Freshy Day Freshy Night" } },
  { image: "royal-singer", alt: { en: "A KU Acoustic vocalist singing to the crowd at the Royal Project show", th: "นักร้อง KU Acoustic ร้องเพลงให้ผู้ชมในงานโครงการหลวง" } },
  { image: "kaset-guitar", alt: { en: "A KU Acoustic guitarist playing with the band at Kaset Fair", th: "มือกีตาร์ KU Acoustic เล่นร่วมกับวงในงานเกษตรแฟร์" } },
];

export default function HeroSlideshow() {
  const { lang, t } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState({ current: 0, previous: -1, direction: 1 });
  // Fetch photos only as they come up (the current one and its neighbours),
  // so a phone on campus data does not download all of them at once.
  const [loaded, setLoaded] = useState(() => new Set([0, 1, slides.length - 1]));
  useEffect(() => {
    const near = [slide.current - 1, slide.current, slide.current + 1].map(
      (index) => (index + slides.length) % slides.length,
    );
    setLoaded((previous) =>
      near.every((index) => previous.has(index)) ? previous : new Set([...previous, ...near]),
    );
  }, [slide.current]);
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
      aria-label={t.slideshow.label}
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
            aria-label={t.slideshow.slideOf(index + 1, slides.length)}
            aria-hidden={index !== slide.current}
            style={{ transform: `translateX(${index === slide.current ? 0 : index === slide.previous ? -slide.direction * 100 : slide.direction * 100}%)` }}
          >
            {loaded.has(index) && (
              <img
                className="hero-photo"
                src={photo(item.image, 1100)}
                srcSet={[750, 1100, 1600].map((width) => `${photo(item.image, width)} ${width}w`).join(", ")}
                sizes="(max-width: 760px) calc(100vw - 56px), 46vw"
                alt={item.alt[lang]}
                decoding="async"
                fetchPriority={index === 0 ? "high" : "low"}
              />
            )}
          </div>
        ))}
      </div>
      <div className="hero-slide-controls">
        <button type="button" aria-label={t.slideshow.previous} onClick={() => select(slide.current - 1, -1)}><ChevronLeft size={17} /></button>
        <span className="hero-slide-count" aria-hidden="true">{slide.current + 1} / {slides.length}</span>
        <div className="hero-slide-dots" aria-label={t.slideshow.choose}>
          {slides.map((item, index) => (
            <button
              type="button"
              key={item.image}
              aria-label={t.slideshow.show(index + 1, item.alt[lang])}
              aria-current={index === slide.current ? "true" : undefined}
              onClick={() => select(index, index > slide.current ? 1 : -1)}
            ><span /></button>
          ))}
        </div>
        <button type="button" aria-label={t.slideshow.next} onClick={() => select(slide.current + 1)}><ChevronRight size={17} /></button>
        {!reducedMotion && (
          <button type="button" aria-label={paused ? t.slideshow.play : t.slideshow.pause} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play size={15} /> : <Pause size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
