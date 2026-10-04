import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { api, type ClubEvent } from "@/lib/api";
export type FormKind = "membership" | "registration" | "booking" | "contact";
export default function CommunityForm({
  kind,
  event,
  onComplete,
}: {
  kind: FormKind;
  event?: ClubEvent;
  onComplete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await api("/submissions", {
        method: "POST",
        body: JSON.stringify({ ...values, kind, eventId: event?.id }),
      });
      setSuccess(true);
      onComplete();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (success)
    return (
      <div className="form-success" role="status">
        <CheckCircle2 size={48} />
        <h3>
          {kind === "registration"
            ? "You’re on the list."
            : "We’ve received your request."}
        </h3>
        <p>
          {kind === "registration"
            ? "Your registration is saved. Keep the event date handy — we can’t wait to see you."
            : "The club committee will review your submission and follow up using your email address."}
        </p>
      </div>
    );
  return (
    <>
      <p className="form-intro">
        {kind === "membership"
          ? "Musicians, singers, sound crew, and music lovers. There’s a place for you here — no experience required."
          : kind === "booking"
            ? "Request the clubroom for your next rehearsal. Weekdays 16:00–21:00 · Weekends 13:00–18:00 (Bangkok time). All requests need committee approval."
            : kind === "contact"
              ? "Planning a collaboration or have a question? Leave a message for our committee."
              : `Reserve your place at ${event?.title}. Admission is free.${event?.sample ? " This is a sample event; registrations are for demonstration." : ""}`}
      </p>
      <form className="club-form" onSubmit={submit}>
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="First and last name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
        {kind === "membership" && (
          <>
            <label>
              Faculty / affiliation
              <input
                name="faculty"
                required
                maxLength={100}
                placeholder="e.g. Faculty of Engineering"
              />
            </label>
            <label>
              I’m interested in
              <select name="role" required>
                <option value="">Choose your role</option>
                {[
                  "Vocals",
                  "Guitar",
                  "Bass",
                  "Keyboard",
                  "Drums & percussion",
                  "Sound & production",
                  "Photography & creative",
                  "Music lover",
                ].map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
          </>
        )}
        {kind === "booking" && (
          <>
            <label>
              Rehearsal date
              <input
                name="date"
                type="date"
                required
                min={new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Bangkok",
                }).format(new Date())}
              />
            </label>
            <div className="form-row">
              <label>
                Start time
                <select name="time" required>
                  {Array.from({ length: 8 }, (_, i) => `${i + 13}:00`).map(
                    (time) => (
                      <option key={time}>{time}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Duration
                <select name="duration">
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                </select>
              </label>
            </div>
          </>
        )}
        {kind !== "registration" && (
          <label>
            {kind === "contact" ? "Your message" : "Anything else? (optional)"}
            <textarea
              name="message"
              rows={3}
              maxLength={2000}
              required={kind === "contact"}
              placeholder={
                kind === "membership"
                  ? "Tell us a little about yourself and your music."
                  : "What would you like us to know?"
              }
            />
          </label>
        )}
        <label className="checkbox-label">
          <input type="checkbox" required />I agree to the club storing these
          details to handle my request.
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button green" disabled={busy}>
          {busy
            ? "Sending…"
            : kind === "registration"
              ? "Register for event"
              : kind === "membership"
                ? "Send application"
                : kind === "booking"
                  ? "Request rehearsal slot"
                  : "Send message"}
          <ArrowUpRight size={17} />
        </button>
      </form>
    </>
  );
}
