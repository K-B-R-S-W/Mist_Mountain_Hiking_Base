import { ItineraryCardPayload, LanguageCode } from "./types";

interface ItineraryDayData {
  dayNumber: number;
  title: string;
  morning: { title: string; desc: string; duration: string };
  afternoon: { title: string; desc: string; duration: string };
  evening: { title: string; desc: string; duration: string };
  highlights: string[];
}

const ENGLISH_DAYS_CATALOG: Array<(dayNum: number, isLastDay: boolean) => ItineraryDayData> = [
  // Day 1
  (dayNum) => ({
    dayNumber: dayNum,
    title: `Day ${dayNum}: Arrival, Plantation Walk & Natural Spring Pools`,
    morning: {
      title: "Arrival & Welcome King Coconut",
      desc: "Check in to your mountain room (from 2:00 PM) and refresh with fresh king coconut plucked straight from our plantation.",
      duration: "1.5 hrs",
    },
    afternoon: {
      title: "Two Live Spring Pools & Estate Walk",
      desc: "Swim in our 100% chemical-free natural mountain spring pools and explore the 10-acre high-elevation Ceylon tea estate.",
      duration: "2.5 hrs",
    },
    evening: {
      title: "Traditional Hearth Dinner & Campfire",
      desc: "Clay-pot Sri Lankan hearth cuisine with estate-grown spices and evening stargazing under misty mountain breezes.",
      duration: "2 hrs",
    },
    highlights: ["Natural Spring Pools", "Fresh King Coconut", "Clay-Pot Hearth Dinner"],
  }),
  // Day 2
  (dayNum, isLastDay) => ({
    dayNumber: dayNum,
    title: `Day ${dayNum}: Kukuluwa Cave Temple Summit & Ridgeline Hike`,
    morning: {
      title: "Kukuluwa Raja Maha Viharaya Guided Trek",
      desc: "Guided 45-minute mountain trail to an ancient historic rock cave temple with panoramic 360° valley vistas and drip ledges.",
      duration: "3 hrs",
    },
    afternoon: {
      title: isLastDay ? "Spices Workshop & Departure" : "Ceylon Tea & Cinnamon Peeling Experience",
      desc: isLastDay
        ? "Witness cinnamon processing, enjoy a wholesome village lunch, and check out with fresh plantation memories."
        : "Hands-on tea plucking and authentic cinnamon peeling demonstration with our estate artisans, followed by spring pool bathing.",
      duration: isLastDay ? "2 hrs" : "2.5 hrs",
    },
    evening: {
      title: isLastDay ? "Departure & Safe Travels" : "Terrace Barbecue & Night Mist",
      desc: isLastDay
        ? "Scenic 2.5-hour drive back to Colombo or next destination."
        : "Outdoor barbecue on the open terrace with grilled specialties and cool mountain air.",
      duration: isLastDay ? "1 hr" : "2.5 hrs",
    },
    highlights: ["Kukuluwa Cave Temple", isLastDay ? "Plantation Lunch" : "Ceylon Cinnamon Demo", isLastDay ? "Safe Travels" : "Terrace BBQ"],
  }),
  // Day 3
  (dayNum, isLastDay) => ({
    dayNumber: dayNum,
    title: `Day ${dayNum}: Pimbura Mountain Circuit & Vanishing River`,
    morning: {
      title: "Pimbura Ridgeline Hiking Circuit",
      desc: "2-3 hour scenic mountain trek traversing mist viewpoints, wild rubber borders, and pristine tea terraces.",
      duration: "3 hrs",
    },
    afternoon: {
      title: "Vanishing River & Secret Rock Cascades",
      desc: "Explore subterranean mountain streams disappearing under granite boulders into natural forest pools.",
      duration: "2.5 hrs",
    },
    evening: {
      title: isLastDay ? "Final Dinner & Checkout" : "Acoustic Campfire & Village Feast",
      desc: isLastDay
        ? "Relaxing spring bath, traditional dinner, and preparation for departure."
        : "Cozy campfire session with authentic herbal tea, roast cassava, and village storytelling.",
      duration: "2 hrs",
    },
    highlights: ["Pimbura Ridgeline Trek", "Vanishing River", isLastDay ? "Farewell Lunch" : "Acoustic Campfire"],
  }),
  // Day 4
  (dayNum, isLastDay) => ({
    dayNumber: dayNum,
    title: `Day ${dayNum}: Agro-Heritage Tour & Forest Bathing`,
    morning: {
      title: "Black Pepper Vines & Organic Harvest Tour",
      desc: "Learn about traditional Ceylon black pepper cultivation, clove trees, and organic vegetable garden harvesting.",
      duration: "2 hrs",
    },
    afternoon: {
      title: "Deep Jungle Bathing & Waterfall Springs",
      desc: "Hidden forest cascades and quiet natural meditation rocks surrounded by bird calls and endemic flora.",
      duration: "3 hrs",
    },
    evening: {
      title: "Estate Chef's Special Curry Night",
      desc: "Curated 7-curry traditional feast featuring freshly picked herbs and garden produce.",
      duration: "2 hrs",
    },
    highlights: ["Black Pepper & Spices", "Secret Waterfall Springs", "7-Curry Village Feast"],
  }),
  // Day 5+
  (dayNum) => ({
    dayNumber: dayNum,
    title: `Day ${dayNum}: Rainforest Border Exploration & Departure`,
    morning: {
      title: "Sunrise Birdwatching & Scenic Valley Trail",
      desc: "Early morning hike along the valley ridge spotting endemic birds and morning mist rolls.",
      duration: "2.5 hrs",
    },
    afternoon: {
      title: "Final Spring Pool Refresh & Checkout",
      desc: "Final swim in the natural mountain spring pools, traditional lunch, and warm farewell from our team.",
      duration: "2 hrs",
    },
    evening: {
      title: "Safe Journey Home",
      desc: "Depart rejuvenated with organic plantation spices and unforgettable memories.",
      duration: "1 hr",
    },
    highlights: ["Sunrise Ridge Views", "Final Spring Dip", "Safe Departure"],
  }),
];

