/**
 * Comprehensive Tax Regulations Database for Multiple Countries
 * Covers major tax jurisdictions worldwide with accurate tax brackets and rules
 */

export interface TaxBracket {
	min: number;
	max: number | null; // null means infinity
	rate: number; // percentage
}

export interface TaxRegulation {
	country: string;
	countryCode: string;
	currency: string;
	currencySymbol: string;
	taxYear: number;
	incomeTax: {
		brackets: TaxBracket[];
		standardDeduction?: number;
		personalAllowance?: number;
	};
	corporateTax: {
		standardRate: number;
		smallBusinessRate?: number;
		threshold?: number;
	};
	vat: {
		standardRate: number;
		reducedRates: Array<{ rate: number; description: string }>;
	};
	socialSecurity: {
		employeeRate: number;
		employerRate: number;
		cap?: number;
	};
	capitalGainsTax: {
		shortTerm: number;
		longTerm: number;
	};
	dividendTax: {
		rate: number;
		allowance?: number;
	};
	propertyTax: {
		applicable: boolean;
		rateRange?: string;
	};
	inheritanceTax: {
		applicable: boolean;
		threshold?: number;
		rate?: number;
	};
	taxDeadlines: {
		individual: string;
		corporate: string;
		vat: string;
	};
	specialRules: string[];
}

