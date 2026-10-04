import { useEffect, type RefObject } from "react";

const targets = [
  ".section-heading", ".event-card", ".article-card", ".gallery-grid > button",
  ".belong-photo", ".belong-copy", ".home-gallery > div", ".join-banner",
  ".newsletter", ".page-title", ".about-grid > *", ".about-stats > div",
  ".about-details > *", ".small-callout",
].join(", ");

/** Reveal once per mounted element, including cards added by filters or API data. */
export default function useScrollReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = root.current;
    if (!container || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    let mutations: MutationObserver | undefined;

    function stop() {
      observer?.disconnect();
      mutations?.disconnect();
      container?.querySelectorAll<HTMLElement>(".reveal-pending").forEach((el) => {
        el.classList.remove("reveal-pending");
      });
    }

    function start() {
      stop();
      if (!container || preference.matches) return;
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          target.classList.remove("reveal-pending");
          target.classList.add("reveal-visible");
          observer?.unobserve(target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

      function scan() {
        container?.querySelectorAll<HTMLElement>(targets).forEach((el) => {
          if (el.classList.contains("reveal-visible") || el.classList.contains("reveal-pending")) return;
          const siblings = el.parentElement ? Array.from(el.parentElement.children) : [];
          el.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(el), 3) * 70}ms`);
          el.classList.add("reveal-pending");
          observer?.observe(el);
        });
      }
      scan();
      mutations = new MutationObserver(scan);
      mutations.observe(container, { childList: true, subtree: true });
    }

    start();
    preference.addEventListener("change", start);
    return () => {
      stop();
      preference.removeEventListener("change", start);
    };
  }, [root]);
}