const SINHALA_DAYS_CATALOG: Array<(dayNum: number, isLastDay: boolean) => ItineraryDayData> = [
  // Day 1
  (dayNum) => ({
    dayNumber: dayNum,
    title: `දිනය ${dayNum}: පැමිණීම, පිළිගැනීමේ තැඹිලි සහ ස්වාභාවික උල්පත් දිය තටාක`,
    morning: {
      title: "පැමිණීම සහ කාමරයට පිවිසීම",
      desc: "දහවල් 2:00 සිට පැමිණීම, අපගේ අක්කර 10 වතුයායේ නැවුම් තැඹිලි පිළිගැන්ම සහ කාමරයට පිවිසීම.",
      duration: "පැය 1.5",
    },
    afternoon: {
      title: "ස්වාභාවික උල්පත් දිය තටාක ස්නානය",
      desc: "රසායනික ද්‍රව්‍ය රහිත පිරිසිදු කඳුකර උල්පත් ජල තටාකවල ස්නානය සහ සවස සිලෝන් තේ වේලාව.",
      duration: "පැය 2.5",
    },
    evening: {
      title: "ගැමි මැටි ලිපේ රාත්‍රී භෝජනය සහ කැම්ප්ෆයර්",
      desc: "නැවුම් කුළුබඩු මිශ්‍ර ගමේ ක්‍රමයට පිසූ රසවත් ආහාර සහ රාත්‍රී තරු නැරඹීම.",
      duration: "පැය 2",
    },
    highlights: ["ස්වාභාවික දිය තටාක", "පිළිගැනීමේ තැඹිලි", "කැම්ප්ෆයර් රාත්‍රී ආහාරය"],
  }),
  // Day 2
  (dayNum, isLastDay) => ({
    dayNumber: dayNum,
    title: `දිනය ${dayNum}: කුකුළුවා රජ මහා විහාරය සහ ලෙන් පරිශ්‍රය`,
    morning: {
      title: "ඓතිහාසික ලෙන් විහාරය වෙත කඳුකර පා ගමන",
      desc: "මීදුම් නිම්න දසුන් නරඹමින් ඓතිහාසික කුකුළුවා ලෙන් විහාරය සහ කටාරම් කෙටූ ගල් ලෙන් වෙත මඟපෙන්වන්නන් සහිත පා ගමන.",
      duration: "පැය 3",
    },
    afternoon: {
      title: isLastDay ? "තේ/කුරුඳු අත්දැකීම් සහ පිටත්වීම" : "තේ හා කුරුඳු වතු අත්දැකීම",
      desc: isLastDay
        ? "කුරුඳු තැලීම දැකබලා ගැනීම, දිවා ආහාරය සහ පිටත්වීම."
        : "තේ දළු නෙළීම සහ සාම්ප්‍රදායික කුරුඳු තැලීමේ අත්දැකීම, පසුව දිය තටාක විවේකය.",
      duration: "පැය 2.5",
    },
    evening: {
      title: isLastDay ? "චාරිකාව නිමාව" : "බාබකියු රාත්‍රිය",
      desc: isLastDay ? "සුන්දර මතකයන් සමග පිටත්වීම." : "කඳු මුදුනේ සිසිල් මීදුම මධ්‍යයේ රසවත් බාබකියු රාත්‍රියක්.",
      duration: isLastDay ? "පැය 1" : "පැය 2.5",
    },
    highlights: ["කුකුළුවා රජ මහා විහාරය", isLastDay ? "ගමේ දිවා ආහාරය" : "කුරුඳු හා තේ අත්දැකීම", isLastDay ? "සුරක්ෂිත ගමනක්" : "බාබකියු රාත්‍රිය"],
  }),
  // Day 3
  (dayNum, isLastDay) => ({
    dayNumber: dayNum,
    title: `දිනය ${dayNum}: පිඹුර කඳුකර මංපෙත සහ ගිලෙන ගඟ ගවේෂණය`,
    morning: {
      title: "පිඹුර කඳුකර හයිකින් පරිපථය",
      desc: "තේ නිම්න, මීදුම් මුදුන් සහ රබර් වතු මායිම් ඔස්සේ පැය 2-3ක සුන්දර කඳුකර පා ගමන.",
      duration: "පැය 3",
    },
    afternoon: {
      title: "ගිලෙන ගඟ සහ වනගත දියඇලි",
      desc: "ගල් කුළු යටින් ගලායන ගිලෙන ගඟ සහ ස්වාභාවික වනගත දිය තටාක ගවේෂණය.",
      duration: "පැය 2.5",
    },
    evening: {
      title: isLastDay ? "දිවා ආහාරය සහ පිටත්වීම" : "කැම්ප්ෆයර් සාදය",
      desc: isLastDay ? "අවසාන ස්නානය, ශ්‍රී ලාංකික දිවා ආහාරය සහ පිටත්වීම." : "සුවපහසු ගිනිමැලය වටා එකතුවීම සහ ග්‍රාමීය රාත්‍රී භෝජනය.",
      duration: "පැය 2",
    },
    highlights: ["පිඹුර හයිකින් පරිපථය", "ගිලෙන ගඟ", isLastDay ? "පිටත්වීමේ දිවා ආහාරය" : "ගිනිමැල සාදය"],
  }),
  // Day 4+
  (dayNum) => ({
    dayNumber: dayNum,
    title: `දිනය ${dayNum}: ස්වාභාවික වනාන්තර දිය ඇලි සහ පිටත්වීම`,
    morning: {
      title: "කුරුළු නැරඹීම සහ උදෑසන කඳුකර සිරිය",
      desc: "මීදුම් අතරින් නැගෙන හිරු උදාව සහ කඳුකර පක්ෂීන් නැරඹීමේ පා ගමන.",
      duration: "පැය 2.5",
    },
    afternoon: {
      title: "අවසාන උල්පත් දිය නෑම සහ පිටත්වීම",
      desc: "නැවුම් ස්වාභාවික දිය තටාක ස්නානය, දිවා ආහාරය සහ සුරක්ෂිතව ආපසු ගමන් ඇරඹීම.",
      duration: "පැය 2",
    },
    evening: {
      title: "චාරිකාව නිමාව",
      desc: "නිරවුල් මනසකින් යුතුව නිවස බලා පිටත්වීම.",
      duration: "පැය 1",
    },
    highlights: ["හිරු උදාව", "උල්පත් දිය නෑම", "සුරක්ෂිත ගමනක්"],
  }),
];