export const TAX_REGULATIONS: Record<string, TaxRegulation> = {
	US: {
		country: "United States",
		countryCode: "US",
		currency: "USD",
		currencySymbol: "$",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 11600, rate: 10 },
				{ min: 11600, max: 47150, rate: 12 },
				{ min: 47150, max: 100525, rate: 22 },
				{ min: 100525, max: 191950, rate: 24 },
				{ min: 191950, max: 243725, rate: 32 },
				{ min: 243725, max: 609350, rate: 35 },
				{ min: 609350, max: null, rate: 37 },
			],
			standardDeduction: 14600,
		},
		corporateTax: {
			standardRate: 21,
		},
		vat: {
			standardRate: 0, // US uses state sales tax instead
			reducedRates: [
				{ rate: 0, description: "Varies by state (0-10%)" },
			],
		},
		socialSecurity: {
			employeeRate: 7.65,
			employerRate: 7.65,
			cap: 168600,
		},
		capitalGainsTax: {
			shortTerm: 37, // taxed as ordinary income
			longTerm: 20,
		},
		dividendTax: {
			rate: 20,
		},
		propertyTax: {
			applicable: true,
			rateRange: "0.5-2.5%",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 13610000,
			rate: 40,
		},
		taxDeadlines: {
			individual: "April 15",
			corporate: "March 15",
			vat: "N/A",
		},
		specialRules: [
			"Alternative Minimum Tax (AMT) may apply",
			"State income taxes vary by state",
			"Net Investment Income Tax (3.8%) on high earners",
		],
	},

	UK: {
		country: "United Kingdom",
		countryCode: "UK",
		currency: "GBP",
		currencySymbol: "£",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 12570, rate: 0 },
				{ min: 12570, max: 50270, rate: 20 },
				{ min: 50270, max: 125140, rate: 40 },
				{ min: 125140, max: null, rate: 45 },
			],
			personalAllowance: 12570,
		},
		corporateTax: {
			standardRate: 25,
			smallBusinessRate: 19,
			threshold: 50000,
		},
		vat: {
			standardRate: 20,
			reducedRates: [
				{ rate: 5, description: "Reduced rate (energy, sanitary products)" },
				{ rate: 0, description: "Zero rate (food, books, children's clothing)" },
			],
		},
		socialSecurity: {
			employeeRate: 12,
			employerRate: 13.8,
		},
		capitalGainsTax: {
			shortTerm: 20,
			longTerm: 20,
		},
		dividendTax: {
			rate: 33.75,
			allowance: 500,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Council Tax - varies by area",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 325000,
			rate: 40,
		},
		taxDeadlines: {
			individual: "January 31",
			corporate: "12 months after accounting period",
			vat: "Quarterly",
		},
		specialRules: [
			"Marriage Allowance available",
			"Personal Savings Allowance",
			"Tax-free dividend allowance",
			"Making Tax Digital (MTD) compliance required",
		],
	},

	DE: {
		country: "Germany",
		countryCode: "DE",
		currency: "EUR",
		currencySymbol: "€",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 11604, rate: 0 },
				{ min: 11604, max: 17005, rate: 14 },
				{ min: 17005, max: 66760, rate: 24 },
				{ min: 66760, max: 277825, rate: 42 },
				{ min: 277825, max: null, rate: 45 },
			],
			personalAllowance: 11604,
		},
		corporateTax: {
			standardRate: 15,
		},
		vat: {
			standardRate: 19,
			reducedRates: [
				{ rate: 7, description: "Reduced rate (food, books, cultural events)" },
			],
		},
		socialSecurity: {
			employeeRate: 20,
			employerRate: 20,
		},
		capitalGainsTax: {
			shortTerm: 26.375,
			longTerm: 26.375,
		},
		dividendTax: {
			rate: 26.375,
			allowance: 1000,
		},
		propertyTax: {
			applicable: true,
			rateRange: "0.26-1%",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 500000,
			rate: 30,
		},
		taxDeadlines: {
			individual: "July 31",
			corporate: "July 31",
			vat: "Monthly/Quarterly",
		},
		specialRules: [
			"Church tax (8-9%) may apply",
			"Solidarity surcharge (5.5%)",
			"Trade tax for businesses",
		],
	},

	FR: {
		country: "France",
		countryCode: "FR",
		currency: "EUR",
		currencySymbol: "€",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 11294, rate: 0 },
				{ min: 11294, max: 28797, rate: 11 },
				{ min: 28797, max: 82341, rate: 30 },
				{ min: 82341, max: 177106, rate: 41 },
				{ min: 177106, max: null, rate: 45 },
			],
		},
		corporateTax: {
			standardRate: 25,
			smallBusinessRate: 15,
			threshold: 42500,
		},
		vat: {
			standardRate: 20,
			reducedRates: [
				{ rate: 10, description: "Intermediate rate (restaurants, renovation)" },
				{ rate: 5.5, description: "Reduced rate (food, books, energy)" },
				{ rate: 2.1, description: "Super-reduced rate (medicine, press)" },
			],
		},
		socialSecurity: {
			employeeRate: 22,
			employerRate: 42,
		},
		capitalGainsTax: {
			shortTerm: 30,
			longTerm: 30,
		},
		dividendTax: {
			rate: 30,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Property tax varies by municipality",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 100000,
			rate: 45,
		},
		taxDeadlines: {
			individual: "May 31 (online)",
			corporate: "May 15",
			vat: "Monthly",
		},
		specialRules: [
			"Wealth tax on high-value assets",
			"Social charges (17.2%) on investment income",
			"Family quotient system",
		],
	},

	CN: {
		country: "China",
		countryCode: "CN",
		currency: "CNY",
		currencySymbol: "¥",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 36000, rate: 3 },
				{ min: 36000, max: 144000, rate: 10 },
				{ min: 144000, max: 300000, rate: 20 },
				{ min: 300000, max: 420000, rate: 25 },
				{ min: 420000, max: 660000, rate: 30 },
				{ min: 660000, max: 960000, rate: 35 },
				{ min: 960000, max: null, rate: 45 },
			],
			standardDeduction: 60000,
		},
		corporateTax: {
			standardRate: 25,
			smallBusinessRate: 5,
			threshold: 3000000,
		},
		vat: {
			standardRate: 13,
			reducedRates: [
				{ rate: 9, description: "Transport, construction, telecom" },
				{ rate: 6, description: "Financial services, life services" },
				{ rate: 0, description: "Exports" },
			],
		},
		socialSecurity: {
			employeeRate: 10.5,
			employerRate: 32,
		},
		capitalGainsTax: {
			shortTerm: 20,
			longTerm: 20,
		},
		dividendTax: {
			rate: 20,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Pilot programs in select cities",
		},
		inheritanceTax: {
			applicable: false,
		},
		taxDeadlines: {
			individual: "March 31 (annual filing)",
			corporate: "May 31",
			vat: "Monthly",
		},
		specialRules: [
			"Additional deductions for education, housing, elderly care",
			"Tax incentives for high-tech enterprises",
			"Individual income tax app filing system",
		],
	},

	JP: {
		country: "Japan",
		countryCode: "JP",
		currency: "JPY",
		currencySymbol: "¥",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 1950000, rate: 5 },
				{ min: 1950000, max: 3300000, rate: 10 },
				{ min: 3300000, max: 6950000, rate: 20 },
				{ min: 6950000, max: 9000000, rate: 23 },
				{ min: 9000000, max: 18000000, rate: 33 },
				{ min: 18000000, max: 40000000, rate: 40 },
				{ min: 40000000, max: null, rate: 45 },
			],
		},
		corporateTax: {
			standardRate: 23.2,
		},
		vat: {
			standardRate: 10,
			reducedRates: [
				{ rate: 8, description: "Food (excluding alcohol, dining out)" },
			],
		},
		socialSecurity: {
			employeeRate: 15,
			employerRate: 15,
		},
		capitalGainsTax: {
			shortTerm: 20.315,
			longTerm: 20.315,
		},
		dividendTax: {
			rate: 20.315,
		},
		propertyTax: {
			applicable: true,
			rateRange: "1.4%",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 30000000,
			rate: 55,
		},
		taxDeadlines: {
			individual: "March 15",
			corporate: "2 months after fiscal year end",
			vat: "March 31",
		},
		specialRules: [
			"Reconstruction Special Income Tax (2.1%)",
			"Residence tax (10%)",
			"Furusato Nozei (hometown tax) donation system",
		],
	},

	CA: {
		country: "Canada",
		countryCode: "CA",
		currency: "CAD",
		currencySymbol: "$",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 55867, rate: 15 },
				{ min: 55867, max: 111733, rate: 20.5 },
				{ min: 111733, max: 173205, rate: 26 },
				{ min: 173205, max: 246752, rate: 29 },
				{ min: 246752, max: null, rate: 33 },
			],
			personalAllowance: 15705,
		},
		corporateTax: {
			standardRate: 15,
			smallBusinessRate: 9,
			threshold: 500000,
		},
		vat: {
			standardRate: 5, // GST
			reducedRates: [
				{ rate: 0, description: "Zero-rated (basic groceries, prescriptions)" },
			],
		},
		socialSecurity: {
			employeeRate: 6.4,
			employerRate: 7.37,
			cap: 68500,
		},
		capitalGainsTax: {
			shortTerm: 33, // 50% of gains taxed as income
			longTerm: 16.5, // 50% inclusion rate
		},
		dividendTax: {
			rate: 25,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Varies by municipality",
		},
		inheritanceTax: {
			applicable: false,
		},
		taxDeadlines: {
			individual: "April 30",
			corporate: "6 months after fiscal year end",
			vat: "Quarterly or annually",
		},
		specialRules: [
			"Provincial taxes additional to federal",
			"TFSA and RRSP contribution limits",
			"Canada Carbon Rebate",
		],
	},

	AU: {
		country: "Australia",
		countryCode: "AU",
		currency: "AUD",
		currencySymbol: "$",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 18200, rate: 0 },
				{ min: 18200, max: 45000, rate: 19 },
				{ min: 45000, max: 120000, rate: 32.5 },
				{ min: 120000, max: 180000, rate: 37 },
				{ min: 180000, max: null, rate: 45 },
			],
			personalAllowance: 18200,
		},
		corporateTax: {
			standardRate: 30,
			smallBusinessRate: 25,
			threshold: 50000000,
		},
		vat: {
			standardRate: 10, // GST
			reducedRates: [
				{ rate: 0, description: "GST-free (basic food, health, education)" },
			],
		},
		socialSecurity: {
			employeeRate: 0, // No social security tax
			employerRate: 11.5, // Superannuation
		},
		capitalGainsTax: {
			shortTerm: 45,
			longTerm: 22.5, // 50% discount
		},
		dividendTax: {
			rate: 45,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Stamp duty varies by state",
		},
		inheritanceTax: {
			applicable: false,
		},
		taxDeadlines: {
			individual: "October 31",
			corporate: "15th of month after quarter end",
			vat: "Monthly or quarterly",
		},
		specialRules: [
			"Medicare Levy (2%)",
			"Franking credits for dividends",
			"Negative gearing on investment properties",
		],
	},

	IN: {
		country: "India",
		countryCode: "IN",
		currency: "INR",
		currencySymbol: "₹",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 300000, rate: 0 },
				{ min: 300000, max: 700000, rate: 5 },
				{ min: 700000, max: 1000000, rate: 10 },
				{ min: 1000000, max: 1200000, rate: 15 },
				{ min: 1200000, max: 1500000, rate: 20 },
				{ min: 1500000, max: null, rate: 30 },
			],
		},
		corporateTax: {
			standardRate: 25,
			smallBusinessRate: 15,
		},
		vat: {
			standardRate: 18, // GST
			reducedRates: [
				{ rate: 28, description: "Luxury goods, sin goods" },
				{ rate: 12, description: "Standard goods" },
				{ rate: 5, description: "Essential goods" },
				{ rate: 0, description: "Zero-rated (exports, certain services)" },
			],
		},
		socialSecurity: {
			employeeRate: 12,
			employerRate: 12,
		},
		capitalGainsTax: {
			shortTerm: 20,
			longTerm: 12.5,
		},
		dividendTax: {
			rate: 30,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Varies by municipality",
		},
		inheritanceTax: {
			applicable: false,
		},
		taxDeadlines: {
			individual: "July 31",
			corporate: "September 30",
			vat: "Monthly",
		},
		specialRules: [
			"Standard deduction ₹50,000",
			"80C deductions up to ₹150,000",
			"Health insurance deduction under 80D",
		],
	},

	RU: {
		country: "Russia",
		countryCode: "RU",
		currency: "RUB",
		currencySymbol: "₽",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 2400000, rate: 13 },
				{ min: 2400000, max: 5000000, rate: 15 },
				{ min: 5000000, max: 20000000, rate: 18 },
				{ min: 20000000, max: 50000000, rate: 20 },
				{ min: 50000000, max: null, rate: 22 },
			],
		},
		corporateTax: {
			standardRate: 20,
		},
		vat: {
			standardRate: 20,
			reducedRates: [
				{ rate: 10, description: "Food products, children's goods, medical products" },
				{ rate: 0, description: "Exports, international transport" },
			],
		},
		socialSecurity: {
			employeeRate: 0,
			employerRate: 30,
		},
		capitalGainsTax: {
			shortTerm: 13,
			longTerm: 13,
		},
		dividendTax: {
			rate: 13,
		},
		propertyTax: {
			applicable: true,
			rateRange: "Up to 2%",
		},
		inheritanceTax: {
			applicable: false,
		},
		taxDeadlines: {
			individual: "April 30",
			corporate: "March 28",
			vat: "Quarterly",
		},
		specialRules: [
			"Simplified taxation system available for small business",
			"Tax deductions for charitable donations",
			"Foreign account reporting requirements",
		],
	},

	BR: {
		country: "Brazil",
		countryCode: "BR",
		currency: "BRL",
		currencySymbol: "R$",
		taxYear: 2025,
		incomeTax: {
			brackets: [
				{ min: 0, max: 24511, rate: 0 },
				{ min: 24511, max: 33919, rate: 7.5 },
				{ min: 33919, max: 45012, rate: 15 },
				{ min: 45012, max: 55976, rate: 22.5 },
				{ min: 55976, max: null, rate: 27.5 },
			],
		},
		corporateTax: {
			standardRate: 34,
		},
		vat: {
			standardRate: 17, // ICMS average
			reducedRates: [
				{ rate: 12, description: "Interstate commerce" },
				{ rate: 7, description: "Some essential goods" },
			],
		},
		socialSecurity: {
			employeeRate: 11,
			employerRate: 20,
		},
		capitalGainsTax: {
			shortTerm: 15,
			longTerm: 15,
		},
		dividendTax: {
			rate: 0, // Currently exempt
		},
		propertyTax: {
			applicable: true,
			rateRange: "IPTU varies by municipality",
		},
		inheritanceTax: {
			applicable: true,
			threshold: 0,
			rate: 8,
		},
		taxDeadlines: {
			individual: "April 30",
			corporate: "July 31",
			vat: "Monthly",
		},
		specialRules: [
			"Complex multi-level tax system",
			"Tax reform in progress",
			"Digital bookkeeping (SPED) required",
		],
	},
};

