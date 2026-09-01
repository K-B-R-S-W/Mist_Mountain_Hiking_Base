export type NavRoute = {
  path: string;
  labelEn: string;
  labelSi: string;
  descEn: string;
  descSi: string;
  keywords: string[];
};

export const SITE_NAV_ROUTES: NavRoute[] = [
  {
    path: "/rooms",
    labelEn: "View Rooms & Stays",
    labelSi: "කාමර සහ නවාතැන් බලන්න",
    descEn: "Explore our cozy rooms, mountain views, and amenities.",
    descSi: "අපගේ සුවපහසු කාමර සහ පහසුකම් පිරික්සන්න.",
    keywords: ["room", "rooms", "stay", "rates", "tariffs", "pricing", "cost", "sleep", "bedroom", "suite", "කාමර", "ගාස්තු"],
  },
  {
    path: "/experiences",
    labelEn: "Explore Experiences & Trails",
    labelSi: "අත්දැකීම් සහ සංචාර බලන්න",
    descEn: "Natural spring pools, Pimbura hiking circuit, and the agro-tourism plantation.",
    descSi: "ස්වාභාවික උල්පත් දිය තටාක, කඳුකර හයිකින් චාරිකා සහ වගා අත්දැකීම්.",
    keywords: ["experience", "experiences", "hike", "hiking", "trail", "spring", "pool", "pools", "plantation", "tea", "cinnamon", "attractions", "දිය තටාක", "හයිකින්"],
  },
  {
    path: "/gallery",
    labelEn: "View Photo Gallery",
    labelSi: "ඡායාරූප ගැලරිය බලන්න",
    descEn: "Real photographs of the mountain mist, natural spring pools, and rooms.",
    descSi: "කඳුකර මීදුම, දිය තටාක සහ කාමරවල සැබෑ ඡායාරූප.",
    keywords: ["photo", "photos", "gallery", "images", "pictures", "see", "look", "video", "ඡායාරූප", "පින්තූර"],
  },
  {
    path: "/about",
    labelEn: "About Mist Mountain",
    labelSi: "අප ගැන විස්තර",
    descEn: "Our story, sustainable roots, the land, and our local Udahawatte team.",
    descSi: "අපගේ කතාව, ඉඩම සහ දේශීය කාර්ය මණ්ඩලය පිළිබඳ තොරතුරු.",
    keywords: ["about", "story", "team", "who", "history", "sustainability", "eco", "අප ගැන", "ඉතිහාසය"],
  },
  {
    path: "/contact",
    labelEn: "Contact & Directions",
    labelSi: "සම්බන්ධ කර ගැනීම සහ මාර්ග විස්තර",
    descEn: "Location map, telephone numbers, WhatsApp, and driving directions from Colombo.",
    descSi: "ස්ථානය, දුරකථන අංක, WhatsApp සහ කොළඹ සිට පැමිණෙන මාර්ගය.",
    keywords: ["contact", "location", "address", "map", "directions", "how to reach", "drive", "phone", "email", "whatsapp", "ලිපිනය", "දුරකථන", "පාර"],
  },
  {
    path: "/book",
    labelEn: "Book Availability Page",
    labelSi: "වෙන්කරවා ගැනීමේ පිටුව",
    descEn: "Check room calendar availability and send an inquiry directly.",
    descSi: "කාමර තිබේදැයි පරීක්ෂා කර වෙන්කරවා ගැනීම සඳහා විස්තර එවන්න.",
    keywords: ["book", "booking", "reserve", "reservation", "availability", "check availability", "වෙන්කරවා ගැනීම"],
  },
];