export function generateCustomItinerary(
  nights = 2,
  language: LanguageCode = "en"
): ItineraryCardPayload {
  const safeDays = Math.max(2, Math.min(nights + 1, 7));
  const safeNights = safeDays - 1;

  const catalog = language === "si" ? SINHALA_DAYS_CATALOG : ENGLISH_DAYS_CATALOG;
  const days: ItineraryDayData[] = [];

  for (let i = 0; i < safeDays; i++) {
    const dayNum = i + 1;
    const isLastDay = dayNum === safeDays;
    const generator = catalog[Math.min(i, catalog.length - 1)] ?? catalog[0];
    if (generator) {
      days.push(generator(dayNum, isLastDay));
    }
  }

  if (language === "si") {
    return {
      durationNights: safeNights,
      title: `දින ${safeDays} / රාත්‍රී ${safeNights} පූර්ණ කඳුකර චාරිකා සැලැස්ම`,
      summary: "ස්වාභාවික දිය තටාක, කුකුළුවා රජ මහා විහාරය, පිඹුර කඳුකර හයිකින් පරිපථය සහ තේ/කුරුඳු අස්වනු අත්දැකීම්.",
      days,
    };
  }

  return {
    durationNights: safeNights,
    title: `${safeDays}-Day / ${safeNights}-Night Ultimate Mountain Adventure`,
    summary: "A balanced mountain escape featuring natural spring pools, Kukuluwa cave temple trek, 10-acre tea & cinnamon estate, and authentic hearth dining.",
    days,
  };
}
