export type ShowStatus = "upcoming" | "past";

export type Show = {
  id: string;
  status: ShowStatus;
  day: string;
  month: string;
  year: string;
  title: string;
  venue: string;
  time: string;
  tag: string;
  /** When set, the whole show row becomes a link that opens in a new tab. */
  link?: string;
};
