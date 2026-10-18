// Every user-facing string, in both languages. `th` is typed against `en`, so
// a key added to one and forgotten in the other fails the typecheck.
const en = {
  locale: "en-US",
  switchTo: "ไทย",
  switchLabel: "เปลี่ยนเป็นภาษาไทย (Switch to Thai)",
  pages: {
    home: "Home",
    events: "Events",
    journal: "Journal",
    gallery: "Gallery",
    about: "Our story",
    admin: "Admin",
  },
  skip: "Skip to content",
  homeLabel: "KU Acoustic home",
  mainNav: "Main navigation",
  joinClub: "Join the club",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  closeDialog: "Close dialog",
  time: (time: string) => `${time} ICT`,
  event: {
    view: (title: string) => `View ${title}`,
    past: "PAST EVENT",
    comingUp: "COMING UP",
    sample: "SAMPLE EVENT",
    timeTba: "Time TBA",
    viewRecap: "View recap",
    details: "Event details",
    watchVideo: "Watch video",
    watchVideoLabel: (title: string) =>
      `Watch video: ${title} (opens in a new tab)`,
    startTba: " · Start time to be announced",
    sampleNote:
      "Sample event for demonstrating the new website. This date and venue have not been confirmed by the club.",
    free: "Free admission",
    places: (count: number) => ` · ${count} places available`,
    saveSpot: "Save me a spot",
    addCalendar: "Add to calendar",
    ended: "This event has ended. Explore the gallery for more moments.",
  },
  article: {
    read: (title: string) => `Read ${title}`,
    readStory: "Read the story",
  },
  newsletter: {
    subscribed: "You’re on the list! Your subscription has been saved.",
    eyebrow: "A LITTLE MUSIC IN YOUR INBOX",
    title: "Stay in the loop.",
    body: "New gigs, club stories, and chances to get involved.",
    emailLabel: "Email address",
    emailPlaceholder: "Your email address",
    subscribe: "Subscribe to club updates",
    consent:
      "By subscribing, you agree to the club storing your email for updates.",
  },
  hero: {
    eyebrow: "GOOD MUSIC. GREAT COMPANY.",
    title: (
      <>
        Find your sound.
        <br />
        Find <em>your people.</em>
      </>
    ),
    body: (
      <>
        A little acoustic. A little electric. A whole lot of heart.
        <br className="desktop-break" /> We’re KU Acoustic — a community brought
        together
        <br className="desktop-break" /> by the love of making music.
      </>
    ),
    explore: "Explore our events",
    getToKnow: "Get to know us",
    members: "Different voices. One community.",
    since: "Making memories since 1989.",
    photoCorner: "LIVE A LITTLE. PLAY A LOT.",
    note: (
      <>
        More than a music club.
        <br />
        <b>A place to belong.</b>
      </>
    ),
    handwritten: "it starts with a song ↗",
  },
  marquee: {
    words: ["PLAY", "CONNECT", "CREATE", "BELONG"],
    label: "Play. Connect. Create. Belong.",
    playLabel: "Play music banner animation",
    pauseLabel: "Pause music banner animation",
    play: "Play",
    pause: "Pause",
  },
  homeEvents: {
    eyebrow: "MEET US WHERE THE MUSIC IS",
    title: (
      <>
        Good things are <em>coming.</em>
      </>
    ),
    all: "All events",
    empty:
      "The next chapter is still being written. Join our mailing list for new events.",
  },
  belong: {
    photoAlt: "KU Acoustic members together on a club beach trip",
    caption: "A SHARED PASSION. A THOUSAND MEMORIES.",
    eyebrow: "MORE THAN THE NOTES",
    title: (
      <>
        Come for the music.
        <br />
        Stay for <em>the people.</em>
      </>
    ),
    body: "From your first chord to your first encore, you don’t have to do it alone. We’re a home for curious beginners, seasoned performers, and everyone who just loves a good song.",
    values: [
      "All sounds welcome",
      "Every faculty, one family",
      "Passion over perfection",
    ],
    story: "This is our story",
  },
  homeJournal: {
    eyebrow: "NOTES FROM THE CLUB",
    title: (
      <>
        A little behind <em>the scenes.</em>
      </>
    ),
    link: "The journal",
  },
  joinBanner: {
    eyebrow: "YOUR NEXT CHAPTER SOUNDS GOOD",
    title: (
      <>
        There’s a place for <em>you</em> here.
      </>
    ),
    body: "Bring your talent. Bring your curiosity. Just bring yourself.",
    cta: "Find your people",
  },
  eventsPage: {
    eyebrow: "LET’S MAKE SOME MEMORIES",
    title: (
      <>
        Meet us at <em>the next gig.</em>
      </>
    ),
    body: "Live sets, open mics, and a little room to try something new.",
    comingUp: "Coming up",
    past: "Past events",
    searchPlaceholder: "Search events…",
    searchLabel: "Search events",
    empty: "No events match these filters. Try another category or search.",
    calloutTitle: "Make room for your next rehearsal.",
    calloutBody: "Club members can request a practice slot, right here.",
    book: "Book a rehearsal",
  },
  journalPage: {
    eyebrow: "NOTES FROM THE CLUB",
    title: (
      <>
        Stories worth <em>sharing.</em>
      </>
    ),
    body: "The people, the practice, and everything between the songs.",
    empty: "New stories are on their way.",
  },
  galleryPage: {
    eyebrow: "A FEW OF OUR FAVORITE MOMENTS",
    title: (
      <>
        Looks like <em>good memories.</em>
      </>
    ),
    body: "Our music, our stage, and the moments we share in between.",
    note: "Photos from Run In Rhythm, Kaset Fair, Royal Project, Freshy Day/Freshy Night, and life at KU Acoustic.",
    filters: { all: "All moments", stage: "On stage", life: "Club life" },
    previous: "Previous",
    next: "Next",
  },
  about: {
    eyebrow: "KASETSART UNIVERSITY · SINCE 1989",
    title: (
      <>
        Different voices.
        <br />
        <em>One shared love.</em>
      </>
    ),
    body: "Music brought us here. The people made us stay.",
    photoAlt:
      "KU Acoustic performers and audience together at Run In Rhythm Concert",
    heading: (
      <>
        A little club.
        <br />A whole lot of heart.
      </>
    ),
    p1: "KU Acoustic is Kasetsart University’s community for anyone who loves to play, sing, create, and listen. Since 1989, we’ve been turning campus afternoons into rehearsals and strangers into bandmates.",
    p2: "You don’t need a perfect voice, a fancy guitar, or a particular faculty on your student card. Bring your curiosity and a love of music. We’ll meet you there.",
    cta: "Be part of the story",
    stats: [
      ["1989", "Where our story began"],
      ["40+", "Active club members"],
      ["4–6", "Shows every year"],
      ["∞", "Reasons to make music"],
    ],
    visitEyebrow: "DROP BY. SAY HELLO.",
    visitTitle: "Your next favorite place.",
    address: "Kasetsart University, Bangkhen, Bangkok",
    hours: "Mon–Fri 16:00–21:00 · Sat–Sun 13:00–18:00",
    requestSlot: "Request a rehearsal slot",
    contact: "Contact the committee",
    faqTitle: "A few things to know.",
    faq: [
      [
        "Do I need musical experience?",
        "No. Beginners, experienced musicians, and people who enjoy listening are all welcome. Tell us what you’re interested in through the application form.",
      ],
      [
        "Can students from any faculty join?",
        "Yes! KU Acoustic welcomes Kasetsart students from every faculty, including creative and production roles beyond performing.",
      ],
      [
        "How do I join?",
        "Submit a membership application here. Our committee will follow up with the next recruitment or audition details. Submitting an application does not automatically confirm membership.",
      ],
      [
        "How do rehearsal bookings work?",
        "Select a future date and a time during club hours. Your request reserves the slot while the committee reviews it; access is confirmed after approval.",
      ],
    ],
  },
  loading: "Tuning things up… Loading club content.",
  loadError:
    "The club content could not be loaded. Make sure the backend is running.",
  tryAgain: "Try again",
  footer: {
    tagline: (
      <>
        Good music. Great company.
        <br />A place to belong.
      </>
    ),
    explore: "TAKE A LOOK AROUND",
    involved: "GET INVOLVED",
    collaborate: "Collaborate with us",
    find: "FIND YOUR PEOPLE HERE",
    address: (
      <>
        Kasetsart University
        <br />
        Bangkhen, Bangkok, Thailand
      </>
    ),
    map: "Find us on the map",
    copyright: (year: number) =>
      `© ${year} KU Acoustic. Made with a little rhythm & a lot of heart.`,
    admin: "Club admin",
    backToTop: "Back to top",
  },
  modalTitles: {
    membership: "Find your people.",
    booking: "A little room to rehearse.",
    contact: "Let’s make something happen.",
    registration: "See you at the show.",
  },
  slideshow: {
    label: "KU Acoustic concert photos",
    slideOf: (index: number, total: number) => `${index} of ${total}`,
    previous: "Previous photo",
    next: "Next photo",
    choose: "Choose a photo",
    show: (index: number, alt: string) => `Show photo ${index}: ${alt}`,
    play: "Play photo slideshow",
    pause: "Pause photo slideshow",
  },
  form: {
    successRegistration: "You’re on the list.",
    successOther: "We’ve received your request.",
    successRegistrationBody:
      "Your registration is saved. Keep the event date handy — we can’t wait to see you.",
    successOtherBody:
      "The club committee will review your submission and follow up using your email address.",
    introMembership:
      "Musicians, singers, sound crew, and music lovers. There’s a place for you here — no experience required.",
    introBooking:
      "Request the clubroom for your next rehearsal. Weekdays 16:00–21:00 · Weekends 13:00–18:00 (Bangkok time). All requests need committee approval.",
    introContact:
      "Planning a collaboration or have a question? Leave a message for our committee.",
    introRegistration: (title: string, sample: boolean) =>
      `Reserve your place at ${title}. Admission is free.${sample ? " This is a sample event; registrations are for demonstration." : ""}`,
    name: "Your name",
    namePlaceholder: "First and last name",
    email: "Email address",
    faculty: "Faculty / affiliation",
    facultyPlaceholder: "e.g. Faculty of Engineering",
    interested: "I’m interested in",
    chooseRole: "Choose your role",
    roles: [
      "Vocals",
      "Guitar",
      "Bass",
      "Keyboard",
      "Drums & percussion",
      "Sound & production",
      "Photography & creative",
      "Music lover",
    ],
    date: "Rehearsal date",
    startTime: "Start time",
    duration: "Duration",
    hours: (count: number) => (count === 1 ? "1 hour" : `${count} hours`),
    message: "Your message",
    anythingElse: "Anything else? (optional)",
    aboutYouPlaceholder: "Tell us a little about yourself and your music.",
    otherPlaceholder: "What would you like us to know?",
    consent: "I agree to the club storing these details to handle my request.",
    sending: "Sending…",
    submit: {
      registration: "Register for event",
      membership: "Send application",
      booking: "Request rehearsal slot",
      contact: "Send message",
    },
  },
};

