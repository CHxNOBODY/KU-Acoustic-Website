import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Download,
  LogOut,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  api,
  dateLabel,
  type Article,
  type ClubEvent,
  type Content,
  type Submission,
} from "@/lib/api";
export default function Admin({
  content,
  refresh,
}: {
  content: Content;
  refresh: () => void;
}) {
  const [signedIn, setSignedIn] = useState(false);
  const [rows, setRows] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const [kind, setKind] = useState("events");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<ClubEvent | Article | null>(null);
  const eventDraft = editing && "venue" in editing ? editing : null;
  const articleDraft = editing && "body" in editing ? editing : null;
  async function load() {
    const data = await api<Submission[]>("/admin/submissions");
    setRows(data);
    setSignedIn(true);
  }
  useEffect(() => {
    load().catch(() => {});
  }, []);
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = new FormData(e.currentTarget).get("token");
    setBusy(true);
    setError("");
    try {
      await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function update(id: string, status: string) {
    setError("");
    try {
      await api(`/admin/submissions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
      refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }
  async function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setNotice("");
    const values = Object.fromEntries(new FormData(form));
    if (kind === "events") values.date = `${values.date}:00+07:00`;
    try {
      await api("/admin/content", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify({ ...values, kind, id: editing?.id }),
      });
      form.reset();
      setEditing(null);
      refresh();
      setNotice("Published to the website.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(type: string, id: string) {
    if (
      !window.confirm(
        "Remove this item from the website? Existing submissions will be retained.",
      )
    )
      return;
    try {
      await api(`/admin/content/${type}/${id}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }
  if (!signedIn)
    return (
      <section className="admin-login">
        <span className="eyebrow">FOR THE PEOPLE BEHIND THE MUSIC</span>
        <h1>Club dashboard</h1>
        <p>Sign in with the access key configured on the backend.</p>
        <form className="club-form" onSubmit={login}>
          <label>
            Admin access key
            <input
              name="token"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button green" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
            <ArrowUpRight size={16} />
          </button>
        </form>
      </section>
    );
  return (
    <section className="page-section admin">
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE BACKSTAGE AREA</span>
          <h1>Club dashboard</h1>
        </div>
        <button
          className="button outline"
          onClick={async () => {
            try {
              await api("/admin/logout", { method: "POST", body: "{}" });
              setSignedIn(false);
              setRows([]);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="dashboard-stats">
        {["membership", "registration", "booking", "newsletter"].map((type) => (
          <div key={type}>
            <strong>{rows.filter((row) => row.kind === type).length}</strong>
            <span>
              {type === "membership"
                ? "Applications"
                : type === "registration"
                  ? "Registrations"
                  : type === "booking"
                    ? "Rehearsal requests"
                    : "Subscribers"}
            </span>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h2>Incoming requests</h2>
        <button
          className="button outline"
          onClick={() =>
            exportSubmissions(
              rows.filter((row) => filter === "all" || row.kind === filter),
            )
          }
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      <div className="filters">
        {[
          "all",
          "membership",
          "registration",
          "booking",
          "contact",
          "newsletter",
        ].map((type) => (
          <button
            key={type}
            className={filter === type ? "active" : ""}
            onClick={() => setFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="requests">
        {rows.filter((row) => filter === "all" || row.kind === filter)
          .length === 0 && (
          <p className="empty-state">
            No submissions here yet. New requests will appear in this dashboard.
          </p>
        )}
        {rows
          .filter((row) => filter === "all" || row.kind === filter)
          .map((row) => (
            <article className="request" key={row.id}>
              <div>
                <span className="eyebrow">
                  {row.kind} · {dateLabel(row.created)}
                </span>
                <h3>{row.data.name || row.email}</h3>
                <a href={`mailto:${row.email}`}>{row.email}</a>
                <dl>
                  {Object.entries(row.data)
                    .filter(([key]) => !["name", "email"].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{String(value)}</dd>
                      </div>
                    ))}
                </dl>
              </div>
              <label>
                Status
                <select
                  aria-label={`Status for ${row.data.name || row.email}`}
                  value={row.status}
                  onChange={(e) => update(row.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
            </article>
          ))}
      </div>
      <div className="admin-content">
        <div>
          <h2>{editing ? "Edit published content" : "Publish an update"}</h2>
          <div className="filters">
            <button
              className={kind === "events" ? "active" : ""}
              onClick={() => {
                setKind("events");
                setEditing(null);
                setNotice("");
              }}
            >
              Event
            </button>
            <button
              className={kind === "news" ? "active" : ""}
              onClick={() => {
                setKind("news");
                setEditing(null);
                setNotice("");
              }}
            >
              Journal post
            </button>
          </div>
          <form
            className="club-form"
            onSubmit={publish}
            key={editing?.id || kind}
            id="content-editor"
          >
            <label>
              Title
              <input
                name="title"
                required
                maxLength={120}
                defaultValue={editing?.title}
              />
            </label>
            <div className="form-row">
              <label>
                Date (Bangkok)
                <input
                  name="date"
                  type={kind === "events" ? "datetime-local" : "date"}
                  required
                  defaultValue={
                    editing
                      ? kind === "events"
                        ? new Date(editing.date)
                            .toLocaleString("sv-SE", {
                              timeZone: "Asia/Bangkok",
                            })
                            .slice(0, 16)
                            .replace(" ", "T")
                        : editing.date.slice(0, 10)
                      : ""
                  }
                />
              </label>
              <label>
                Category
                <input
                  name="category"
                  required
                  maxLength={50}
                  defaultValue={editing?.category}
                />
              </label>
            </div>
            {kind === "events" ? (
              <>
                <div className="form-row">
                  <label>
                    Venue
                    <input
                      name="venue"
                      required
                      maxLength={200}
                      defaultValue={eventDraft?.venue}
                    />
                  </label>
                  <label>
                    Capacity
                    <input
                      name="capacity"
                      type="number"
                      min={1}
                      max={10000}
                      required
                      defaultValue={eventDraft?.capacity}
                    />
                  </label>
                </div>
                <label>
                  Watch video link (optional)
                  <input
                    name="link"
                    type="url"
                    maxLength={2000}
                    placeholder="https://www.youtube.com/watch?v=…"
                    defaultValue={eventDraft?.link || ""}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    required
                    maxLength={3000}
                    defaultValue={eventDraft?.description}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Excerpt
                  <textarea
                    name="excerpt"
                    required
                    maxLength={300}
                    defaultValue={articleDraft?.excerpt}
                  />
                </label>
                <label>
                  Article body
                  <textarea
                    name="body"
                    required
                    rows={6}
                    maxLength={5000}
                    defaultValue={articleDraft?.body}
                  />
                </label>
              </>
            )}
            {notice && <p role="status">{notice}</p>}
            <button className="button green" disabled={busy}>
              <Plus size={16} />
              {busy ? "Saving…" : editing ? "Save changes" : "Publish"}
            </button>
            {editing && (
              <button
                type="button"
                className="button outline"
                onClick={() => setEditing(null)}
              >
                Cancel editing
              </button>
            )}
          </form>
        </div>
        <div>
          <h2>Published content</h2>
          {(["events", "news"] as const).map((type) => (
            <div key={type}>
              <h3 className="content-group">{type}</h3>
              {content[type].map((item) => (
                <div className="content-item" key={item.id}>
                  <span>{item.title}</span>
                  <button
                    className="icon-button"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => {
                      setEditing(item);
                      setKind(type);
                      setNotice("");
                      document
                        .getElementById("content-editor")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                    }}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${item.title}`}
                    onClick={() => remove(type, item.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function exportSubmissions(rows: Submission[]) {
  const fields = [
    "id",
    "kind",
    "name",
    "email",
    "status",
    "created",
    "role",
    "faculty",
    "event",
    "date",
    "time",
    "duration",
    "message",
  ];
  const escape = (value: unknown) => {
    let text = String(value ?? "");
    if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = [
    fields.map(escape).join(","),
    ...rows.map((row) =>
      fields
        .map((key) =>
          escape(key in row ? row[key as keyof Submission] : row.data[key]),
        )
        .join(","),
    ),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ku-acoustic-submissions.csv";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
