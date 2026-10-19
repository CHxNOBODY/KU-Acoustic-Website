import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLang } from "@/lib/i18n";

// A site-styled calendar in place of <input type="date">, whose pop-up the
// browser draws and CSS cannot style. Dates are "YYYY-MM-DD" strings and all
// arithmetic is in UTC so the grid never shifts with the viewer's time zone.
const iso = (date: Date) => date.toISOString().slice(0, 10);
const parse = (value: string) => new Date(`${value}T00:00:00Z`);

export default function DatePicker({
  name,
  min,
  value,
  onChange,
}: {
  name: string;
  min: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => (value || min).slice(0, 7));
  // Which way the last month change went, so the grid slides that way.
  const [direction, setDirection] = useState<"next" | "previous" | "">("");
  const first = parse(`${month}-01`);
  // Weeks start on Sunday, matching the Thai and US calendars.
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setUTCDate(start.getUTCDate() + i);
    return day;
  });
  const format = (options: Intl.DateTimeFormatOptions, date: Date) =>
    date.toLocaleDateString(t.locale, { timeZone: "UTC", ...options });
  function shift(by: number) {
    const next = new Date(first);
    next.setUTCMonth(first.getUTCMonth() + by);
    setDirection(by > 0 ? "next" : "previous");
    setMonth(iso(next).slice(0, 7));
  }
  return (
    <div className="date-picker">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        className={`date-trigger${value ? "" : " empty"}`}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {value
          ? format(
              { weekday: "short", day: "numeric", month: "long", year: "numeric" },
              parse(value),
            )
          : t.form.chooseDate}
        <CalendarDays size={16} />
      </button>
      {open && (
        <div className="calendar">
          <div className="calendar-head">
            <button
              type="button"
              aria-label={t.form.previousMonth}
              disabled={month <= min.slice(0, 7)}
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <b>{format({ month: "long", year: "numeric" }, first)}</b>
            <button
              type="button"
              aria-label={t.form.nextMonth}
              onClick={() => shift(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
          {/* Keyed by month so each change remounts and replays the slide. */}
          <div className={`calendar-grid ${direction}`} key={month}>
            {days.slice(0, 7).map((day) => (
              <span key={iso(day)} className="weekday">
                {format({ weekday: "narrow" }, day)}
              </span>
            ))}
            {days.map((day) => {
              const id = iso(day);
              return (
                <button
                  type="button"
                  key={id}
                  className={[
                    id.slice(0, 7) !== month && "outside",
                    id === min && "today",
                    id === value && "selected",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={id < min}
                  aria-pressed={id === value}
                  aria-label={format({ dateStyle: "full" }, day)}
                  onClick={() => {
                    onChange(id);
                    setOpen(false);
                  }}
                >
                  {day.getUTCDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
