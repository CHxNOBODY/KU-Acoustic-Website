import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
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
  photo,
  type Article,
  type ClubEvent,
  type Content,
} from "@/lib/api";

type Page = "home" | "events" | "journal" | "gallery" | "about" | "admin";
type Modal =
  | { kind: FormKind; event?: ClubEvent }
  | { kind: "article"; article: Article }
  | { kind: "photo"; index: number };
const pages: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "events", label: "Events" },
  { id: "journal", label: "Journal" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "Our story" },
];
const gallery = [
  { image: "run-stage", title: "Run In Rhythm, all together on stage", category: "On stage" },
  { image: "run-vocal", title: "A voice in the spotlight", category: "On stage" },
  { image: "run-guitar", title: "Every chord, a little closer", category: "On stage" },
  { image: "run-duet", title: "Two voices, one stage", category: "On stage" },
  { image: "run-crowd", title: "The crowd is part of the song", category: "Club life" },
  { image: "run-family", title: "The Run In Rhythm family", category: "Club life" },
  {
    image: "kaset-family",
    title: "All together, under the lights",
    category: "On stage",
  },
  {
    image: "hero-vocal",
    title: "A voice. A moment.",
    category: "On stage",
  },
  {
    image: "royal-guitar",
    title: "One chord at a time",
    category: "On stage",
  },
  {
    image: "kaset-stage",
    title: "Nights we won’t forget",
    category: "On stage",
  },
  {
    image: "club-beach",
    title: "Making music, making memories",
    category: "Club life",
  },
  {
    image: "clubroom-friends",
    title: "Right at home in the clubroom",
    category: "Club life",
  },
  {
    image: "freshy-band",
    title: "Freshy Day, full of music",
    category: "On stage",
  },
  {
    image: "freshy-friends",
    title: "The people behind the performance",
    category: "Club life",
  },
  {
    image: "clubroom-circle",
    title: "Our favorite kind of circle",
    category: "Club life",
  },
];
function readPage(): Page {
  const value = window.location.hash.slice(1);
  return [...pages.map((p) => p.id), "admin"].includes(value)
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
  const past = Date.parse(event.date) < Date.now();
  return (
    <article className="event-card">
      <button
        className="event-image"
        onClick={onOpen}
        aria-label={`View ${event.title}`}
      >
        <img
          src={photo(event.image, 750)}
          alt={`${event.category}: ${event.title}`}
          loading="lazy"
        />
        <span className="date-sticker">
          <b>{dateLabel(event.date, { day: "2-digit" })}</b>
          <span>{dateLabel(event.date, { month: "short" })}</span>
        </span>
        <span className="image-tag">{event.category}</span>
      </button>
      <div className="event-info">
        <div className="event-meta">
          {past ? "PAST EVENT" : "COMING UP"}
          <span>{event.sample ? "SAMPLE EVENT" : "KU ACOUSTIC"}</span>
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
            {new Date(event.date).toLocaleTimeString("en-GB", {
              timeZone: "Asia/Bangkok",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ICT
          </span>
          <button onClick={onOpen}>
            {past ? "View recap" : "Event details"}
            <ArrowUpRight size={16} />
          </button>
        </div>
        {event.link && (
          <a className="event-video text-link" href={event.link} target="_blank" rel="noopener noreferrer" aria-label={`Watch video: ${event.title} (opens in a new tab)`}>
            <Youtube size={17} /> Watch video <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    </article>
  );
}
function ArticleCard({
  article,
  onOpen,
}: {
  article: Article;
  onOpen: () => void;
}) {
  return (
    <article className="article-card">
      <button
        onClick={onOpen}
        className="article-image"
        aria-label={`Read ${article.title}`}
      >
        <img
          src={photo(article.image, 750)}
          alt={article.title}
          loading="lazy"
        />
      </button>
      <div className="article-meta">
        <span>{article.category}</span>
        <span>{dateLabel(article.date)}</span>
      </div>
      <button className="title-button" onClick={onOpen}>
        <h3>{article.title}</h3>
      </button>
      <p>{article.excerpt}</p>
      <button className="text-link" onClick={onOpen}>
        Read the story
        <ArrowUpRight size={15} />
      </button>
    </article>
  );
}
function Newsletter() {
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
      setStatus(
        result.message ||
          "You’re on the list! Your subscription has been saved.",
      );
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
        <span className="eyebrow">A LITTLE MUSIC IN YOUR INBOX</span>
        <h2>Stay in the loop.</h2>
        <p>New gigs, club stories, and chances to get involved.</p>
      </div>
      <form onSubmit={submit}>
        <div className="subscribe-field">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            maxLength={254}
            placeholder="Your email address"
          />
          <button disabled={busy} aria-label="Subscribe to club updates">
            {busy ? "…" : <ArrowUpRight size={23} />}
          </button>
        </div>
        <small>
          By subscribing, you agree to the club storing your email for updates.
        </small>
        <p className="subscribe-status" role="status">
          {status}
        </p>
      </form>
    </section>
  );
}

export default function App() {
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
  const [category, setCategory] = useState("All events");
  const [query, setQuery] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("All moments");
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
    .filter((event) => Date.parse(event.date) >= Date.now())
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const shownEvents = content.events
    .filter(
      (event) =>
        Date.parse(event.date) >= Date.now() === (eventTab === "upcoming") &&
        (category === "All events" || event.category === category) &&
        `${event.title} ${event.venue}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      eventTab === "upcoming"
        ? Date.parse(a.date) - Date.parse(b.date)
        : Date.parse(b.date) - Date.parse(a.date),
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
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#home" aria-label="KU Acoustic home">
            <Brand />
          </a>
          <nav
            aria-label="Main navigation"
            className={menu ? "main-nav open" : "main-nav"}
          >
            {pages.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={page === item.id ? "active" : ""}
                aria-current={page === item.id ? "page" : undefined}
                onClick={() => setMenu(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <button
            className="button green header-join"
            onClick={() => setModal({ kind: "membership" })}
          >
            Join the club
            <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button mobile-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
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
                  GOOD MUSIC. GREAT COMPANY.
                </span>
                <h1>
                  Find your sound.
                  <br />
                  Find <em>your people.</em>
                </h1>
                <p>
                  A little acoustic. A little electric. A whole lot of heart.
                  <br className="desktop-break" /> We’re KU Acoustic — a
                  community brought together
                  <br className="desktop-break" /> by the love of making music.
                </p>
                <div className="hero-actions">
                  <button className="button green" onClick={() => go("events")}>
                    Explore our events
                    <ArrowUpRight size={18} />
                  </button>
                  <button className="button plain" onClick={() => go("about")}>
                    Get to know us
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
                    <b>Different voices. One community.</b>
                    <span>Making memories since 1989.</span>
                  </p>
                </div>
              </div>
              <div className="hero-visual">
                <HeroSlideshow />
                <span className="photo-corner">LIVE A LITTLE. PLAY A LOT.</span>
                <div className="hero-note">
                  <span className="note-icon">
                    <Music2 size={22} />
                  </span>
                  <span>
                    More than a music club.
                    <br />
                    <b>A place to belong.</b>
                  </span>
                  <Heart size={18} />
                </div>
                <span className="handwritten">it starts with a song ↗</span>
              </div>
            </section>
            <div
              className={`marquee${marqueePaused ? " paused" : ""}`}
              aria-label="Play. Connect. Create. Belong."
            >
              <div className="marquee-track" aria-hidden="true">
                {[0, 1].map((group) => (
                  <div className="marquee-group" key={group}>
                    {[0, 1].map((copy) => (
                      <span key={copy}>
                        PLAY <Sparkles /> CONNECT <Sparkles /> CREATE <Sparkles />{" "}
                        BELONG <Sparkles />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <button
                className="marquee-control"
                aria-label={marqueePaused ? "Play music banner animation" : "Pause music banner animation"}
                aria-pressed={marqueePaused}
                onClick={() => setMarqueePaused((paused) => !paused)}
              >
                {marqueePaused ? "Play" : "Pause"}
              </button>
            </div>
            <section className="page-section home-events">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">MEET US WHERE THE MUSIC IS</span>
                  <h2>
                    Good things are <em>coming.</em>
                  </h2>
                </div>
                <button className="text-link" onClick={() => go("events")}>
                  All events
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
                <p className="empty-state">
                  The next chapter is still being written. Join our mailing list
                  for new events.
                </p>
              )}
            </section>
            <section className="belong-section">
              <div className="belong-photo">
                <img
                  src={photo("club-beach", 1100)}
                  alt="KU Acoustic members together on a club beach trip"
                  loading="lazy"
                />
                <span className="photo-caption">
                  A SHARED PASSION. A THOUSAND MEMORIES.
                </span>
              </div>
              <div className="belong-copy">
                <span className="eyebrow">MORE THAN THE NOTES</span>
                <h2>
                  Come for the music.
                  <br />
                  Stay for <em>the people.</em>
                </h2>
                <p>
                  From your first chord to your first encore, you don’t have to
                  do it alone. We’re a home for curious beginners, seasoned
                  performers, and everyone who just loves a good song.
                </p>
                <div className="belong-values">
                  <span>
                    <Guitar size={19} />
                    All sounds welcome
                  </span>
                  <span>
                    <Users size={19} />
                    Every faculty, one family
                  </span>
                  <span>
                    <Heart size={19} />
                    Passion over perfection
                  </span>
                </div>
                <button className="text-link" onClick={() => go("about")}>
                  This is our story
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </section>
            <section className="page-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">NOTES FROM THE CLUB</span>
                  <h2>
                    A little behind <em>the scenes.</em>
                  </h2>
                </div>
                <button className="text-link" onClick={() => go("journal")}>
                  The journal
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
                <span className="eyebrow">YOUR NEXT CHAPTER SOUNDS GOOD</span>
                <h2>
                  There’s a place for <em>you</em> here.
                </h2>
                <p>
                  Bring your talent. Bring your curiosity. Just bring yourself.
                </p>
              </div>
              <button
                className="button cream"
                onClick={() => setModal({ kind: "membership" })}
              >
                Find your people
                <ArrowUpRight size={18} />
              </button>
            </section>
            <Newsletter />
          </>
        )}
        {page === "events" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">LET’S MAKE SOME MEMORIES</span>
              <h1>
                Meet us at <em>the next gig.</em>
              </h1>
              <p>
                Live sets, open mics, and a little room to try something new.
              </p>
            </div>
            <div className="event-toolbar">
              <div className="tabs">
                <button
                  className={eventTab === "upcoming" ? "active" : ""}
                  onClick={() => setEventTab("upcoming")}
                >
                  Coming up <span>{upcoming.length}</span>
                </button>
                <button
                  className={eventTab === "past" ? "active" : ""}
                  onClick={() => setEventTab("past")}
                >
                  Past events
                </button>
              </div>
              <label className="search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events…"
                  aria-label="Search events"
                />
              </label>
            </div>
            <div className="filters">
              {[
                "All events",
                ...new Set(content.events.map((event) => event.category)),
              ].map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
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
              <p className="empty-state">
                No events match these filters. Try another category or search.
              </p>
            )}
            <div className="small-callout">
              <CalendarDays size={26} />
              <div>
                <h3>Make room for your next rehearsal.</h3>
                <p>Club members can request a practice slot, right here.</p>
              </div>
              <button
                className="button outline"
                onClick={() => setModal({ kind: "booking" })}
              >
                Book a rehearsal
                <ArrowUpRight size={16} />
              </button>
            </div>
          </section>
        )}
        {page === "journal" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">NOTES FROM THE CLUB</span>
              <h1>
                Stories worth <em>sharing.</em>
              </h1>
              <p>The people, the practice, and everything between the songs.</p>
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
              <p className="empty-state">New stories are on their way.</p>
            )}
          </section>
        )}
        {page === "gallery" && (
          <section className="page-section full-page">
            <div className="page-title">
              <span className="eyebrow">A FEW OF OUR FAVORITE MOMENTS</span>
              <h1>
                Looks like <em>good memories.</em>
              </h1>
              <p>Our music, our stage, and the moments we share in between.</p>
              <small className="muted">
              Photos from Run In Rhythm, Kaset Fair, Royal Project, Freshy Day/Freshy Night,
                and life at KU Acoustic.
              </small>
            </div>
            <div className="filters">
              {["All moments", "On stage", "Club life"].map((item) => (
                <button
                  key={item}
                  className={galleryFilter === item ? "active" : ""}
                  onClick={() => setGalleryFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="gallery-grid">
              {gallery.map(
                (item, index) =>
                  (galleryFilter === "All moments" ||
                    galleryFilter === item.category) && (
                    <button
                      key={item.title}
                      onClick={() => setModal({ kind: "photo", index })}
                    >
                      <img
                        src={photo(item.image)}
                        alt={item.title}
                        loading="lazy"
                      />
                      <span>
                        <small>{item.category}</small>
                        <b>{item.title}</b>
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
                <span className="eyebrow">
                  KASETSART UNIVERSITY · SINCE 1989
                </span>
                <h1>
                  Different voices.
                  <br />
                  <em>One shared love.</em>
                </h1>
                <p>Music brought us here. The people made us stay.</p>
              </div>
              <div className="about-grid">
                <img
                  src={photo("run-family", 1100)}
                  alt="KU Acoustic performers and audience together at Run In Rhythm Concert"
                />
                <div>
                  <h2>
                    A little club.
                    <br />A whole lot of heart.
                  </h2>
                  <p>
                    KU Acoustic is Kasetsart University’s community for anyone
                    who loves to play, sing, create, and listen. Since 1989,
                    we’ve been turning campus afternoons into rehearsals and
                    strangers into bandmates.
                  </p>
                  <p>
                    You don’t need a perfect voice, a fancy guitar, or a
                    particular faculty on your student card. Bring your
                    curiosity and a love of music. We’ll meet you there.
                  </p>
                  <button
                    className="button green"
                    onClick={() => setModal({ kind: "membership" })}
                  >
                    Be part of the story
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </div>
              <div className="about-stats">
                <div>
                  <strong>1989</strong>
                  <span>Where our story began</span>
                </div>
                <div>
                  <strong>40+</strong>
                  <span>Active club members</span>
                </div>
                <div>
                  <strong>4–6</strong>
                  <span>Shows every year</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>Reasons to make music</span>
                </div>
              </div>
              <div className="about-details">
                <div>
                  <span className="eyebrow">DROP BY. SAY HELLO.</span>
                  <h2>Your next favorite place.</h2>
                  <p>
                    <MapPin size={18} />
                    Kasetsart University, Bangkhen, Bangkok
                  </p>
                  <p>
                    <Clock3 size={18} />
                    Mon–Fri 16:00–21:00 · Sat–Sun 13:00–18:00
                  </p>
                  <button
                    className="text-link"
                    onClick={() => setModal({ kind: "booking" })}
                  >
                    Request a rehearsal slot
                    <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="text-link"
                    onClick={() => setModal({ kind: "contact" })}
                  >
                    Contact the committee
                    <ArrowUpRight size={17} />
                  </button>
                </div>
                <div className="faq">
                  <h2>A few things to know.</h2>
                  {[
                    [
                      "Do I need musical experience?",
                      "No. Beginners, experienced musicians, and people who enjoy listening are all welcome. Tell us what you’re interested in through the application form.",
                    ],
                    [
                      "Can students from any faculty join?",
                      "Yes! KU Acoustic welcomes Kasetsart students from every faculty, including creative and production roles beyond performing.",
                    ],
                    [
                      "How do I join?",
                      "Submit a membership application here. Our committee will follow up with the next recruitment or audition details. Submitting an application does not automatically confirm membership.",
                    ],
                    [
                      "How do rehearsal bookings work?",
                      "Select a future date and a time during club hours. Your request reserves the slot while the committee reviews it; access is confirmed after approval.",
                    ],
                  ].map(([question, answer]) => (
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
              Tuning things up… Loading club content.
            </p>
          )}
        {error && (
          <div className="backend-error" role="alert">
            <p>
              The club content could not be loaded. Make sure the backend is
              running.
            </p>
            <button
              className="text-link"
              onClick={() => {
                setLoading(true);
                refresh();
              }}
            >
              Try again
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
            <p>
              Good music. Great company.
              <br />A place to belong.
            </p>
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
            <span>TAKE A LOOK AROUND</span>
            {pages.slice(1).map((item) => (
              <a href={`#${item.id}`} key={item.id}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="footer-links">
            <span>GET INVOLVED</span>
            <button onClick={() => setModal({ kind: "membership" })}>
              Join the club
            </button>
            <button onClick={() => setModal({ kind: "booking" })}>
              Book a rehearsal
            </button>
            <button onClick={() => setModal({ kind: "contact" })}>
              Collaborate with us
            </button>
          </div>
          <div className="footer-location">
            <span>FIND YOUR PEOPLE HERE</span>
            <p>
              Kasetsart University
              <br />
              Bangkhen, Bangkok, Thailand
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Kasetsart+University+Bangkhen"
              target="_blank"
              rel="noreferrer"
            >
              Find us on the map
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} KU Acoustic. Made with a little rhythm
            & a lot of heart.
          </span>
          <a href="#admin">
            Club admin
            <ArrowUpRight size={13} />
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Back to top
            <ArrowDown size={13} className="up-arrow" />
          </button>
        </div>
      </footer>
      {selectedEvent && (
        <Dialog
          title={selectedEvent.title}
          onClose={() => setSelectedEvent(null)}
        >
          <img
            className="dialog-cover"
            src={photo(selectedEvent.image)}
            alt={selectedEvent.title}
          />
          <span className="pill">{selectedEvent.category}</span>
          <div className="event-detail-meta">
            <p>
              <CalendarDays size={17} />
              {dateLabel(selectedEvent.date)} ·{" "}
              {new Date(selectedEvent.date).toLocaleTimeString("en-GB", {
                timeZone: "Asia/Bangkok",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ICT
            </p>
            <p>
              <MapPin size={17} />
              {selectedEvent.venue}
            </p>
          </div>
          <p>{selectedEvent.description}</p>
          {selectedEvent.sample && (
            <p className="sample-note">
              Sample event for demonstrating the new website. This date and
              venue have not been confirmed by the club.
            </p>
          )}
          {Date.parse(selectedEvent.date) >= Date.now() ? (
            <>
              <p className="muted">
                Free admission ·{" "}
                {Math.max(0, selectedEvent.capacity - selectedEvent.registered)}{" "}
                places available
              </p>
              <div className="dialog-actions">
                <button
                  className="button green"
                  disabled={selectedEvent.registered >= selectedEvent.capacity}
                  onClick={() => {
                    setModal({ kind: "registration", event: selectedEvent });
                    setSelectedEvent(null);
                  }}
                >
                  Save me a spot
                  <ArrowUpRight size={17} />
                </button>
                <button
                  className="button outline"
                  onClick={() => downloadCalendar(selectedEvent)}
                >
                  Add to calendar
                  <CalendarDays size={16} />
                </button>
              </div>
            </>
          ) : !selectedEvent.link ? (
            <p className="muted">
              This event has ended. Explore the gallery for more moments.
            </p>
          ) : null}
          {selectedEvent.link && (
            <a
              className="button green"
              href={selectedEvent.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Watch video
              <Youtube size={18} />
            </a>
          )}
        </Dialog>
      )}
      {modal && (
        <Dialog
          title={
            modal.kind === "article"
              ? modal.article.title
              : modal.kind === "photo"
                ? gallery[modal.index].title
                : modal.kind === "membership"
                  ? "Find your people."
                  : modal.kind === "booking"
                    ? "A little room to rehearse."
                    : modal.kind === "contact"
                      ? "Let’s make something happen."
                      : "See you at the show."
          }
          onClose={() => setModal(null)}
          wide={modal.kind === "photo"}
        >
          {modal.kind === "article" ? (
            <>
              <img
                className="dialog-cover"
                src={photo(modal.article.image)}
                alt={modal.article.title}
              />
              <div className="article-meta">
                <span>{modal.article.category}</span>
                <span>{dateLabel(modal.article.date)}</span>
              </div>
              <p className="article-body">{modal.article.body}</p>
            </>
          ) : modal.kind === "photo" ? (
            <>
              <img
                className="lightbox-photo"
                src={photo(gallery[modal.index].image, 1600)}
                alt={gallery[modal.index].title}
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
                  Previous
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
                  Next
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
  const start = Date.parse(event.date);
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KU Acoustic//Club Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@kuacoustic`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(start + 3600000)}`,
    `SUMMARY:${clean(event.title)}`,
    `LOCATION:${clean(event.venue)}`,
    `DESCRIPTION:${clean(event.description + (event.sample ? " (Sample event, not a confirmed club date.)" : "") + " End time is estimated at one hour.")}`,
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
