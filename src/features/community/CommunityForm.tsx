import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  AudioLines,
  CheckCircle2,
  Drum,
  Guitar,
  Mic,
  Piano,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { api, type ClubEvent } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import DatePicker from "./DatePicker";
export type FormKind = "membership" | "registration" | "booking" | "contact";
// Submitted values stay in English so the admin view reads the same either way.
const roles = [
  "Vocals",
  "Guitar",
  "Bass",
  "Keyboard",
  "Drums & percussion",
  "Technician",
];
// One icon per role, in the same order as roles.
const roleIcons: LucideIcon[] = [
  Mic,
  Guitar,
  AudioLines,
  Piano,
  Drum,
  SlidersHorizontal,
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
  const [date, setDate] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // The custom date picker has no native "required" check.
    if (kind === "booking" && !date) {
      setError(t.form.dateRequired);
      return;
    }
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
            <fieldset className="time-picker">
              <legend>{t.form.interested}</legend>
              <div className="time-options roles">
                {roles.map((role, i) => {
                  const Icon = roleIcons[i];
                  return (
                    <label key={role}>
                      <input type="radio" name="role" value={role} required />
                      <span>
                        <Icon size={16} />
                        {t.form.roles[i]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </>
        )}
        {kind === "booking" && (
          <>
            <div className="field">
              <span className="field-label">{t.form.date}</span>
              <DatePicker
                name="date"
                value={date}
                onChange={(value) => {
                  setDate(value);
                  setError("");
                }}
                min={new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Bangkok",
                }).format(new Date())}
              />
            </div>
            {/* Time and duration chips instead of native selects, whose open
                list the browser draws and CSS cannot style. */}
            <fieldset className="time-picker">
              <legend>{t.form.startTime}</legend>
              <div className="time-options">
                {Array.from({ length: 8 }, (_, i) => `${i + 13}:00`).map(
                  (time, i) => (
                    <label key={time}>
                      <input
                        type="radio"
                        name="time"
                        value={time}
                        required
                        defaultChecked={i === 0}
                      />
                      <span>{time}</span>
                    </label>
                  ),
                )}
              </div>
            </fieldset>
            <fieldset className="time-picker">
              <legend>{t.form.duration}</legend>
              <div className="time-options three">
                {[1, 2, 3].map((hours) => (
                  <label key={hours}>
                    <input
                      type="radio"
                      name="duration"
                      value={hours}
                      defaultChecked={hours === 1}
                    />
                    <span>{t.form.hours(hours)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
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
