export type ClubEvent = {
  id: string;
  title: string;
  category: string;
  date: string;
  venue: string;
  description: string;
  capacity: number;
  registered: number;
  image: string;
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
export const photo = (id: string, width = 900) =>
  `/images/club/${id}-${width}.webp`;
export const dateLabel = (
  date: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  },
) =>
  new Date(date).toLocaleDateString("en-US", {
    ...options,
    timeZone: "Asia/Bangkok",
  });
