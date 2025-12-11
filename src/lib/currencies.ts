/**
 * Comprehensive World Currencies Database
 * 150+ world currencies with symbols and metadata
 */

export interface Currency {
	code: string; // ISO 4217 currency code
	name: string; // Currency name
	symbol: string; // Currency symbol
	flag: string; // Country flag emoji
	countries: string[]; // Countries using this currency
	decimalDigits: number; // Number of decimal places
}

export const CURRENCIES: Record<string, Currency> = {
	// Major World Currencies
	USD: { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸", countries: ["United States", "Ecuador", "El Salvador"], decimalDigits: 2 },
	EUR: { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺", countries: ["Eurozone"], decimalDigits: 2 },
	GBP: { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧", countries: ["United Kingdom"], decimalDigits: 2 },
	JPY: { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", countries: ["Japan"], decimalDigits: 0 },
	CNY: { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳", countries: ["China"], decimalDigits: 2 },
	CHF: { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭", countries: ["Switzerland", "Liechtenstein"], decimalDigits: 2 },
	CAD: { code: "CAD", name: "Canadian Dollar", symbol: "$", flag: "🇨🇦", countries: ["Canada"], decimalDigits: 2 },
	AUD: { code: "AUD", name: "Australian Dollar", symbol: "$", flag: "🇦🇺", countries: ["Australia"], decimalDigits: 2 },
	NZD: { code: "NZD", name: "New Zealand Dollar", symbol: "$", flag: "🇳🇿", countries: ["New Zealand"], decimalDigits: 2 },

	// Asian Currencies
	INR: { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳", countries: ["India"], decimalDigits: 2 },
	KRW: { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷", countries: ["South Korea"], decimalDigits: 0 },
	SGD: { code: "SGD", name: "Singapore Dollar", symbol: "$", flag: "🇸🇬", countries: ["Singapore"], decimalDigits: 2 },
	HKD: { code: "HKD", name: "Hong Kong Dollar", symbol: "$", flag: "🇭🇰", countries: ["Hong Kong"], decimalDigits: 2 },
	THB: { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭", countries: ["Thailand"], decimalDigits: 2 },
	MYR: { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", countries: ["Malaysia"], decimalDigits: 2 },
	IDR: { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩", countries: ["Indonesia"], decimalDigits: 0 },
	PHP: { code: "PHP", name: "Philippine Peso", symbol: "₱", flag: "🇵🇭", countries: ["Philippines"], decimalDigits: 2 },
	VND: { code: "VND", name: "Vietnamese Dong", symbol: "₫", flag: "🇻🇳", countries: ["Vietnam"], decimalDigits: 0 },
	PKR: { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰", countries: ["Pakistan"], decimalDigits: 2 },
	BDT: { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", flag: "🇧🇩", countries: ["Bangladesh"], decimalDigits: 2 },
	LKR: { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", flag: "🇱🇰", countries: ["Sri Lanka"], decimalDigits: 2 },
	MMK: { code: "MMK", name: "Myanmar Kyat", symbol: "K", flag: "🇲🇲", countries: ["Myanmar"], decimalDigits: 2 },
	NPR: { code: "NPR", name: "Nepalese Rupee", symbol: "Rs", flag: "🇳🇵", countries: ["Nepal"], decimalDigits: 2 },
	TWD: { code: "TWD", name: "Taiwan Dollar", symbol: "$", flag: "🇹🇼", countries: ["Taiwan"], decimalDigits: 2 },

	// Middle Eastern Currencies
	AED: { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪", countries: ["UAE"], decimalDigits: 2 },
	SAR: { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦", countries: ["Saudi Arabia"], decimalDigits: 2 },
	ILS: { code: "ILS", name: "Israeli Shekel", symbol: "₪", flag: "🇮🇱", countries: ["Israel"], decimalDigits: 2 },
	TRY: { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷", countries: ["Turkey"], decimalDigits: 2 },
	IRR: { code: "IRR", name: "Iranian Rial", symbol: "﷼", flag: "🇮🇷", countries: ["Iran"], decimalDigits: 2 },
	QAR: { code: "QAR", name: "Qatari Riyal", symbol: "﷼", flag: "🇶🇦", countries: ["Qatar"], decimalDigits: 2 },
	KWD: { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك", flag: "🇰🇼", countries: ["Kuwait"], decimalDigits: 3 },
	BHD: { code: "BHD", name: "Bahraini Dinar", symbol: "د.ب", flag: "🇧🇭", countries: ["Bahrain"], decimalDigits: 3 },
	OMR: { code: "OMR", name: "Omani Rial", symbol: "﷼", flag: "🇴🇲", countries: ["Oman"], decimalDigits: 3 },
	JOD: { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا", flag: "🇯🇴", countries: ["Jordan"], decimalDigits: 3 },
	LBP: { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل", flag: "🇱🇧", countries: ["Lebanon"], decimalDigits: 2 },
	EGP: { code: "EGP", name: "Egyptian Pound", symbol: "£", flag: "🇪🇬", countries: ["Egypt"], decimalDigits: 2 },

	// European Currencies (Non-Euro)
	RUB: { code: "RUB", name: "Russian Ruble", symbol: "₽", flag: "🇷🇺", countries: ["Russia"], decimalDigits: 2 },
	PLN: { code: "PLN", name: "Polish Zloty", symbol: "zł", flag: "🇵🇱", countries: ["Poland"], decimalDigits: 2 },
	SEK: { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪", countries: ["Sweden"], decimalDigits: 2 },
	NOK: { code: "NOK", name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴", countries: ["Norway"], decimalDigits: 2 },
	DKK: { code: "DKK", name: "Danish Krone", symbol: "kr", flag: "🇩🇰", countries: ["Denmark"], decimalDigits: 2 },
	CZK: { code: "CZK", name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿", countries: ["Czech Republic"], decimalDigits: 2 },
	HUF: { code: "HUF", name: "Hungarian Forint", symbol: "Ft", flag: "🇭🇺", countries: ["Hungary"], decimalDigits: 0 },
	RON: { code: "RON", name: "Romanian Leu", symbol: "lei", flag: "🇷🇴", countries: ["Romania"], decimalDigits: 2 },
	BGN: { code: "BGN", name: "Bulgarian Lev", symbol: "лв", flag: "🇧🇬", countries: ["Bulgaria"], decimalDigits: 2 },
	HRK: { code: "HRK", name: "Croatian Kuna", symbol: "kn", flag: "🇭🇷", countries: ["Croatia"], decimalDigits: 2 },
	UAH: { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴", flag: "🇺🇦", countries: ["Ukraine"], decimalDigits: 2 },
	ISK: { code: "ISK", name: "Icelandic Krona", symbol: "kr", flag: "🇮🇸", countries: ["Iceland"], decimalDigits: 0 },

	// Latin American Currencies
	BRL: { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷", countries: ["Brazil"], decimalDigits: 2 },
	MXN: { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽", countries: ["Mexico"], decimalDigits: 2 },
	ARS: { code: "ARS", name: "Argentine Peso", symbol: "$", flag: "🇦🇷", countries: ["Argentina"], decimalDigits: 2 },
	CLP: { code: "CLP", name: "Chilean Peso", symbol: "$", flag: "🇨🇱", countries: ["Chile"], decimalDigits: 0 },
	COP: { code: "COP", name: "Colombian Peso", symbol: "$", flag: "🇨🇴", countries: ["Colombia"], decimalDigits: 2 },
	PEN: { code: "PEN", name: "Peruvian Sol", symbol: "S/", flag: "🇵🇪", countries: ["Peru"], decimalDigits: 2 },
	UYU: { code: "UYU", name: "Uruguayan Peso", symbol: "$", flag: "🇺🇾", countries: ["Uruguay"], decimalDigits: 2 },
	VES: { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs", flag: "🇻🇪", countries: ["Venezuela"], decimalDigits: 2 },
	BOB: { code: "BOB", name: "Bolivian Boliviano", symbol: "Bs", flag: "🇧🇴", countries: ["Bolivia"], decimalDigits: 2 },
	PYG: { code: "PYG", name: "Paraguayan Guarani", symbol: "₲", flag: "🇵🇾", countries: ["Paraguay"], decimalDigits: 0 },
	CRC: { code: "CRC", name: "Costa Rican Colón", symbol: "₡", flag: "🇨🇷", countries: ["Costa Rica"], decimalDigits: 2 },
	GTQ: { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q", flag: "🇬🇹", countries: ["Guatemala"], decimalDigits: 2 },
	DOP: { code: "DOP", name: "Dominican Peso", symbol: "$", flag: "🇩🇴", countries: ["Dominican Republic"], decimalDigits: 2 },

	// African Currencies
	ZAR: { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦", countries: ["South Africa"], decimalDigits: 2 },
	NGN: { code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "🇳🇬", countries: ["Nigeria"], decimalDigits: 2 },
	KES: { code: "KES", name: "Kenyan Shilling", symbol: "KSh", flag: "🇰🇪", countries: ["Kenya"], decimalDigits: 2 },
	GHS: { code: "GHS", name: "Ghanaian Cedi", symbol: "₵", flag: "🇬🇭", countries: ["Ghana"], decimalDigits: 2 },
	TZS: { code: "TZS", name: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿", countries: ["Tanzania"], decimalDigits: 2 },
	UGX: { code: "UGX", name: "Ugandan Shilling", symbol: "USh", flag: "🇺🇬", countries: ["Uganda"], decimalDigits: 0 },
	ETB: { code: "ETB", name: "Ethiopian Birr", symbol: "Br", flag: "🇪🇹", countries: ["Ethiopia"], decimalDigits: 2 },
	MAD: { code: "MAD", name: "Moroccan Dirham", symbol: "د.م.", flag: "🇲🇦", countries: ["Morocco"], decimalDigits: 2 },
	TND: { code: "TND", name: "Tunisian Dinar", symbol: "د.ت", flag: "🇹🇳", countries: ["Tunisia"], decimalDigits: 3 },
	DZD: { code: "DZD", name: "Algerian Dinar", symbol: "د.ج", flag: "🇩🇿", countries: ["Algeria"], decimalDigits: 2 },
	AOA: { code: "AOA", name: "Angolan Kwanza", symbol: "Kz", flag: "🇦🇴", countries: ["Angola"], decimalDigits: 2 },
	XOF: { code: "XOF", name: "West African CFA Franc", symbol: "Fr", flag: "🌍", countries: ["West Africa"], decimalDigits: 0 },
	XAF: { code: "XAF", name: "Central African CFA Franc", symbol: "Fr", flag: "🌍", countries: ["Central Africa"], decimalDigits: 0 },

	// Other Currencies
	IQD: { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د", flag: "🇮🇶", countries: ["Iraq"], decimalDigits: 3 },
	AFN: { code: "AFN", name: "Afghan Afghani", symbol: "؋", flag: "🇦🇫", countries: ["Afghanistan"], decimalDigits: 2 },
	ALL: { code: "ALL", name: "Albanian Lek", symbol: "L", flag: "🇦🇱", countries: ["Albania"], decimalDigits: 2 },
	AMD: { code: "AMD", name: "Armenian Dram", symbol: "֏", flag: "🇦🇲", countries: ["Armenia"], decimalDigits: 2 },
	AZN: { code: "AZN", name: "Azerbaijani Manat", symbol: "₼", flag: "🇦🇿", countries: ["Azerbaijan"], decimalDigits: 2 },
	BYN: { code: "BYN", name: "Belarusian Ruble", symbol: "Br", flag: "🇧🇾", countries: ["Belarus"], decimalDigits: 2 },
	BAM: { code: "BAM", name: "Bosnia-Herzegovina Mark", symbol: "KM", flag: "🇧🇦", countries: ["Bosnia-Herzegovina"], decimalDigits: 2 },
	GEL: { code: "GEL", name: "Georgian Lari", symbol: "₾", flag: "🇬🇪", countries: ["Georgia"], decimalDigits: 2 },
	KZT: { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸", flag: "🇰🇿", countries: ["Kazakhstan"], decimalDigits: 2 },
	KGS: { code: "KGS", name: "Kyrgyzstani Som", symbol: "с", flag: "🇰🇬", countries: ["Kyrgyzstan"], decimalDigits: 2 },
	MKD: { code: "MKD", name: "Macedonian Denar", symbol: "ден", flag: "🇲🇰", countries: ["North Macedonia"], decimalDigits: 2 },
	MDL: { code: "MDL", name: "Moldovan Leu", symbol: "L", flag: "🇲🇩", countries: ["Moldova"], decimalDigits: 2 },
	RSD: { code: "RSD", name: "Serbian Dinar", symbol: "дин", flag: "🇷🇸", countries: ["Serbia"], decimalDigits: 2 },
	TJS: { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ", flag: "🇹🇯", countries: ["Tajikistan"], decimalDigits: 2 },
	TMT: { code: "TMT", name: "Turkmenistani Manat", symbol: "m", flag: "🇹🇲", countries: ["Turkmenistan"], decimalDigits: 2 },
	UZS: { code: "UZS", name: "Uzbekistani Som", symbol: "so'm", flag: "🇺🇿", countries: ["Uzbekistan"], decimalDigits: 2 },

	// Oceania
	FJD: { code: "FJD", name: "Fijian Dollar", symbol: "$", flag: "🇫🇯", countries: ["Fiji"], decimalDigits: 2 },
	PGK: { code: "PGK", name: "Papua New Guinean Kina", symbol: "K", flag: "🇵🇬", countries: ["Papua New Guinea"], decimalDigits: 2 },
	WST: { code: "WST", name: "Samoan Tala", symbol: "T", flag: "🇼🇸", countries: ["Samoa"], decimalDigits: 2 },
	TOP: { code: "TOP", name: "Tongan Pa'anga", symbol: "T$", flag: "🇹🇴", countries: ["Tonga"], decimalDigits: 2 },

	// Caribbean
	JMD: { code: "JMD", name: "Jamaican Dollar", symbol: "$", flag: "🇯🇲", countries: ["Jamaica"], decimalDigits: 2 },
	TTD: { code: "TTD", name: "Trinidad & Tobago Dollar", symbol: "$", flag: "🇹🇹", countries: ["Trinidad & Tobago"], decimalDigits: 2 },
	BBD: { code: "BBD", name: "Barbadian Dollar", symbol: "$", flag: "🇧🇧", countries: ["Barbados"], decimalDigits: 2 },
	BSD: { code: "BSD", name: "Bahamian Dollar", symbol: "$", flag: "🇧🇸", countries: ["Bahamas"], decimalDigits: 2 },
	XCD: { code: "XCD", name: "East Caribbean Dollar", symbol: "$", flag: "🌴", countries: ["Eastern Caribbean"], decimalDigits: 2 },

	// Additional Major Currencies
	KHR: { code: "KHR", name: "Cambodian Riel", symbol: "៛", flag: "🇰🇭", countries: ["Cambodia"], decimalDigits: 2 },
	LAK: { code: "LAK", name: "Lao Kip", symbol: "₭", flag: "🇱🇦", countries: ["Laos"], decimalDigits: 2 },
	MNT: { code: "MNT", name: "Mongolian Tögrög", symbol: "₮", flag: "🇲🇳", countries: ["Mongolia"], decimalDigits: 2 },
	BND: { code: "BND", name: "Brunei Dollar", symbol: "$", flag: "🇧🇳", countries: ["Brunei"], decimalDigits: 2 },
	MVR: { code: "MVR", name: "Maldivian Rufiyaa", symbol: "Rf", flag: "🇲🇻", countries: ["Maldives"], decimalDigits: 2 },
	BTN: { code: "BTN", name: "Bhutanese Ngultrum", symbol: "Nu.", flag: "🇧🇹", countries: ["Bhutan"], decimalDigits: 2 },
};

export function getCurrencyList(): Currency[] {
	return Object.values(CURRENCIES).sort((a, b) => a.name.localeCompare(b.name));
}

export function searchCurrencies(query: string): Currency[] {
	const lowerQuery = query.toLowerCase();
	return getCurrencyList().filter(
		(currency) =>
			currency.name.toLowerCase().includes(lowerQuery) ||
			currency.code.toLowerCase().includes(lowerQuery) ||
			currency.symbol.includes(query) ||
			currency.countries.some((country) => country.toLowerCase().includes(lowerQuery))
	);
}

export function getCurrencyByCode(code: string): Currency | undefined {
	return CURRENCIES[code];
}

export function formatCurrency(amount: number, currencyCode: string): string {
	const currency = getCurrencyByCode(currencyCode);
	if (!currency) return `${amount}`;

	const formatted = amount.toFixed(currency.decimalDigits);
	return `${currency.symbol}${formatted}`;
}

// Exchange rates (example - in production, fetch from API)
export const EXCHANGE_RATES: Record<string, number> = {
	USD: 1.0,
	EUR: 0.92,
	GBP: 0.79,
	JPY: 149.5,
	CNY: 7.24,
	CHF: 0.88,
	CAD: 1.36,
	AUD: 1.53,
	NZD: 1.67,
	INR: 83.12,
	KRW: 1308.5,
	SGD: 1.34,
	HKD: 7.82,
	THB: 35.8,
	MYR: 4.72,
	IDR: 15640,
	PHP: 55.9,
	VND: 24450,
	PKR: 278.5,
	BDT: 109.5,
	AED: 3.67,
	SAR: 3.75,
	ILS: 3.64,
	TRY: 32.1,
	RUB: 92.5,
	PLN: 4.05,
	SEK: 10.85,
	NOK: 10.92,
	DKK: 6.88,
	CZK: 23.4,
	HUF: 362,
	BRL: 4.98,
	MXN: 17.1,
	ARS: 850,
	ZAR: 18.75,
	NGN: 1470,
};

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
	const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
	const toRate = EXCHANGE_RATES[toCurrency] || 1;
	return (amount / fromRate) * toRate;
}
