export type Show = {
  id: string;
  status: "upcoming" | "past";
  day: string;
  month: string;
  year: string;
  title: string;
  venue: string;
  time: string;
  tag: string;
};

export const shows: Show[] = [
  {
    id: "s7",
    status: "upcoming",
    day: "14",
    month: "AUG",
    year: "2026",
    title: "Acoustic Night Vol. 12",
    venue: "Activity Hall, Ground Floor",
    time: "18:30",
    tag: "Full Band Show",
  },
  {
    id: "s6",
    status: "upcoming",
    day: "29",
    month: "AUG",
    year: "2026",
    title: "Open Mic Friday",
    venue: "Courtyard Stage",
    time: "17:00",
    tag: "Open Mic",
  },
  {
    id: "s5",
    status: "upcoming",
    day: "19",
    month: "SEP",
    year: "2026",
    title: "Freshers' Welcome Session",
    venue: "Music Room 2",
    time: "16:00",
    tag: "Members Only",
  },
  {
    id: "s4",
    status: "past",
    day: "22",
    month: "JUN",
    year: "2026",
    title: "Rainy Season Sessions",
    venue: "Activity Hall, Ground Floor",
    time: "18:00",
    tag: "Full Band Show",
  },
  {
    id: "s3",
    status: "past",
    day: "03",
    month: "MAY",
    year: "2026",
    title: "Unplugged: Senior Farewell",
    venue: "Courtyard Stage",
    time: "17:30",
    tag: "Special Show",
  },
  {
    id: "s2",
    status: "past",
    day: "14",
    month: "FEB",
    year: "2026",
    title: "Songs for a Rainy Heart",
    venue: "Music Room 2",
    time: "19:00",
    tag: "Duo Set",
  },
  {
    id: "s1",
    status: "past",
    day: "09",
    month: "NOV",
    year: "2025",
    title: "Acoustic Night Vol. 11",
    venue: "Activity Hall, Ground Floor",
    time: "18:30",
    tag: "Full Band Show",
  },
];

export type NewsItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
};

export const news: NewsItem[] = [
  {
    id: "n5",
    date: "28 JUL 2026",
    category: "Recruitment",
    title: "Sign-ups open for the new semester",
    excerpt:
      "Guitar, bass, keys, vocals, drums — no audition, no experience needed. Just bring your ears and show up on Tuesdays.",
  },
  {
    id: "n4",
    date: "12 JUL 2026",
    category: "Recording",
    title: "Our first live session tape is out",
    excerpt:
      "Four songs recorded in one take in Music Room 2, mixed by two of our members over the semester break.",
  },
  {
    id: "n3",
    date: "25 JUN 2026",
    category: "Recap",
    title: "Rainy Season Sessions, in photos",
    excerpt:
      "A wet Saturday, a full house, and a set list built entirely from covers picked by the audience.",
  },
  {
    id: "n2",
    date: "30 APR 2026",
    category: "Notice",
    title: "Practice rooms move to building C",
    excerpt:
      "Starting next month, Tuesday and Thursday sessions move rooms while the old space gets rewired.",
  },
  {
    id: "n1",
    date: "20 MAR 2026",
    category: "Recap",
    title: "Thank you to everyone who came out",
    excerpt:
      "Songs for a Rainy Heart sold out the room. Recordings are being passed around the group chat now.",
  },
];
