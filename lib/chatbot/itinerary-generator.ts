import { ItineraryCardPayload, LanguageCode } from "./types";

export function generateCustomItinerary(
  nights = 2,
  language: LanguageCode = "en"
): ItineraryCardPayload {
  const safeNights = Math.max(1, Math.min(nights, 4));

  if (language === "si") {
    if (safeNights === 1) {
      return {
        durationNights: 1,
        title: "දින 2 / රාත්‍රී 1 කෙටි හයිකින් චාරිකා සැලැස්ම",
        summary: "පැමිණීම, ස්වාභාවික උල්පත් දිය තටාක ස්නානය, කඳුකර රාත්‍රී ආහාරය සහ කුකුළුවා රජ මහා විහාර චාරිකාව.",
        days: [
          {
            dayNumber: 1,
            title: "දිනය 1: පැමිණීම, තැඹිලි පානය සහ ස්වාභාවික දිය තටාක",
            morning: {
              title: "පැමිණීම සහ පිළිගැනීම",
              desc: "දහවල් 12-2 අතර පැමිණීම, වත්තෙන්ම කපා දෙන නැවුම් තැඹිලි පිළිගැන්ම සහ කාමරයට පිවිසීම.",
              duration: "පැය 1.5",
            },
            afternoon: {
              title: "ස්වාභාවික උල්පත් දිය තටාක ස්නානය",
              desc: "කඳුකර උල්පතින් පිරෙන පිරිසිදු දිය තටාකයේ විවේකය සහ සවස තේ රස බැලීම.",
              duration: "පැය 2.5",
            },
            evening: {
              title: "කැම්ප්ෆයර් සහ සාම්ප්‍රදායික ග්‍රාමීය රාත්‍රී භෝජනය",
              desc: "රාත්‍රී තරු දසුන් සමග කැම්ප්ෆයර් ගින්න වටා එකතු වීම සහ නැවුම් ගම්මාන ආහාර වේලක්.",
              duration: "පැය 2",
            },
            highlights: ["ස්වාභාවික උල්පත් දිය තටාක", "පිළිගැනීමේ තැඹිලි", "කැම්ප්ෆයර් රාත්‍රී භෝජනය"],
          },
          {
            dayNumber: 2,
            title: "දිනය 2: කුකුළුවා රජ මහා විහාරය සහ තේ වතු පා ගමන",
            morning: {
              title: "ඓතිහාසික ලෙන් විහාරය වෙත උදෑසන හයිකින් චාරිකාව",
              desc: "මීදුම් මිටියාවත නරඹමින් කුකුළුවා රජ මහා විහාරය දක්වා විනාඩි 45ක මඟපෙන්වන්නන් සහිත පා ගමන.",
              duration: "පැය 2.5",
            },
            afternoon: {
              title: "තේ හා කුරුඳු අත්දැකීම් සහ පිටත්වීම",
              desc: "තේ දළු නෙළීමේ ක්‍රියාවලිය දැකබලා ගැනීම, දිවා ආහාරය සහ පිටත්වීම.",
              duration: "පැය 1.5",
            },
            evening: {
              title: "චාරිකාව නිමාව",
              desc: "සුන්දර මතකයන් සමග පිටත්ව යාම.",
              duration: "පැය 1",
            },
            highlights: ["කුකුළුවා රජ මහා විහාරය", "තේ හා කුරුඳු අත්දැකීම", "මීදුම් මිටියාවත දසුන්"],
          },
        ],
      };
    }

    return {
      durationNights: safeNights,
      title: `දින ${safeNights + 1} / රාත්‍රී ${safeNights} පූර්ණ කඳුකර චාරිකා සැලැස්ම`,
      summary: "ස්වාභාවික දිය තටාක, කුකුළුවා රජ මහා විහාරය, පිඹුර කඳුකර හයිකින් පරිපථය සහ තේ/කුරුඳු අස්වනු අත්දැකීම්.",
      days: [
        {
          dayNumber: 1,
          title: "දිනය 1: පැමිණීම සහ උල්පත් දිය තටාක විවේකය",
          morning: {
            title: "පැමිණීම සහ පිළිගැනීමේ තැඹිලි පානය",
            desc: "බංගලාවට පැමිණීම, කාමරවලට පිවිසීම සහ වටපිටාව නිරීක්ෂණය.",
            duration: "පැය 1.5",
          },
          afternoon: {
            title: "ස්වාභාවික උල්පත් දිය තටාක ස්නානය",
            desc: "රසායනික රහිත පිරිසිදු උල්පත් ජලයේ ස්නානය සහ සවස සිලෝන් තේ වේලාව.",
            duration: "පැය 2.5",
          },
          evening: {
            title: "ග්‍රාමීය රාත්‍රී භෝජනය සහ කැම්ප්ෆයර්",
            desc: "නැවුම් කුළුබඩු මිශ්‍ර ගමේ ක්‍රමයට පිසූ ආහාර සහ රාත්‍රී තරු නැරඹීම.",
            duration: "පැය 2",
          },
          highlights: ["ස්වාභාවික දිය තටාක", "ගමේ ක්‍රමයට ආහාර", "කැම්ප්ෆයර්"],
        },
        {
          dayNumber: 2,
          title: "දිනය 2: පිඹුර කඳුකර හයිකින් චාරිකාව සහ කුකුළුවා විහාරය",
          morning: {
            title: "කුකුළුවා රජ මහා විහාරය සහ ලෙන් පරිශ්‍රය",
            desc: "කඳුකර නිම්න දසුන් නරඹමින් ඓතිහාසික කුකුළුවා ලෙන් විහාරය වෙත මඟපෙන්වන්නන් සහිත චාරිකාව.",
            duration: "පැය 3",
          },
          afternoon: {
            title: "තේ හා කුරුඳු වතු අත්දැකීම",
            desc: "කුරුඳු තැලීම, ගම්මිරිස් සහ තේ වගාව නැරඹීම සහ සවස දිය තටාක විවේකය.",
            duration: "පැය 2.5",
          },
          evening: {
            title: "බාබකියු රාත්‍රිය",
            desc: "කඳු මුදුනේ සිසිල් මීදුම මධ්‍යයේ රසවත් බාබකියු රාත්‍රියක්.",
            duration: "පැය 2.5",
          },
          highlights: ["කුකුළුවා රජ මහා විහාරය", "කුරුඳු හා තේ අත්දැකීම", "බාබකියු රාත්‍රිය"],
        },
        {
          dayNumber: 3,
          title: "දිනය 3: මීදුම් උදෑසන සහ ගිලෙන ගඟ ගවේෂණය",
          morning: {
            title: "ගිලෙන ගඟ සහ වනගත දියඇලි පා ගමන",
            desc: "ගල් කුළු යටින් ගලායන ගිලෙන ගඟේ අපූරු ස්වභාවය දැකබලා ගැනීම.",
            duration: "පැය 2.5",
          },
          afternoon: {
            title: "දිවා ආහාරය සහ පිටත්වීම",
            desc: "අවසාන ස්නානය, ශ්‍රී ලාංකික දිවා ආහාරය සහ පිටත්වීම.",
            duration: "පැය 2",
          },
          evening: {
            title: "චාරිකාව නිමාව",
            desc: "නිරවුල් මනසකින් යුතුව ආපසු ගමන් ඇරඹීම.",
            duration: "පැය 1",
          },
          highlights: ["ගිලෙන ගඟ", "වනගත දියඇලි", "පිටත්වීමේ දිවා ආහාරය"],
        },
      ],
    };
  }

  if (safeNights === 1) {
    return {
      durationNights: 1,
      title: "2-Day / 1-Night Mountain Recharge Itinerary",
      summary: "Arrival coconut, natural spring pool plunge, village dinner, and morning guided hike to Kukuluwa Raja Maha Viharaya.",
      days: [
        {
          dayNumber: 1,
          title: "Day 1: Arrival & Natural Spring Pools",
          morning: {
            title: "Arrival & Welcome Coconut",
            desc: "Check-in between 12:00 - 2:00 PM, enjoy a fresh king coconut cut straight from the plantation canopy.",
            duration: "1.5 hrs",
          },
          afternoon: {
            title: "Gravity-Fed Spring Pool Bathing",
            desc: "Swim in pure chemical-free mountain spring water followed by afternoon Ceylon estate tea.",
            duration: "2.5 hrs",
          },
          evening: {
            title: "Campfire & Authentic Village Dinner",
            desc: "Traditional Sri Lankan curries prepared with local produce, campfire under the mountain stars.",
            duration: "2 hrs",
          },
          highlights: ["Natural Spring Pools", "Welcome Coconut", "Campfire Village Dinner"],
        },
        {
          dayNumber: 2,
          title: "Day 2: Kukuluwa Temple Trail & Plantation Walk",
          morning: {
            title: "Kukuluwa Raja Maha Viharaya Cave Hike",
            desc: "Guided 45-minute ridge trail to the ancient cave temple with valley views across Sinharaja buffer.",
            duration: "2.5 hrs",
          },
          afternoon: {
            title: "Cinnamon & Tea Walk / Departure",
            desc: "Witness cinnamon peeling demonstrations, fresh pepper harvest, lunch and checkout by 11:00 AM - 1:00 PM.",
            duration: "1.5 hrs",
          },
          evening: {
            title: "Journey Home",
            desc: "Depart with mountain memories and fresh plantation spices.",
            duration: "1 hr",
          },
          highlights: ["Kukuluwa Cave Temple", "Plantation Agro-Walk", "Scenic Mountain Views"],
        },
      ],
    };
  }

  return {
    durationNights: safeNights,
    title: `${safeNights + 1}-Day / ${safeNights}-Night Ultimate Mountain Circuit`,
    summary: "Balanced pace of mountain trail hiking, Kukuluwa cave temple, tea & cinnamon harvesting, and spring pool relaxation.",
    days: [
      {
        dayNumber: 1,
        title: "Day 1: Basecamp Arrival & Spring Pools",
        morning: {
          title: "Arrival & Mountain Orientation",
          desc: "Settle into your room, take in the valley mist, and enjoy plantation king coconut.",
          duration: "1.5 hrs",
        },
        afternoon: {
          title: "Two Live Spring Pools",
          desc: "Relax in the chemical-free mountain pools; water overflow irrigates the surrounding crops.",
          duration: "2.5 hrs",
        },
        evening: {
          title: "Campfire & Hearth Dinner",
          desc: "Clay-pot village dinner with estate-grown vegetables and spices.",
          duration: "2 hrs",
        },
        highlights: ["Spring Pool Dip", "Fresh Coconut", "Campfire Hearth"],
      },
      {
        dayNumber: 2,
        title: "Day 2: Kukuluwa Temple & Pimbura Ridge Hike",
        morning: {
          title: "Kukuluwa Raja Maha Viharaya & Cave Exploration",
          desc: "Ascend the historic trail to the temple caves, drip ledges, and 360-degree mountain vantage points.",
          duration: "3 hrs",
        },
        afternoon: {
          title: "Agro-Tourism: Tea & Cinnamon Experience",
          desc: "Hands-on tea plucking and cinnamon harvesting with our local estate team.",
          duration: "2 hrs",
        },
        evening: {
          title: "Mountain Barbecue & Stargazing",
          desc: "Freshly prepared barbecue on the open terrace with crisp mountain air.",
          duration: "2.5 hrs",
        },
        highlights: ["Kukuluwa Cave Temple", "Tea & Cinnamon Harvest", "Terrace BBQ"],
      },
      {
        dayNumber: 3,
        title: "Day 3: Vanishing River Cascades & Departure",
        morning: {
          title: "Vanishing River & Secret Rock Pools",
          desc: "Guided walk to the unique underground river flow and jungle bathing cascades.",
          duration: "2 hrs",
        },
        afternoon: {
          title: "Traditional Lunch & Checkout",
          desc: "Final mountain dip, wholesome Sri Lankan lunch, and checkout.",
          duration: "2 hrs",
        },
        evening: {
          title: "Safe Travels",
          desc: "2.5-hour comfortable drive back to Colombo.",
          duration: "1 hr",
        },
        highlights: ["Vanishing River", "Secret Cascades", "Farewell Lunch"],
      },
    ],
  };
}
