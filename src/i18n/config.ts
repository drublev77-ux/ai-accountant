import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslations from "./locales/en.json" with { type: "json" };
import ruTranslations from "./locales/ru.json" with { type: "json" };

/**
 * Multi-language i18n configuration
 *
 * Currently supports:
 * - English (en) - Full translations
 * - Russian (ru) - Full translations
 *
 * All other languages fall back to English.
 * To add a new language:
 * 1. Create a new JSON file in ./locales/{languageCode}.json
 * 2. Import it at the top of this file
 * 3. Add it to the resources object below
 */

// Initialize all resources with English as base
const resources: Record<string, { translation: typeof enTranslations }> = {
	en: { translation: enTranslations },
	ru: { translation: ruTranslations },
	// All other languages will use English translations as fallback
};

// For all supported languages without translations, use English
const supportedLanguageCodes = [
	"es", "fr", "de", "it", "pt", "pl", "nl", "sv", "no", "da", "fi", "cs", "ro", "hu", "el", "tr",
	"uk", "bg", "hr", "sr", "sk", "sl", "et", "lv", "lt", "zh", "ja", "ko", "hi", "bn", "th", "vi",
	"id", "ms", "ta", "te", "ur", "ar", "he", "fa", "sw", "am", "zu", "xh", "fil", "my", "km", "lo",
	"ne", "si"
];

// Use English as fallback for all languages
for (const code of supportedLanguageCodes) {
	if (!resources[code]) {
		resources[code] = { translation: enTranslations };
	}
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		supportedLngs: ["en", "ru", ...supportedLanguageCodes],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
		},
		react: {
			useSuspense: true,
		},
	});

export default i18n;
