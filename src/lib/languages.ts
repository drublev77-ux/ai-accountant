/**
 * Comprehensive World Languages Database
 * 50+ major world languages with native names and metadata
 */

export interface Language {
	code: string; // ISO 639-1 language code
	name: string; // English name
	nativeName: string; // Native name
	flag: string; // Emoji flag
	rtl?: boolean; // Right-to-left script
	regions: string[]; // Main regions where spoken
}

export const LANGUAGES: Record<string, Language> = {
	// European Languages
	en: { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", regions: ["Global"] },
	es: { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", regions: ["Spain", "Latin America"] },
	fr: { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", regions: ["France", "Africa", "Canada"] },
	de: { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", regions: ["Germany", "Austria", "Switzerland"] },
	it: { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", regions: ["Italy", "Switzerland"] },
	pt: { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹", regions: ["Portugal", "Brazil"] },
	ru: { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", regions: ["Russia", "Eastern Europe"] },
	pl: { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱", regions: ["Poland"] },
	nl: { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", regions: ["Netherlands", "Belgium"] },
	sv: { code: "sv", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", regions: ["Sweden", "Finland"] },
	no: { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", regions: ["Norway"] },
	da: { code: "da", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", regions: ["Denmark"] },
	fi: { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", regions: ["Finland"] },
	cs: { code: "cs", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", regions: ["Czech Republic"] },
	ro: { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴", regions: ["Romania", "Moldova"] },
	hu: { code: "hu", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", regions: ["Hungary"] },
	el: { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", regions: ["Greece", "Cyprus"] },
	tr: { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", regions: ["Turkey"] },
	uk: { code: "uk", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", regions: ["Ukraine"] },
	bg: { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", regions: ["Bulgaria"] },
	hr: { code: "hr", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", regions: ["Croatia"] },
	sr: { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", regions: ["Serbia"] },
	sk: { code: "sk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰", regions: ["Slovakia"] },
	sl: { code: "sl", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", regions: ["Slovenia"] },
	et: { code: "et", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪", regions: ["Estonia"] },
	lv: { code: "lv", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻", regions: ["Latvia"] },
	lt: { code: "lt", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹", regions: ["Lithuania"] },

	// Asian Languages
	zh: { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", regions: ["China", "Taiwan", "Singapore"] },
	ja: { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", regions: ["Japan"] },
	ko: { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", regions: ["South Korea", "North Korea"] },
	hi: { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", regions: ["India"] },
	bn: { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇧🇩", regions: ["Bangladesh", "India"] },
	th: { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭", regions: ["Thailand"] },
	vi: { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", regions: ["Vietnam"] },
	id: { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", regions: ["Indonesia"] },
	ms: { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", regions: ["Malaysia", "Singapore"] },
	ta: { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", regions: ["India", "Sri Lanka"] },
	te: { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", regions: ["India"] },
	ur: { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", rtl: true, regions: ["Pakistan", "India"] },

	// Middle Eastern Languages
	ar: { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", rtl: true, regions: ["Middle East", "North Africa"] },
	he: { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", rtl: true, regions: ["Israel"] },
	fa: { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷", rtl: true, regions: ["Iran", "Afghanistan"] },

	// African Languages
	sw: { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", regions: ["East Africa"] },
	am: { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹", regions: ["Ethiopia"] },
	zu: { code: "zu", name: "Zulu", nativeName: "isiZulu", flag: "🇿🇦", regions: ["South Africa"] },
	xh: { code: "xh", name: "Xhosa", nativeName: "isiXhosa", flag: "🇿🇦", regions: ["South Africa"] },

	// Other Languages
	fil: { code: "fil", name: "Filipino", nativeName: "Filipino", flag: "🇵🇭", regions: ["Philippines"] },
	my: { code: "my", name: "Burmese", nativeName: "မြန်မာဘာသာ", flag: "🇲🇲", regions: ["Myanmar"] },
	km: { code: "km", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭", regions: ["Cambodia"] },
	lo: { code: "lo", name: "Lao", nativeName: "ລາວ", flag: "🇱🇦", regions: ["Laos"] },
	ne: { code: "ne", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵", regions: ["Nepal"] },
	si: { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰", regions: ["Sri Lanka"] },
};

export function getLanguageList(): Language[] {
	return Object.values(LANGUAGES).sort((a, b) => a.name.localeCompare(b.name));
}

export function searchLanguages(query: string): Language[] {
	const lowerQuery = query.toLowerCase();
	return getLanguageList().filter(
		(lang) =>
			lang.name.toLowerCase().includes(lowerQuery) ||
			lang.nativeName.toLowerCase().includes(lowerQuery) ||
			lang.code.toLowerCase().includes(lowerQuery)
	);
}

export function getLanguageByCode(code: string): Language | undefined {
	return LANGUAGES[code];
}
