import type { ContentItem } from "./handler.ts";

export const events: ContentItem[] = [
  {
    id: "loy-krathong-2026",
    title: "Loy Kra Tong 2026",
    category: "Full band",
    // Date only: the club has not announced a start time yet. An event without
    // a time renders as "Time TBA" and exports as an all-day calendar entry.
    date: "2026-11-23",
    venue: "Lan Dao",
    description:
      "Our full band plays the Loy Kra Tong celebration at Lan Dao. The start time will be announced closer to the date.",
    sample: false,
  },
  {
    id: "run-in-rhythm",
    title: "Run In Rhythm Concert",
    category: "Full band and Acoustic",
    date: "2026-02-25T16:30:00+07:00",
    venue: "Prasert Na Nagara Theatre",
    description:
      "Revisit our Run In Rhythm concert and the people who brought it to life.",
    image: "run-stage",
    link: "https://www.youtube.com/live/ib7OgoWOZQ8?si=IiGXu8RoNbARWbDo",
    sample: false,
  },
];
export const news: ContentItem[] = [
  {
    id: "welcome",
    title: "Your people. Your music. Your place.",
    category: "Club life",
    date: "2026-10-05",
    excerpt:
      "A home for every kind of music lover. Discover what life at KU Acoustic is all about.",
    body: "Since 1989, KU Acoustic has brought students together through music. Whether you sing, play an instrument, work behind the sound desk, or simply enjoy a good song, there is a place for you here. Send a membership application to introduce yourself and the committee will follow up about the next intake.",
    image: "freshy-friends",
    th: {
      title: "เพื่อนของคุณ ดนตรีของคุณ ที่ของคุณ",
      category: "ชีวิตในชมรม",
      excerpt:
        "บ้านสำหรับคนรักดนตรีทุกแบบ มาดูกันว่าชีวิตใน KU Acoustic เป็นอย่างไร",
      body: "ตั้งแต่ปี 1989 KU Acoustic รวมนิสิตเข้าด้วยกันผ่านเสียงดนตรี ไม่ว่าคุณจะร้องเพลง เล่นเครื่องดนตรี ดูแลระบบเสียง หรือแค่ชอบฟังเพลงดี ๆ ที่นี่มีที่สำหรับคุณเสมอ ส่งใบ audition เพื่อแนะนำตัว แล้วคณะกรรมการจะติดต่อกลับเรื่องการรับสมาชิกรอบถัดไป",
    },
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
    th: {
      title: "บทใหม่เริ่มต้นที่คุณ",
      category: "รับสมัครสมาชิก",
      excerpt:
        "การออดิชันรอบที่ผ่านมาเปิดรับทั้งนักร้อง นักดนตรี และทีมงานเบื้องหลัง",
      body: "การออดิชันรอบวันที่ 19 กรกฎาคม – 7 กันยายน 2569 ปิดรับแล้ว เราเปิดรับตำแหน่งร้องนำ กีตาร์ เบส คีย์บอร์ด เพอร์คัชชัน ฝ่ายเทค และบทบาทสร้างสรรค์อื่น ๆ คุณยังลงทะเบียนแสดงความสนใจผ่านแบบฟอร์มสมัครสมาชิกได้ เพื่อรับข่าวการเปิดรับรอบถัดไป",
    },
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
    th: {
      title: "เรื่องดี ๆ เกิดขึ้นในห้องซ้อม",
      category: "เบื้องหลัง",
      excerpt:
        "ไม่กี่คอร์ด ไอเดียที่แบ่งปันกัน และจุดเริ่มต้นของบางสิ่งที่พิเศษ",
      body: "ห้องซ้อมคือที่ที่บทเพลงกลายเป็นความทรงจำร่วมกัน ชมรมเปิดวันจันทร์–ศุกร์ เวลา 16:00–21:00 และวันเสาร์–อาทิตย์ เวลา 13:00–18:00 สมาชิกขอจองเวลาซ้อมได้ทางเว็บไซต์ โดยคณะกรรมการจะตรวจสอบแต่ละคำขอก่อนยืนยันการใช้ห้อง",
    },
  },
];

const archivePhotos: Record<string, string> = {
  "open-world": "exhibition-cover",
  "acoustic-truck": "truck-community",
  "freshy-day-night": "freshy-band",
  "royal-project": "royal-stage",
};

// Original club show archive, retained from the previous website.
export const archive: ContentItem[] = [
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
  {
    id: "when-and-where",
    title: "When & Where Concert",
    date: "2024-02-20T16:00:00+07:00",
    venue: "Kasetsart University",
    category: "Full band",
    link: "https://www.youtube.com/live/CtpQFrVGY7Y?si=dVM8eKpCaIwK-qCf",
  },
  {
    id: "minimal-concert",
    title: "Minimal Concert",
    date: "2023-03-08T17:30:00+07:00",
    venue: "Kasetsart University",
    category: "Full band",
    link: "https://www.youtube.com/live/pUNl1fq-qS4?si=6Qvu6J_TYOrqqoZb",
  },
].map((item) => ({
  ...item,
  description:
    "From the KU Acoustic show archive. A moment of music and community from our previous website.",
  // The concert recordings without an entry have no photograph of their own.
  image: archivePhotos[item.id],
  sample: false,
}));
