export const events = [
  {
    id: "open-mic",
    title: "A little stage. A lot of soul.",
    category: "Open mic",
    date: "2026-10-23T17:00:00+07:00",
    venue: "KU Acoustic Clubroom",
    description:
      "Bring your favorite song, meet your next bandmate, or just come along to listen. Everyone is welcome at our acoustic open mic.",
    capacity: 60,
    image: "royal-vocals",
    sample: true,
  },
  {
    id: "guitar-workshop",
    title: "Find your rhythm",
    category: "Workshop",
    date: "2026-11-07T14:00:00+07:00",
    venue: "KU Acoustic Clubroom",
    description:
      "A relaxed introduction to guitar, from your first chords to playing with friends. All skill levels are welcome. Bring a guitar if you have one.",
    capacity: 25,
    image: "kaset-guitar",
    sample: true,
  },
  {
    id: "sunset-session",
    title: "The sunset sessions",
    category: "Live music",
    date: "2026-11-20T17:30:00+07:00",
    venue: "Kasetsart University, Bangkhen",
    description:
      "An evening of acoustic favorites and original songs with our club musicians. Settle in, slow down, and enjoy the music.",
    capacity: 120,
    image: "kaset-stage",
    sample: true,
  },
  {
    id: "run-in-rhythm",
    title: "Run In Rhythm Concert",
    category: "Live music",
    date: "2026-02-25T16:30:00+07:00",
    venue: "Prasert Na Nagara Theatre",
    description:
      "Revisit our Run In Rhythm concert and the people who brought it to life.",
    capacity: 300,
    image: "run-stage",
    link: "https://www.youtube.com/live/ib7OgoWOZQ8?si=IiGXu8RoNbARWbDo",
    sample: false,
  },
];
export const news = [
  {
    id: "welcome",
    title: "Your people. Your music. Your place.",
    category: "Club life",
    date: "2026-10-05",
    excerpt:
      "A home for every kind of music lover. Discover what life at KU Acoustic is all about.",
    body: "Since 1989, KU Acoustic has brought students together through music. Whether you sing, play an instrument, work behind the sound desk, or simply enjoy a good song, there is a place for you here. Send a membership application to introduce yourself and the committee will follow up about the next intake.",
    image: "freshy-friends",
  },
  {
    id: "auditions",
    title: "A new chapter starts with you",
    category: "Recruitment",
    date: "2026-09-07",
    excerpt:
      "Our previous audition round welcomed vocalists, musicians, and the crew behind the scenes.",
    body: "The July 19–September 7, 2026 audition round has ended. We welcomed vocal, guitar, bass, keyboard, percussion, technician, and other creative roles. You can still register your interest through the membership form to hear about the next round.",
    image: "freshy-band",
  },
  {
    id: "practice",
    title: "Good things happen in the practice room",
    category: "Behind the scenes",
    date: "2026-08-20",
    excerpt:
      "A few chords, a shared idea, and the beginning of something special.",
    body: "Our rehearsals are where songs become shared memories. Regular club hours are Monday–Friday, 16:00–21:00, and Saturday–Sunday, 13:00–18:00. Members can request a rehearsal slot on the website. The committee reviews each request before confirming access.",
    image: "clubroom-jam",
  },
];

// Original club show archive, retained from the previous website.
export const archive = [
  {
    id: "open-world",
    title: "KU Club Exhibition",
    link: "https://youtu.be/L_xYNuuvxO4?si=vIbX1RbkYNPAtqiE",
    date: "2026-09-18T16:00:00+07:00",
    venue: "Chakkraphan Pensiri",
    category: "Full band",
  },
  {
    id: "wave-of-vibes",
    title: "Wave of Vibes Concert",
    date: "2025-03-03T16:00:00+07:00",
    venue: "Kasetsart University Rugby Field",
    category: "Full band",
    link: "https://www.youtube.com/live/GM2EAHC6cPk?si=TOWIRsxmzUj1HR_m",
  },
  {
    id: "acoustic-truck",
    title: "KU Acoustic Truck",
    date: "2026-07-17T17:00:00+07:00",
    venue: "KU Central Cafeteria 1",
    category: "Acoustic",
    link: "https://www.youtube.com/live/RTk2M66fQqY?si=-pLMtQbIrdbMbCi_",
  },
  {
    id: "freshy-day-night",
    title: "FRESHY DAY FRESHY NIGHT",
    date: "2026-07-26T15:40:00+07:00",
    venue: "Insee Chantarasatit Stadium",
    category: "Full band",
    link: "https://youtu.be/0EWAKp32uhI?si=H5uxECSzwkMpEU2O",
  },
  {
    id: "royal-project",
    title: "KU Acoustic Royal Project",
    date: "2026-08-09T18:00:00+07:00",
    venue: "Central World",
    category: "Acoustic",
  },
].map((item) => ({
  ...item,
  description:
    "From the KU Acoustic show archive. A moment of music and community from our previous website.",
  capacity: 300,
  image:
    item.id === "royal-project"
      ? "royal-stage"
      : item.id === "freshy-day-night"
        ? "freshy-band"
        : item.id === "acoustic-truck"
          ? "kaset-guitar"
          : "kaset-stage",
  sample: false,
}));
