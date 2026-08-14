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
  link?: string;
};

export const shows: Show[] = [
  {
    id: "s7",
    status: "upcoming",
    day: "18",
    month: "SEP",
    year: "2026",
    title: "KU Acoustic Open World",
    venue: "Chakkraphan Pensiri",
    time: "NA",
    tag: "Full Band",
  },
  {
    id: "s6",
    status: "upcoming",
    day: "22",
    month: "SEP",
    year: "2026",
    title: "First Meet",
    venue: "NA",
    time: "NA",
    tag: "Full Band, Acoustic",
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
    day: "25",
    month: "FEB",
    year: "2026",
    title: "KU Acoustic Run In Rhythm Concert",
    venue: "Prasert Na Nagara Theatre",
    time: "16.30-20.30",
    tag: "Full Band",
    link: "https://www.youtube.com/live/ib7OgoWOZQ8",
  },
  {
    id: "s3",
    status: "past",
    day: "17",
    month: "JUL",
    year: "2026",
    title: "KU Acoustic Truck",
    venue: "KU Central Cafeteria 1",
    time: "17.00-18.00",
    tag: "Acoustic",
  },
  {
    id: "s2",
    status: "past",
    day: "26",
    month: "JUL",
    year: "2026",
    title: "KU Acoustic FRESHY DAY FRESHY NIGHT",
    venue: "Insee Chantarasatit Stadium",
    time: "15.40-16.15",
    tag: "Full Band",
    link: "https://youtu.be/0EWAKp32uhI",
  },
  {
    id: "s1",
    status: "past",
    day: "09",
    month: "AUG",
    year: "2026",
    title: "KU Acoustic Royal Project",
    venue: "Central World",
    time: "18.00-20.00",
    tag: "Acoustic",
  },
];

export type NewsItem = {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  link?: string;
};

export const news: NewsItem[] = [
  {
    id: "n5",
    date: "19 JUL - 7 SEP 2026",
    category: "Recruitment",
    title: "KU Acoustic is now open audition",
    excerpt: "Vocal, Guitar, Bass, Keyboard, Percussion, Technichian, Extra.",
    link: "https://www.instagram.com/p/DbAHm6Jkl_R/",
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