export type Copy = typeof en;

const th: Copy = {
  locale: "th-TH",
  switchTo: "EN",
  switchLabel: "Switch to English (เปลี่ยนเป็นภาษาอังกฤษ)",
  pages: {
    home: "หน้าแรก",
    events: "กิจกรรม",
    journal: "เรื่องเล่า",
    gallery: "แกลเลอรี",
    about: "เรื่องของเรา",
    admin: "ผู้ดูแล",
  },
  skip: "ข้ามไปยังเนื้อหา",
  homeLabel: "หน้าแรก KU Acoustic",
  mainNav: "เมนูหลัก",
  joinClub: "สมัครเข้าชมรม",
  openMenu: "เปิดเมนู",
  closeMenu: "ปิดเมนู",
  closeDialog: "ปิดหน้าต่าง",
  time: (time: string) => `${time} น.`,
  event: {
    view: (title: string) => `ดู ${title}`,
    past: "ผ่านไปแล้ว",
    comingUp: "เร็ว ๆ นี้",
    sample: "กิจกรรมตัวอย่าง",
    timeTba: "รอประกาศเวลา",
    viewRecap: "ดูย้อนหลัง",
    details: "รายละเอียด",
    watchVideo: "ดูวิดีโอ",
    watchVideoLabel: (title: string) => `ดูวิดีโอ: ${title} (เปิดในแท็บใหม่)`,
    startTba: " · รอประกาศเวลาเริ่ม",
    sampleNote:
      "กิจกรรมตัวอย่างสำหรับสาธิตเว็บไซต์ใหม่ วันที่และสถานที่ยังไม่ได้รับการยืนยันจากชมรม",
    free: "เข้าร่วมฟรี",
    places: (count: number) => ` · เหลือ ${count} ที่`,
    saveSpot: "จองที่ให้ฉัน",
    addCalendar: "เพิ่มลงปฏิทิน",
    ended: "กิจกรรมนี้จบไปแล้ว ดูช่วงเวลาอื่น ๆ ได้ในแกลเลอรี",
  },
  article: {
    read: (title: string) => `อ่าน ${title}`,
    readStory: "อ่านต่อ",
  },
  newsletter: {
    subscribed: "ลงชื่อเรียบร้อย! เราบันทึกการสมัครรับข่าวสารของคุณแล้ว",
    eyebrow: "เสียงเพลงเล็ก ๆ ส่งตรงถึงอีเมล",
    title: "ไม่พลาดทุกความเคลื่อนไหว",
    body: "งานแสดงใหม่ เรื่องราวในชมรม และโอกาสได้มาร่วมสนุกกับเรา",
    emailLabel: "อีเมล",
    emailPlaceholder: "อีเมลของคุณ",
    subscribe: "สมัครรับข่าวสารจากชมรม",
    consent: "เมื่อสมัครรับข่าวสาร คุณยินยอมให้ชมรมเก็บอีเมลของคุณไว้เพื่อส่งข่าวสาร",
  },
  hero: {
    eyebrow: "ดนตรีดี ๆ กับเพื่อนดี ๆ",
    title: (
      <>
        ค้นหาเสียงของคุณ
        <br />
        เจอ<em>คนที่ใช่</em>
      </>
    ),
    body: (
      <>
        อะคูสติกนิด ไฟฟ้าหน่อย และหัวใจเต็มร้อย
        <br className="desktop-break" /> เราคือ KU Acoustic —
        ชุมชนที่รวมตัวกัน
        <br className="desktop-break" /> ด้วยความรักในการทำดนตรี
      </>
    ),
    explore: "ดูกิจกรรมของเรา",
    getToKnow: "มารู้จักเรา",
    members: "ต่างเสียง แต่เป็นครอบครัวเดียวกัน",
    since: "สร้างความทรงจำร่วมกันตั้งแต่ปี 2532",
    photoCorner: "ใช้ชีวิตให้สนุก เล่นดนตรีให้เต็มที่",
    note: (
      <>
        มากกว่าชมรมดนตรี
        <br />
        <b>คือที่ที่คุณเป็นส่วนหนึ่ง</b>
      </>
    ),
    handwritten: "ทุกอย่างเริ่มจากเพลงหนึ่งเพลง ↗",
  },
  marquee: {
    words: ["เล่น", "เชื่อมใจ", "สร้างสรรค์", "เป็นหนึ่งเดียว"],
    label: "เล่น เชื่อมใจ สร้างสรรค์ เป็นหนึ่งเดียว",
    playLabel: "เล่นแอนิเมชันแบนเนอร์",
    pauseLabel: "หยุดแอนิเมชันแบนเนอร์",
    play: "เล่น",
    pause: "หยุด",
  },
  homeEvents: {
    eyebrow: "พบกับเราได้ทุกที่ที่มีเสียงเพลง",
    title: (
      <>
        เรื่องดี ๆ <em>กำลังจะมา</em>
      </>
    ),
    all: "กิจกรรมทั้งหมด",
    empty: "บทต่อไปกำลังถูกเขียนอยู่ สมัครรับข่าวสารเพื่อไม่พลาดกิจกรรมใหม่",
  },
  belong: {
    photoAlt: "สมาชิก KU Acoustic เที่ยวทะเลด้วยกัน",
    caption: "หนึ่งความหลงใหล นับพันความทรงจำ",
    eyebrow: "มากกว่าตัวโน้ต",
    title: (
      <>
        มาเพราะดนตรี
        <br />
        อยู่ต่อเพราะ<em>ผู้คน</em>
      </>
    ),
    body: "ตั้งแต่คอร์ดแรกจนถึงอังกอร์ครั้งแรก คุณไม่ต้องทำมันคนเดียว ที่นี่เป็นบ้านของมือใหม่ที่อยากลอง นักดนตรีที่มีประสบการณ์ และทุกคนที่รักเพลงดี ๆ",
    values: [
      "ทุกเสียงยินดีต้อนรับ",
      "ทุกคณะ หนึ่งครอบครัว",
      "ใจรักสำคัญกว่าความสมบูรณ์แบบ",
    ],
    story: "นี่คือเรื่องราวของเรา",
  },
  homeJournal: {
    eyebrow: "บันทึกจากชมรม",
    title: (
      <>
        เบื้องหลัง<em>เล็ก ๆ น้อย ๆ</em>
      </>
    ),
    link: "อ่านเรื่องเล่า",
  },
  joinBanner: {
    eyebrow: "บทต่อไปของคุณเสียงดีแน่นอน",
    title: (
      <>
        ที่นี่มีที่สำหรับ<em>คุณ</em>
      </>
    ),
    body: "พกพรสวรรค์มา พกความอยากรู้มา หรือแค่พาตัวเองมาก็พอ",
    cta: "มาเจอเพื่อนใหม่",
  },
  eventsPage: {
    eyebrow: "มาสร้างความทรงจำด้วยกัน",
    title: (
      <>
        เจอกันที่<em>งานถัดไป</em>
      </>
    ),
    body: "การแสดงสด โอเพนไมค์ และพื้นที่ให้คุณได้ลองสิ่งใหม่",
    comingUp: "กำลังจะมาถึง",
    past: "กิจกรรมที่ผ่านมา",
    searchPlaceholder: "ค้นหากิจกรรม…",
    searchLabel: "ค้นหากิจกรรม",
    empty: "ไม่พบกิจกรรมที่ตรงกับตัวกรอง ลองเลือกหมวดหมู่อื่นหรือค้นหาใหม่",
    calloutTitle: "จองที่ซ้อมครั้งต่อไปของคุณ",
    calloutBody: "สมาชิกชมรมขอจองเวลาซ้อมได้ที่นี่เลย",
    book: "จองห้องซ้อม",
  },
  journalPage: {
    eyebrow: "บันทึกจากชมรม",
    title: (
      <>
        เรื่องราวที่<em>อยากเล่าให้ฟัง</em>
      </>
    ),
    body: "ผู้คน การซ้อม และทุกอย่างที่เกิดขึ้นระหว่างบทเพลง",
    empty: "เรื่องใหม่กำลังตามมา",
  },
  galleryPage: {
    eyebrow: "ช่วงเวลาที่เราชอบที่สุด",
    title: (
      <>
        หน้าตาของ<em>ความทรงจำดี ๆ</em>
      </>
    ),
    body: "ดนตรีของเรา เวทีของเรา และช่วงเวลาที่เราแบ่งปันกันระหว่างนั้น",
    note: "ภาพจาก Run In Rhythm, งานเกษตรแฟร์, โครงการหลวง, Freshy Day/Freshy Night และชีวิตใน KU Acoustic",
    filters: { all: "ทั้งหมด", stage: "บนเวที", life: "ชีวิตในชมรม" },
    previous: "ก่อนหน้า",
    next: "ถัดไป",
  },
  about: {
    eyebrow: "มหาวิทยาลัยเกษตรศาสตร์ · ตั้งแต่ปี 2532",
    title: (
      <>
        ต่างเสียง
        <br />
        <em>แต่รักเดียวกัน</em>
      </>
    ),
    body: "ดนตรีพาเรามาที่นี่ ผู้คนทำให้เราอยู่ต่อ",
    photoAlt: "นักแสดงและผู้ชม KU Acoustic พร้อมหน้ากันในคอนเสิร์ต Run In Rhythm",
    heading: (
      <>
        ชมรมเล็ก ๆ
        <br />
        ที่มีหัวใจเต็มร้อย
      </>
    ),
    p1: "KU Acoustic คือชุมชนของมหาวิทยาลัยเกษตรศาสตร์สำหรับทุกคนที่รักการเล่น ร้อง สร้างสรรค์ และฟังเพลง ตั้งแต่ปี 2532 เราเปลี่ยนบ่ายวันธรรมดาในมหาวิทยาลัยให้เป็นเวลาซ้อม และเปลี่ยนคนแปลกหน้าให้เป็นเพื่อนร่วมวง",
    p2: "ไม่ต้องมีเสียงที่สมบูรณ์แบบ กีตาร์ราคาแพง หรือมาจากคณะไหนเป็นพิเศษ แค่พกความอยากรู้และความรักในดนตรีมา แล้วเจอกันที่นี่",
    cta: "มาเป็นส่วนหนึ่งของเรื่องราว",
    stats: [
      ["2532", "จุดเริ่มต้นของเรื่องราว"],
      ["40+", "สมาชิกที่ยังร่วมกิจกรรม"],
      ["4–6", "การแสดงในแต่ละปี"],
      ["∞", "เหตุผลที่จะทำดนตรี"],
    ],
    visitEyebrow: "แวะมาทักทายกันได้",
    visitTitle: "สถานที่โปรดแห่งใหม่ของคุณ",
    address: "มหาวิทยาลัยเกษตรศาสตร์ บางเขน กรุงเทพฯ",
    hours: "จ.–ศ. 16:00–21:00 · ส.–อา. 13:00–18:00",
    requestSlot: "ขอจองเวลาซ้อม",
    contact: "ติดต่อคณะกรรมการชมรม",
    faqTitle: "สิ่งที่ควรรู้",
    faq: [
      [
        "ต้องมีประสบการณ์ด้านดนตรีไหม?",
        "ไม่จำเป็น ทั้งมือใหม่ นักดนตรีที่มีประสบการณ์ และคนที่ชอบฟังเพลง ยินดีต้อนรับทุกคน บอกเราได้ว่าคุณสนใจด้านไหนผ่านแบบฟอร์มสมัคร",
      ],
      [
        "นิสิตจากคณะไหนก็สมัครได้ใช่ไหม?",
        "ใช่! KU Acoustic ยินดีต้อนรับนิสิตเกษตรศาสตร์จากทุกคณะ รวมถึงตำแหน่งด้านครีเอทีฟและโปรดักชันนอกเหนือจากการแสดง",
      ],
      [
        "สมัครเข้าชมรมได้อย่างไร?",
        "ส่งใบสมัครสมาชิกได้ที่นี่ คณะกรรมการจะติดต่อกลับพร้อมรายละเอียดการรับสมัครหรือออดิชันรอบถัดไป การส่งใบสมัครไม่ได้ยืนยันการเป็นสมาชิกโดยอัตโนมัติ",
      ],
      [
        "การจองห้องซ้อมทำอย่างไร?",
        "เลือกวันที่ในอนาคตและช่วงเวลาภายในเวลาทำการของชมรม คำขอของคุณจะกันช่วงเวลานั้นไว้ระหว่างที่คณะกรรมการพิจารณา และจะยืนยันสิทธิ์ใช้ห้องหลังได้รับอนุมัติ",
      ],
    ],
  },
  loading: "กำลังตั้งสาย… กำลังโหลดเนื้อหาของชมรม",
  loadError: "ไม่สามารถโหลดเนื้อหาของชมรมได้ โปรดตรวจสอบว่าระบบหลังบ้านทำงานอยู่",
  tryAgain: "ลองอีกครั้ง",
  footer: {
    tagline: (
      <>
        ดนตรีดี ๆ กับเพื่อนดี ๆ
        <br />
        ที่ที่คุณเป็นส่วนหนึ่ง
      </>
    ),
    explore: "เยี่ยมชม",
    involved: "มาร่วมกับเรา",
    collaborate: "ร่วมงานกับเรา",
    find: "มาเจอกันที่นี่",
    address: (
      <>
        มหาวิทยาลัยเกษตรศาสตร์
        <br />
        บางเขน กรุงเทพฯ
      </>
    ),
    map: "ดูแผนที่",
    copyright: (year: number) =>
      `© ${year} KU Acoustic สร้างด้วยจังหวะนิด ๆ และหัวใจเต็มร้อย`,
    admin: "ผู้ดูแลชมรม",
    backToTop: "กลับขึ้นด้านบน",
  },
  modalTitles: {
    membership: "มาเจอเพื่อนใหม่กัน",
    booking: "พื้นที่เล็ก ๆ สำหรับซ้อม",
    contact: "มาสร้างอะไรดี ๆ ด้วยกัน",
    registration: "แล้วเจอกันที่งาน",
  },
  slideshow: {
    label: "ภาพคอนเสิร์ต KU Acoustic",
    slideOf: (index: number, total: number) => `${index} จาก ${total}`,
    previous: "ภาพก่อนหน้า",
    next: "ภาพถัดไป",
    choose: "เลือกภาพ",
    show: (index: number, alt: string) => `แสดงภาพที่ ${index}: ${alt}`,
    play: "เล่นสไลด์โชว์",
    pause: "หยุดสไลด์โชว์",
  },
  form: {
    successRegistration: "คุณลงทะเบียนเรียบร้อยแล้ว",
    successOther: "เราได้รับคำขอของคุณแล้ว",
    successRegistrationBody:
      "บันทึกการลงทะเบียนของคุณแล้ว อย่าลืมวันงานนะ เรารอพบคุณอยู่",
    successOtherBody: "คณะกรรมการชมรมจะพิจารณาและติดต่อกลับทางอีเมลของคุณ",
    introMembership:
      "นักดนตรี นักร้อง ทีมเสียง และคนรักเสียงเพลง ที่นี่มีที่สำหรับคุณ ไม่ต้องมีประสบการณ์ก็สมัครได้",
    introBooking:
      "ขอใช้ห้องชมรมสำหรับการซ้อมครั้งต่อไป วันธรรมดา 16:00–21:00 · วันหยุด 13:00–18:00 (เวลากรุงเทพฯ) ทุกคำขอต้องได้รับอนุมัติจากคณะกรรมการ",
    introContact:
      "วางแผนร่วมงานหรือมีคำถาม? ฝากข้อความถึงคณะกรรมการได้เลย",
    introRegistration: (title: string, sample: boolean) =>
      `จองที่สำหรับ ${title} เข้าร่วมฟรี${sample ? " นี่คือกิจกรรมตัวอย่าง การลงทะเบียนมีไว้เพื่อสาธิตเท่านั้น" : ""}`,
    name: "ชื่อของคุณ",
    namePlaceholder: "ชื่อและนามสกุล",
    email: "อีเมล",
    faculty: "คณะ / สังกัด",
    facultyPlaceholder: "เช่น คณะวิศวกรรมศาสตร์",
    interested: "ฉันสนใจ",
    chooseRole: "เลือกบทบาท",
    roles: [
      "ร้องนำ",
      "กีตาร์",
      "เบส",
      "คีย์บอร์ด",
      "กลองและเพอร์คัชชัน",
      "ระบบเสียงและโปรดักชัน",
      "ถ่ายภาพและครีเอทีฟ",
      "คนรักเสียงเพลง",
    ],
    date: "วันที่ซ้อม",
    startTime: "เวลาเริ่ม",
    duration: "ระยะเวลา",
    hours: (count: number) => `${count} ชั่วโมง`,
    message: "ข้อความของคุณ",
    anythingElse: "มีอะไรเพิ่มเติมไหม? (ไม่บังคับ)",
    aboutYouPlaceholder: "เล่าเกี่ยวกับตัวคุณและดนตรีของคุณให้เราฟังหน่อย",
    otherPlaceholder: "มีอะไรอยากบอกเราไหม?",
    consent: "ฉันยินยอมให้ชมรมเก็บข้อมูลนี้เพื่อดำเนินการตามคำขอ",
    sending: "กำลังส่ง…",
    submit: {
      registration: "ลงทะเบียนเข้าร่วม",
      membership: "ส่งใบสมัคร",
      booking: "ส่งคำขอจองเวลาซ้อม",
      contact: "ส่งข้อความ",
    },
  },
};

export const copy = { en, th };
