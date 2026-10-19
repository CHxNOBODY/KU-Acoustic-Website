import {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import useScrollReveal from "@/lib/useScrollReveal";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Guitar,
  Heart,
  Instagram,
  Languages,
  MapPin,
  Menu,
  Music2,
  Search,
  Sparkles,
  Users,
  X,
  Youtube,
} from "lucide-react";
import Dialog from "@/components/Dialog";
import HeroSlideshow from "@/components/HeroSlideshow";
import CommunityForm, {
  type FormKind,
} from "@/features/community/CommunityForm";
import Admin from "@/features/admin/Admin";
import {
  api,
  dateLabel,
  eventEnd,
  eventStart,
  localizeArticle,
  photo,
  timeKnown,
  type Article,
  type ClubEvent,
  type Content,
} from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Page = "home" | "events" | "journal" | "gallery" | "about" | "admin";
type Modal =
  | { kind: FormKind; event?: ClubEvent }
  | { kind: "article"; article: Article }
  | { kind: "photo"; index: number };
const pages: Page[] = ["home", "events", "journal", "gallery", "about"];
const gallery: {
  image: string;
  category: "stage" | "life";
  title: { en: string; th: string };
}[] = [
  { image: "run-stage", category: "stage", title: { en: "Run In Rhythm, all together on stage", th: "Run In Rhythm พร้อมหน้ากันบนเวที" } },
  { image: "run-vocal", category: "stage", title: { en: "A voice in the spotlight", th: "เสียงหนึ่งเสียงกลางแสงสปอตไลต์" } },
  { image: "run-guitar", category: "stage", title: { en: "Every chord, a little closer", th: "ทุกคอร์ด ใกล้กันขึ้นอีกนิด" } },
  { image: "run-duet", category: "stage", title: { en: "Two voices, one stage", th: "สองเสียง หนึ่งเวที" } },
  { image: "run-crowd", category: "life", title: { en: "The crowd is part of the song", th: "ผู้ชมก็เป็นส่วนหนึ่งของบทเพลง" } },
  { image: "run-family", category: "life", title: { en: "The Run In Rhythm family", th: "ครอบครัว Run In Rhythm" } },
  { image: "kaset-family", category: "stage", title: { en: "All together, under the lights", th: "พร้อมหน้ากันใต้แสงไฟ" } },
  { image: "hero-vocal", category: "stage", title: { en: "A voice. A moment.", th: "หนึ่งเสียง หนึ่งช่วงเวลา" } },
  { image: "royal-guitar", category: "stage", title: { en: "One chord at a time", th: "ทีละคอร์ด" } },
  { image: "kaset-stage", category: "stage", title: { en: "Nights we won’t forget", th: "ค่ำคืนที่เราไม่มีวันลืม" } },
  { image: "club-beach", category: "life", title: { en: "Making music, making memories", th: "ทำเพลง สร้างความทรงจำ" } },
  { image: "clubroom-friends", category: "life", title: { en: "Right at home in the clubroom", th: "อบอุ่นเหมือนบ้านในห้องชมรม" } },
  { image: "freshy-band", category: "stage", title: { en: "Freshy Day, full of music", th: "Freshy Day เต็มไปด้วยเสียงเพลง" } },
  { image: "freshy-friends", category: "life", title: { en: "The people behind the performance", th: "ผู้คนเบื้องหลังการแสดง" } },
  { image: "clubroom-circle", category: "life", title: { en: "Our favorite kind of circle", th: "วงกลมที่เราชอบที่สุด" } },
  { image: "exhibition-crowd", category: "life", title: { en: "Club Exhibition, a full house", th: "งานเปิดโลกกิจกรรม เต็มทั้งฮอลล์" } },
  { image: "exhibition-vocal", category: "stage", title: { en: "A song under the starlight", th: "บทเพลงใต้แสงดาว" } },
  { image: "exhibition-keys", category: "stage", title: { en: "Keys in the glow", th: "คีย์บอร์ดกลางแสงไฟ" } },
  { image: "exhibition-sax", category: "stage", title: { en: "Voice and saxophone", th: "เสียงร้องกับแซกโซโฟน" } },
  { image: "exhibition-backstage", category: "life", title: { en: "Good vibes backstage", th: "พลังดี ๆ หลังเวที" } },
  { image: "exhibition-guitar", category: "stage", title: { en: "Strumming in the blue light", th: "ตีคอร์ดใต้แสงสีฟ้า" } },
  { image: "exhibition-spotlight", category: "stage", title: { en: "Standing in the moment", th: "ยืนอยู่ในช่วงเวลานั้น" } },
  { image: "exhibition-hearts", category: "life", title: { en: "Made with love", th: "ทำด้วยหัวใจ" } },
  { image: "exhibition-haze", category: "stage", title: { en: "Out of the haze", th: "ก้าวออกมาจากม่านควัน" } },
  { image: "exhibition-family", category: "life", title: { en: "The Club Exhibition crew", th: "ทีมงานเปิดโลกกิจกรรม" } },
];
function readPage(): Page {
  const value = window.location.hash.slice(1);
  return [...pages, "admin"].includes(value)
    ? (value as Page)
    : "home";
}
function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className={`brand ${light ? "light" : ""}`}>
      <span className="brand-mark">
        <Music2 size={27} strokeWidth={1.7} />
      </span>
      <span>
        KU <b>ACOUSTIC</b>
        <small>KASETSART UNIVERSITY MUSIC CLUB</small>
      </span>
    </span>
  );
}
function EventCard({
  event,
  onOpen,
}: {
  event: ClubEvent;
  onOpen: () => void;
}) {
  const { t } = useLang();
  const past = eventEnd(event.date) < Date.now();
  const badges = (
    <>
      <span className="date-sticker">
        <b>{dateLabel(event.date, { day: "2-digit" }, t.locale)}</b>
        <span>{dateLabel(event.date, { month: "short" }, t.locale)}</span>
      </span>
      <span className="image-tag">{event.category}</span>
    </>
  );
  // Upcoming events never show a photo frame, and neither does an event
  // without a photo; the date and category then sit above the details.
  const framed = past && event.image;
  return (
    <article className={`event-card${framed ? "" : " compact"}`}>
      {framed ? (
        <button
          className="event-image"
          onClick={onOpen}
          aria-label={t.event.view(event.title)}
        >
          <img
            src={photo(event.image!, 750)}
            alt={`${event.category}: ${event.title}`}
            loading="lazy"
          />
          {badges}
        </button>
      ) : (
        <div className="event-head">{badges}</div>
      )}
      <div className="event-info">
        <div className="event-meta">
          {past ? t.event.past : t.event.comingUp}
          <span>{event.sample ? t.event.sample : "KU ACOUSTIC"}</span>
        </div>
        <button className="title-button" onClick={onOpen}>
          <h3>{event.title}</h3>
        </button>
        <p>
          <MapPin size={14} />
          {event.venue}
        </p>
        <div className="event-bottom">
          <span>
            <Clock3 size={14} />
            {timeKnown(event.date) ? t.time(clock(event.date)) : t.event.timeTba}
          </span>
          <button onClick={onOpen}>
            {past ? t.event.viewRecap : t.event.details}
            <ArrowUpRight size={16} />
          </button>
        </div>
        {event.link && (
          <a className="event-video text-link" href={event.link} target="_blank" rel="noopener noreferrer" aria-label={t.event.watchVideoLabel(event.title)}>
            <Youtube size={17} /> {t.event.watchVideo} <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
function ArticleCard({
  article: original,
  onOpen,
}: {
  article: Article;
  onOpen: () => void;
}) {
  const { lang, t } = useLang();
  const article = localizeArticle(original, lang);
  return (
    <article className="article-card">
      <button
        onClick={onOpen}
        className="article-image"
        aria-label={t.article.read(article.title)}
      >
        <img
          src={photo(article.image, 750)}
          alt={article.title}
          loading="lazy"
        />
      </button>
      <div className="article-meta">
        <span>{article.category}</span>
        <span>{dateLabel(article.date, undefined, t.locale)}</span>
      </div>
      <button className="title-button" onClick={onOpen}>
        <h3>{article.title}</h3>
      </button>
      <p>{article.excerpt}</p>
      <button className="text-link" onClick={onOpen}>
        {t.article.readStory}
        <ArrowUpRight size={15} />
      </button>
    </article>
  );
}
function ArticleBody({ article }: { article: Article }) {
  const { t } = useLang();
  return (
    <>
      <img
        className="dialog-cover"
        src={photo(article.image)}
        alt={article.title}
      />
      <div className="article-meta">
        <span>{article.category}</span>
        <span>{dateLabel(article.date, undefined, t.locale)}</span>
      </div>
      <p className="article-body">{article.body}</p>
    </>
  );
}
function Newsletter() {
  const { t } = useLang();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus("");
    try {
      const result = await api<{ message?: string }>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          kind: "newsletter",
          email: new FormData(form).get("email"),
        }),
      });
      setStatus(result.message || t.newsletter.subscribed);
      form.reset();
    } catch (err) {
      setStatus((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="newsletter">
      <div>
        <span className="eyebrow">{t.newsletter.eyebrow}</span>
        <h2>{t.newsletter.title}</h2>
        <p>{t.newsletter.body}</p>
      </div>
      <form onSubmit={submit}>
        <div className="subscribe-field">
          <label className="sr-only" htmlFor="newsletter-email">
            {t.newsletter.emailLabel}
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder={t.newsletter.emailPlaceholder}
          />
          <button disabled={busy} aria-label={t.newsletter.subscribe}>
            {busy ? "…" : <ArrowUpRight size={23} />}
          </button>
        </div>
        <small>{t.newsletter.consent}</small>
        <p className="subscribe-status" role="status">
          {status}
        </p>
      </form>
    </section>
  );
}

export default function App() {
  const { lang, setLang, t } = useLang();
  const mainRef = useRef<HTMLElement>(null);
  useScrollReveal(mainRef);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const [page, setPage] = useState<Page>(readPage);
  const [menu, setMenu] = useState(false);
  const [content, setContent] = useState<Content>({ events: [], news: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<Modal | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ClubEvent | null>(null);
  const [eventTab, setEventTab] = useState("upcoming");
  // An empty category means every category.
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "stage" | "life">("all");
  const refresh = useCallback(async () => {
    try {
      const data = await api<Content>("/content");
      setContent(data);
      setError("");
    } catch (err) {
      setError(
        (err as Error).message ||
          "Could not connect to the club backend. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refresh();
    const listener = () => {
      setPage(readPage());
      setMenu(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, [refresh]);
  function go(next: Page) {
    window.location.hash = next;
    if (next === page) window.scrollTo({ top: 0, behavior: "smooth" });
    setMenu(false);
  }
  const upcoming = content.events
    .filter((event) => eventEnd(event.date) >= Date.now())
    .sort((a, b) => eventStart(a.date) - eventStart(b.date));
  const shownEvents = content.events
    .filter(
      (event) =>
        eventEnd(event.date) >= Date.now() === (eventTab === "upcoming") &&
        (!category || event.category === category) &&
        `${event.title} ${event.venue}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      eventTab === "upcoming"
        ? eventStart(a.date) - eventStart(b.date)
        : eventStart(b.date) - eventStart(a.date),
    );
  const sortedNews = [...content.news].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
          document.getElementById("main")?.scrollIntoView();
        }}
      >
        {t.skip}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#home" aria-label={t.homeLabel}>
            <Brand />
          </a>
          <nav
            aria-label={t.mainNav}
            className={menu ? "main-nav open" : "main-nav"}
          >
            {pages.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className={page === item ? "active" : ""}
                aria-current={page === item ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {t.pages[item]}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="button green header-join"
              onClick={() => setModal({ kind: "membership" })}
            >
              {t.joinClub}
              <ArrowUpRight size={16} />
            </button>
            <button
              className="lang-toggle"
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              aria-label={t.switchLabel}
              lang={lang === "en" ? "th" : "en"}
            >
              <Languages size={15} />
              {t.switchTo}
            </button>
          </div>
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? t.closeMenu : t.openMenu}
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="main" tabIndex={-1} ref={mainRef}>
        {page === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="live-dot" />
                  {t.hero.eyebrow}
                </span>
                <h1>{t.hero.title}</h1>
                <p>{t.hero.body}</p>
                <div className="hero-actions">
                  <button className="button green" onClick={() => go("events")}>
                    {t.hero.explore}
                    <ArrowUpRight size={18} />
                  </button>
                  <button className="button plain" onClick={() => go("about")}>
                    {t.hero.getToKnow}
                    <ArrowRight size={17} />
                  </button>
                </div>
                <div className="hero-members">
                  <div className="avatar-stack">
                    {[
                      "royal-vocalist",
                      "royal-bass",
                      "royal-singer",
                      "hero-vocal",
                    ].map((id) => (
                      <img src={photo(id, 80)} key={id} alt="" />
                    ))}
                  </div>
                  <p>
                    <b>{t.hero.members}</b>
                    <span>{t.hero.since}</span>
                  </p>
                </div>
              </div>
              <div className="hero-visual">
                <HeroSlideshow />
                <span className="photo-corner">{t.hero.photoCorner}</span>
                <div className="hero-note">
                  <span className="note-icon">
                    <Music2 size={22} />
                  </span>
                  <span>{t.hero.note}</span>
                  <Heart size={18} />
                </div>
                <span className="handwritten">{t.hero.handwritten}</span>
              </div>
            </section>
            <div
              className={`marquee${marqueePaused ? " paused" : ""}`}
              aria-label={t.marquee.label}
            >
              <div className="marquee-track" aria-hidden="true">
                {[0, 1].map((group) => (
                  <div className="marquee-group" key={group}>
                    {[0, 1].map((copy) => (
                      <span key={copy}>
                        {t.marquee.words.map((word) => (
                          <Fragment key={word}>
                            {word} <Sparkles />{" "}
                          </Fragment>
                        ))}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <button
                className="marquee-control"
                aria-label={marqueePaused ? t.marquee.playLabel : t.marquee.pauseLabel}
                aria-pressed={marqueePaused}
                onClick={() => setMarqueePaused((paused) => !paused)}
              >
                {marqueePaused ? t.marquee.play : t.marquee.pause}
              </button>
            </div>
            <section className="page-section home-events">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">{t.homeEvents.eyebrow}</span>
                  <h2>{t.homeEvents.title}</h2>
                </div>
                <button className="text-link" onClick={() => go("events")}>
                  {t.homeEvents.all}
                  <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="card-grid">
                {upcoming.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onOpen={() => setSelectedEvent(event)}
                  />
                ))}
              </div>
              {!loading && !error && upcoming.length === 0 && (
                <p className="empty-state">{t.homeEvents.empty}</p>
              )}
            </section>
            <section className="belong-section">
              <div className="belong-photo">
                <img
                  src={photo("club-beach", 1100)}
                  alt={t.belong.photoAlt}
                  loading="lazy"
                />
                <span className="photo-caption">{t.belong.caption}</span>
              </div>
              <div className="belong-copy">
                <span className="eyebrow">{t.belong.eyebrow}</span>
                <h2>{t.belong.title}</h2>
                <p>{t.belong.body}</p>
                <div className="belong-values">
                  <span>
                    <Guitar size={19} />
                    {t.belong.values[0]}
                  </span>
                  <span>
                    <Users size={19} />
                    {t.belong.values[1]}
                  </span>
                  <span>
                    <Heart size={19} />
                    {t.belong.values[2]}
                  </span>
                </div>
                <button className="text-link" onClick={() => go("about")}>
                  {t.belong.story}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </section>
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">{t.homeJournal.eyebrow}</span>
                  <h2>{t.homeJournal.title}</h2>
                </div>
                <button className="text-link" onClick={() => go("journal")}>
                  {t.homeJournal.link}
                  <ArrowUpRight size={17} />
                </button>
              </div>
              <div className="card-grid">
                {sortedNews.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onOpen={() => setModal({ kind: "article", article })}
                  />
                ))}
              </div>
            </section>
            <section className="join-banner">
              <span className="join-doodle">
                <Guitar size={74} strokeWidth={1} />
              </span>
              <div>
                <span className="eyebrow">{t.joinBanner.eyebrow}</span>
                <h2>{t.joinBanner.title}</h2>
                <p>{t.joinBanner.body}</p>
              </div>
              <button
                className="button cream"
                onClick={() => setModal({ kind: "membership" })}
              >
                {t.joinBanner.cta}
                <ArrowUpRight size={18} />
              </button>
            </section>
            <Newsletter />
          </>
        )}
        {page === "events" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">{t.eventsPage.eyebrow}</span>
              <h1>{t.eventsPage.title}</h1>
              <p>{t.eventsPage.body}</p>
            </div>
            <div className="event-toolbar">
              <div className="tabs">
                <button
                  className={eventTab === "upcoming" ? "active" : ""}
                  onClick={() => setEventTab("upcoming")}
                >
                  {t.eventsPage.comingUp} <span>{upcoming.length}</span>
                </button>
                <button
                  className={eventTab === "past" ? "active" : ""}
                  onClick={() => setEventTab("past")}
                >
                  {t.eventsPage.past}
                </button>
              </div>
              <label className="search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.eventsPage.searchPlaceholder}
                  aria-label={t.eventsPage.searchLabel}
                />
              </label>
            </div>
            <div className="filters">
              {[
                "",
                ...new Set(content.events.map((event) => event.category)),
              ].map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item || t.homeEvents.all}
                </button>
              ))}
            </div>
            <div className="card-grid">
              {shownEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onOpen={() => setSelectedEvent(event)}
                />
              ))}
            </div>
            {!loading && !error && shownEvents.length === 0 && (
              <p className="empty-state">{t.eventsPage.empty}</p>
            )}
            <div className="small-callout">
              <CalendarDays size={26} />
              <div>
                <h3>{t.eventsPage.calloutTitle}</h3>
                <p>{t.eventsPage.calloutBody}</p>
              </div>
              <button
                className="button outline"
                onClick={() => setModal({ kind: "booking" })}
              >
                {t.eventsPage.book}
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        )}
        {page === "journal" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">{t.journalPage.eyebrow}</span>
              <h1>{t.journalPage.title}</h1>
              <p>{t.journalPage.body}</p>
            </div>
            <div className="card-grid">
              {sortedNews.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onOpen={() => setModal({ kind: "article", article })}
                />
              ))}
            </div>
            {!loading && !error && !sortedNews.length && (
              <p className="empty-state">{t.journalPage.empty}</p>
            )}
          </section>
        )}
        {page === "gallery" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">{t.galleryPage.eyebrow}</span>
              <h1>{t.galleryPage.title}</h1>
              <p>{t.galleryPage.body}</p>
              <small className="muted">{t.galleryPage.note}</small>
            </div>
            <div className="filters">
              {(["all", "stage", "life"] as const).map((item) => (
                <button
                  key={item}
                  className={galleryFilter === item ? "active" : ""}
                  onClick={() => setGalleryFilter(item)}
                >
                  {t.galleryPage.filters[item]}
                </button>
              ))}
            </div>
            <div className="gallery-grid">
              {gallery.map(
                (item, index) =>
                  (galleryFilter === "all" ||
                    galleryFilter === item.category) && (
                    <button
                      key={item.image}
                      onClick={() => setModal({ kind: "photo", index })}
                    >
                      <img
                        src={photo(item.image)}
                        alt={item.title[lang]}
                        loading="lazy"
                      />
                      <span>
                        <small>{t.galleryPage.filters[item.category]}</small>
                        <b>{item.title[lang]}</b>
                        <ArrowUpRight size={21} />
                      </span>
                    </button>
                  ),
              )}
            </div>
          </section>
        )}
        {page === "about" && (
          <>
            <section className="page-section full-page">
              <div className="page-title">
                <span className="eyebrow">{t.about.eyebrow}</span>
                <h1>{t.about.title}</h1>
                <p>{t.about.body}</p>
              </div>
              <div className="about-grid">
                <img
                  src={photo("run-family", 1100)}
                  alt={t.about.photoAlt}
                />
                <div>
                  <h2>{t.about.heading}</h2>
                  <p>{t.about.p1}</p>
                  <p>{t.about.p2}</p>
                  <button
                    className="button green"
                    onClick={() => setModal({ kind: "membership" })}
                  >
                    {t.about.cta}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>
              <div className="about-stats">
                {t.about.stats.map(([value, label]) => (
                  <div key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <div className="about-details">
                <div>
                  <span className="eyebrow">{t.about.visitEyebrow}</span>
                  <h2>{t.about.visitTitle}</h2>
                  <p>
                    <MapPin size={18} />
                    {t.about.address}
                  </p>
                  <p>
                    <Clock3 size={18} />
                    {t.about.hours}
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setModal({ kind: "booking" })}
                  >
                    {t.about.requestSlot}
                    <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setModal({ kind: "contact" })}
                  >
                    {t.about.contact}
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="faq">
                  <h2>{t.about.faqTitle}</h2>
                  {t.about.faq.map(([question, answer]) => (
                    <details key={question}>
                      <summary>
                        {question}
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
            <Newsletter />
          </>
        )}
        {page === "admin" && <Admin content={content} refresh={refresh} />}
        {loading &&
          (page === "home" || page === "events" || page === "journal") && (
            <p className="loading-state" role="status">
              {t.loading}
            </p>
          )}
        {error && (
          <div className="backend-error" role="alert">
            <p>{t.loadError}</p>
            <button
              className="text-link"
              onClick={() => {
                setLoading(true);
                refresh();
              }}
            >
              {t.tryAgain}
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <a href="#home">
              <Brand light />
            </a>
            <p>{t.footer.tagline}</p>
            <div className="socials">
              <a
                href="https://www.instagram.com/kuacoustic_official/"
                target="_blank"
                rel="noreferrer"
                aria-label="KU Acoustic Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://www.youtube.com/@kuacoustic"
                target="_blank"
                rel="noreferrer"
                aria-label="KU Acoustic YouTube"
              >
                <Youtube size={22} />
              </a>
              <a
                href="https://www.tiktok.com/@kuacousticofficial"
                target="_blank"
                rel="noreferrer"
                aria-label="KU Acoustic TikTok"
              >
                <Music2 size={20} />
              </a>
            </div>
          </div>
          <div className="footer-links">
            <span>{t.footer.explore}</span>
            {pages.slice(1).map((item) => (
              <a href={`#${item}`} key={item}>
                {t.pages[item]}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <span>{t.footer.involved}</span>
            <button onClick={() => setModal({ kind: "membership" })}>
              {t.joinClub}
            </button>
            <button onClick={() => setModal({ kind: "booking" })}>
              {t.eventsPage.book}
            </button>
            <button onClick={() => setModal({ kind: "contact" })}>
              {t.footer.collaborate}
            </button>
          </div>
          <div className="footer-location">
            <span>{t.footer.find}</span>
            <p>{t.footer.address}</p>
            <a
              href="https://maps.app.goo.gl/ZZ6CRGBpMoUELmDs5"
              target="_blank"
              rel="noreferrer"
            >
              {t.footer.map}
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t.footer.copyright(new Date().getFullYear())}</span>
          <a href="#admin">
            {t.footer.admin}
            <ArrowUpRight size={13} />
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            {t.footer.backToTop}
            <ArrowDown size={13} className="up-arrow" />
          </button>
        </div>
      </footer>
      {selectedEvent && (
        <Dialog
          title={selectedEvent.title}
          onClose={() => setSelectedEvent(null)}
        >
          {selectedEvent.image && (
            <img
              className="dialog-cover"
              src={photo(selectedEvent.image)}
              alt={selectedEvent.title}
            />
          )}
          <span className="pill">{selectedEvent.category}</span>
          <div className="event-detail-meta">
            <p>
              <CalendarDays size={17} />
              {dateLabel(selectedEvent.date, undefined, t.locale)}
              {timeKnown(selectedEvent.date)
                ? ` · ${t.time(clock(selectedEvent.date))}`
                : t.event.startTba}
            </p>
            <p>
              <MapPin size={17} />
              {selectedEvent.venue}
            </p>
          </div>
          <p>{selectedEvent.description}</p>
          {selectedEvent.sample && (
            <p className="sample-note">{t.event.sampleNote}</p>
          )}
          {eventEnd(selectedEvent.date) >= Date.now() ? (
            <>
              <p className="muted">
                {t.event.free}
                {selectedEvent.capacity != null &&
                  t.event.places(
                    Math.max(0, selectedEvent.capacity - selectedEvent.registered),
                  )}
              </p>
              <div className="dialog-actions">
                <button
                  className="button green"
                  disabled={
                    selectedEvent.capacity != null &&
                    selectedEvent.registered >= selectedEvent.capacity
                  }
                  onClick={() => {
                    setModal({ kind: "registration", event: selectedEvent });
                    setSelectedEvent(null);
                  }}
                >
                  {t.event.saveSpot}
                  <ArrowUpRight size={17} />
                </button>
                <button
                  className="button outline"
                  onClick={() => downloadCalendar(selectedEvent)}
                >
                  {t.event.addCalendar}
                  <CalendarDays size={16} />
                </button>
              </div>
            </>
          ) : !selectedEvent.link ? (
            <p className="muted">{t.event.ended}</p>
          ) : null}
          {selectedEvent.link && (
            <a
              className="button green"
              href={selectedEvent.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.event.watchVideo}
              <Youtube size={18} />
            </a>
          )}
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            modal.kind === "article"
              ? localizeArticle(modal.article, lang).title
              : modal.kind === "photo"
                ? gallery[modal.index].title[lang]
                : t.modalTitles[modal.kind]
          }
          onClose={() => setModal(null)}
          wide={modal.kind === "photo"}
        >
          {modal.kind === "article" ? (
            <ArticleBody article={localizeArticle(modal.article, lang)} />
          ) : modal.kind === "photo" ? (
            <>
              <img
                className="lightbox-photo"
                src={photo(gallery[modal.index].image, 1600)}
                alt={gallery[modal.index].title[lang]}
              />
              <div className="lightbox-controls">
                <button
                  className="button outline"
                  onClick={() =>
                    setModal({
                      kind: "photo",
                      index:
                        (modal.index + gallery.length - 1) % gallery.length,
                    })
                  }
                >
                  {t.galleryPage.previous}
                </button>
                <span>
                  {modal.index + 1} / {gallery.length}
                </span>
                <button
                  className="button outline"
                  onClick={() =>
                    setModal({
                      kind: "photo",
                      index: (modal.index + 1) % gallery.length,
                    })
                  }
                >
                  {t.galleryPage.next}
                </button>
              </div>
            </>
          ) : (
            <CommunityForm
              key={modal.kind}
              kind={modal.kind}
              event={modal.event}
              onComplete={refresh}
            />
          )}
        </Dialog>
      )}
    </>
  );
}
/** Bangkok wall-clock time, e.g. "19:00". */
function clock(date: string) {
  return new Date(date).toLocaleTimeString("en-GB", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function downloadCalendar(event: ClubEvent) {
  const clean = (value: string) =>
    value
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const stamp = (time: number) =>
    new Date(time)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const start = eventStart(event.date);
  const allDay = !timeKnown(event.date);
  // An all-day VEVENT uses date values, and DTEND is the exclusive next day.
  const day = (time: number) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" })
      .format(new Date(time))
      .replace(/-/g, "");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KU Acoustic//Club Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@kuacoustic`,
    `DTSTAMP:${stamp(Date.now())}`,
    ...(allDay
      ? [
          `DTSTART;VALUE=DATE:${day(start)}`,
          `DTEND;VALUE=DATE:${day(start + 86400000)}`,
        ]
      : [`DTSTART:${stamp(start)}`, `DTEND:${stamp(start + 3600000)}`]),
    `SUMMARY:${clean(event.title)}`,
    `LOCATION:${clean(event.venue)}`,
    `DESCRIPTION:${clean(event.description + (event.sample ? " (Sample event, not a confirmed club date.)" : "") + (allDay ? " The start time has not been announced yet." : " End time is estimated at one hour."))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.id}.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
