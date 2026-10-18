export type ClubEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  description: string;
  /** Absent when the event has no guest limit. */
  capacity?: number;
  registered: number;
  /** Absent when no photo has been supplied for the event. */
  image?: string;
  sample: boolean;
  link?: string;
};
export type Article = {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  body: string;
  image: string;
};
export type Content = { events: ClubEvent[]; news: Article[] };
export type Submission = {
  id: string;
  kind: string;
  email: string;
  status: string;
  created: string;
  data: Record<string, string | number>;
};
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "The request could not be completed.");
  return data as T;
}
/**
 * An event date is either a full ISO timestamp or, when the club has not
 * announced a start time, a plain YYYY-MM-DD day.
 */
export const timeKnown = (date: string) => !/^\d{4}-\d{2}-\d{2}$/.test(date);
/** A day without a time starts at midnight in Bangkok. */
export const eventStart = (date: string) =>
  Date.parse(timeKnown(date) ? date : `${date}T00:00:00+07:00`);
/** ...and stays upcoming until that day ends there. */
export const eventEnd = (date: string) =>
  Date.parse(timeKnown(date) ? date : `${date}T23:59:59+07:00`);
export const photo = (id: string, width = 900) =>
  `/images/club/${id}-${width}.webp`;
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
  locale = "en-US",
) =>
  new Date(date).toLocaleDateString(locale, {
    ...options,
    timeZone: "Asia/Bangkok",
  });