export function calculateIncomeTax(income: number, countryCode: string): {
	taxOwed: number;
	effectiveRate: number;
	breakdown: Array<{ bracket: string; taxOnBracket: number }>;
} {
	const regulation = TAX_REGULATIONS[countryCode];
	if (!regulation) {
		throw new Error(`Tax regulation not found for country: ${countryCode}`);
	}

	let taxOwed = 0;
	const breakdown: Array<{ bracket: string; taxOnBracket: number }> = [];

	// Apply personal allowance/standard deduction if available
	let taxableIncome = income;
	if (regulation.incomeTax.standardDeduction) {
		taxableIncome = Math.max(0, income - regulation.incomeTax.standardDeduction);
	} else if (regulation.incomeTax.personalAllowance) {
		taxableIncome = Math.max(0, income - regulation.incomeTax.personalAllowance);
	}

	// Calculate tax for each bracket
	for (const bracket of regulation.incomeTax.brackets) {
		if (taxableIncome <= bracket.min) break;

		const bracketMax = bracket.max ?? Infinity;
		const incomeInBracket = Math.min(taxableIncome, bracketMax) - bracket.min;

		if (incomeInBracket > 0) {
			const taxOnBracket = incomeInBracket * (bracket.rate / 100);
			taxOwed += taxOnBracket;

			const bracketLabel = bracket.max
				? `${regulation.currencySymbol}${bracket.min.toLocaleString()} - ${regulation.currencySymbol}${bracket.max.toLocaleString()}`
				: `${regulation.currencySymbol}${bracket.min.toLocaleString()}+`;

			breakdown.push({
				bracket: `${bracketLabel} @ ${bracket.rate}%`,
				taxOnBracket: Math.round(taxOnBracket * 100) / 100,
			});
		}
	}

	const effectiveRate = income > 0 ? (taxOwed / income) * 100 : 0;

	return {
		taxOwed: Math.round(taxOwed * 100) / 100,
		effectiveRate: Math.round(effectiveRate * 100) / 100,
		breakdown,
	};
}

export function getCountryList(): Array<{ code: string; name: string; currency: string }> {
	return Object.entries(TAX_REGULATIONS).map(([code, regulation]) => ({
		code,
		name: regulation.country,
		currency: regulation.currency,
	}));
}
