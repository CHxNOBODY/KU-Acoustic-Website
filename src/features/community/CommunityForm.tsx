import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { api, type ClubEvent } from "@/lib/api";
import { useLang } from "@/lib/i18n";
export type FormKind = "membership" | "registration" | "booking" | "contact";
// Submitted values stay in English so the admin view reads the same either way.
const roles = [
  "Vocals",
  "Guitar",
  "Bass",
  "Keyboard",
  "Drums & percussion",
  "Sound & production",
  "Photography & creative",
  "Music lover",
];
export default function CommunityForm({
  kind,
  event,
  onComplete,
}: {
  kind: FormKind;
  event?: ClubEvent;
  onComplete: () => void;
}) {
  const { t } = useLang();
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
            ? t.form.successRegistration
            : t.form.successOther}
        </h3>
        <p>
          {kind === "registration"
            ? t.form.successRegistrationBody
            : t.form.successOtherBody}
        </p>
      </div>
    );
  return (
    <>
      <p className="form-intro">
        {kind === "membership"
          ? t.form.introMembership
          : kind === "booking"
            ? t.form.introBooking
            : kind === "contact"
              ? t.form.introContact
              : t.form.introRegistration(event?.title ?? "", !!event?.sample)}
      </p>
      <form className="club-form" onSubmit={submit}>
        <label>
          {t.form.name}
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder={t.form.namePlaceholder}
          />
        </label>
        <label>
          {t.form.email}
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
              {t.form.faculty}
              <input
                name="faculty"
                required
                maxLength={100}
                placeholder={t.form.facultyPlaceholder}
              />
            </label>
            <label>
              {t.form.interested}
              <select name="role" required>
                <option value="">{t.form.chooseRole}</option>
                {roles.map((role, i) => (
                  <option key={role} value={role}>
                    {t.form.roles[i]}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {kind === "booking" && (
          <>
            <label>
              {t.form.date}
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
                {t.form.startTime}
                <select name="time" required>
                  {Array.from({ length: 8 }, (_, i) => `${i + 13}:00`).map(
                    (time) => (
                      <option key={time}>{time}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                {t.form.duration}
                <select name="duration">
                  {[1, 2, 3].map((hours) => (
                    <option key={hours} value={hours}>
                      {t.form.hours(hours)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        {kind !== "registration" && (
          <label>
            {kind === "contact" ? t.form.message : t.form.anythingElse}
            <textarea
              name="message"
              rows={3}
              maxLength={2000}
              required={kind === "contact"}
              placeholder={
                kind === "membership"
                  ? t.form.aboutYouPlaceholder
                  : t.form.otherPlaceholder
              }
            />
          </label>
        )}
        <label className="checkbox-label">
          <input type="checkbox" required />
          {t.form.consent}
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button green" disabled={busy}>
          {busy
            ? t.form.sending
            : t.form.submit[kind]}
          <ArrowUpRight size={17} />
        </button>
      </form>
    </>
  );
}
