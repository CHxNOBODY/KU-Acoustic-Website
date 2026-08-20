export type NewsItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  /** When set, the news title becomes a link that opens in a new tab. */
  link?: string;
};
