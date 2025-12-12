import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TAX_REGULATIONS, calculateIncomeTax, getCountryList, type TaxRegulation } from "@/lib/tax-regulations";
import { Globe, Calculator, FileText, AlertCircle, TrendingUp, Calendar, Info, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function TaxComplianceView() {
	const { t } = useTranslation();
	const [selectedCountry, setSelectedCountry] = useState<string>("US");
	const [income, setIncome] = useState<string>("");
	const [calculationResult, setCalculationResult] = useState<{
		taxOwed: number;
		effectiveRate: number;
		breakdown: Array<{ bracket: string; taxOnBracket: number }>;
	} | null>(null);

	const countries = getCountryList();
	const regulation: TaxRegulation | undefined = TAX_REGULATIONS[selectedCountry];

	const handleCalculate = () => {
		const incomeValue = parseFloat(income);
		if (isNaN(incomeValue) || incomeValue < 0) {
			toast.error("Please enter a valid income amount");
			return;
		}

		try {
			const result = calculateIncomeTax(incomeValue, selectedCountry);
			setCalculationResult(result);
			toast.success("Tax calculated successfully!");
		} catch (error) {
			toast.error("Failed to calculate tax");
		}
	};

	if (!regulation) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-slate-500">
					Select a country to view tax regulations
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header Card */}
			<Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
				<CardHeader>
					<div className="flex items-center justify-between flex-wrap gap-4">
						<div className="flex items-center gap-3">
							<div className="bg-emerald-500 p-2.5 rounded-lg">
								<Globe className="h-6 w-6 text-white" />
							</div>
							<div>
								<CardTitle className="text-2xl">Global Tax Compliance</CardTitle>
								<CardDescription className="text-slate-600">
									Comprehensive tax regulations for {countries.length} countries worldwide
								</CardDescription>
							</div>
						</div>
						<Badge variant="secondary" className="text-sm px-4 py-1.5">
							Tax Year {regulation.taxYear}
						</Badge>
					</div>
				</CardHeader>
			</Card>

			{/* Country Selection */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Globe className="h-5 w-5" />
						Select Country/Jurisdiction
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="country">Country</Label>
							<Select value={selectedCountry} onValueChange={setSelectedCountry}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{countries.map((country) => (
										<SelectItem key={country.code} value={country.code}>
											{country.name} ({country.currency})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-end">
							<Alert>
								<Info className="h-4 w-4" />
								<AlertDescription>
									Selected: <strong>{regulation.country}</strong> ({regulation.currency})
								</AlertDescription>
							</Alert>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Tax Calculator */}
			<Card className="border-blue-200">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5 text-blue-600" />
						Income Tax Calculator
					</CardTitle>
					<CardDescription>
						Calculate your tax liability based on {regulation.country} tax regulations
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="grid gap-2">
							<Label htmlFor="income">Annual Income ({regulation.currencySymbol})</Label>
							<Input
								id="income"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={income}
								onChange={(e) => setIncome(e.target.value)}
							/>
						</div>
						<div className="flex items-end">
							<Button onClick={handleCalculate} className="w-full">
								<Calculator className="h-4 w-4 mr-2" />
								Calculate Tax
							</Button>
						</div>
					</div>

					{calculationResult && (
						<div className="mt-6 space-y-4">
							<Separator />
							<div className="grid gap-4 md:grid-cols-3">
								<Card className="bg-slate-50">
									<CardContent className="pt-6">
										<div className="text-sm text-slate-600 mb-1">Tax Owed</div>
										<div className="text-2xl font-bold text-rose-600">
											{regulation.currencySymbol}
											{calculationResult.taxOwed.toLocaleString()}
										</div>
									</CardContent>
								</Card>
								<Card className="bg-slate-50">
									<CardContent className="pt-6">
										<div className="text-sm text-slate-600 mb-1">Effective Rate</div>
										<div className="text-2xl font-bold text-amber-600">
											{calculationResult.effectiveRate.toFixed(2)}%
										</div>
									</CardContent>
								</Card>
								<Card className="bg-slate-50">
									<CardContent className="pt-6">
										<div className="text-sm text-slate-600 mb-1">Net Income</div>
										<div className="text-2xl font-bold text-emerald-600">
											{regulation.currencySymbol}
											{(parseFloat(income) - calculationResult.taxOwed).toLocaleString()}
										</div>
									</CardContent>
								</Card>
							</div>

							<Card>
								<CardHeader>
									<CardTitle className="text-base">Tax Breakdown by Bracket</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Income Bracket</TableHead>
												<TableHead className="text-right">Tax Amount</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{calculationResult.breakdown.map((item, index) => (
												<TableRow key={index}>
													<TableCell className="font-medium">{item.bracket}</TableCell>
													<TableCell className="text-right">
														{regulation.currencySymbol}
														{item.taxOnBracket.toLocaleString()}
													</TableCell>
												</TableRow>
											))}
											<TableRow className="font-bold bg-slate-50">
												<TableCell>Total Tax</TableCell>
												<TableCell className="text-right text-rose-600">
													{regulation.currencySymbol}
													{calculationResult.taxOwed.toLocaleString()}
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Tax Regulations Details */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						{regulation.country} Tax Regulations
					</CardTitle>
					<CardDescription>
						Comprehensive overview of tax rules and rates for {regulation.taxYear}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="income" className="w-full">
						<TabsList className="grid w-full grid-cols-5">
							<TabsTrigger value="income">Income Tax</TabsTrigger>
							<TabsTrigger value="corporate">Corporate</TabsTrigger>
							<TabsTrigger value="vat">VAT/Sales</TabsTrigger>
							<TabsTrigger value="other">Other Taxes</TabsTrigger>
							<TabsTrigger value="deadlines">Deadlines</TabsTrigger>
						</TabsList>

						<TabsContent value="income" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">Income Tax Brackets</CardTitle>
								</CardHeader>
								<CardContent>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Income Range</TableHead>
												<TableHead className="text-right">Tax Rate</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{regulation.incomeTax.brackets.map((bracket, index) => (
												<TableRow key={index}>
													<TableCell>
														{regulation.currencySymbol}
														{bracket.min.toLocaleString()} -{" "}
														{bracket.max
															? `${regulation.currencySymbol}${bracket.max.toLocaleString()}`
															: "∞"}
													</TableCell>
													<TableCell className="text-right font-medium">
														{bracket.rate}%
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>

									{(regulation.incomeTax.standardDeduction ||
										regulation.incomeTax.personalAllowance) && (
										<Alert className="mt-4">
											<Info className="h-4 w-4" />
											<AlertTitle>Tax-Free Allowance</AlertTitle>
											<AlertDescription>
												{regulation.incomeTax.standardDeduction && (
													<div>
														Standard Deduction: {regulation.currencySymbol}
														{regulation.incomeTax.standardDeduction.toLocaleString()}
													</div>
												)}
												{regulation.incomeTax.personalAllowance && (
													<div>
														Personal Allowance: {regulation.currencySymbol}
														{regulation.incomeTax.personalAllowance.toLocaleString()}
													</div>
												)}
											</AlertDescription>
										</Alert>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="corporate" className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Standard Corporate Tax</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="text-3xl font-bold text-emerald-600">
											{regulation.corporateTax.standardRate}%
										</div>
									</CardContent>
								</Card>

								{regulation.corporateTax.smallBusinessRate && (
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Small Business Rate</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="text-3xl font-bold text-blue-600">
												{regulation.corporateTax.smallBusinessRate}%
											</div>
											{regulation.corporateTax.threshold && (
												<div className="text-sm text-slate-600 mt-2">
													For profits up to {regulation.currencySymbol}
													{regulation.corporateTax.threshold.toLocaleString()}
												</div>
											)}
										</CardContent>
									</Card>
								)}
							</div>
						</TabsContent>

						<TabsContent value="vat" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										VAT/Sales Tax Rates
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
										<span className="font-medium">Standard Rate</span>
										<Badge className="text-base px-3 py-1">
											{regulation.vat.standardRate}%
										</Badge>
									</div>

									{regulation.vat.reducedRates.length > 0 && (
										<div className="space-y-2">
											<div className="text-sm font-medium text-slate-600">
												Reduced Rates
											</div>
											{regulation.vat.reducedRates.map((rate, index) => (
												<div
													key={index}
													className="flex items-center justify-between p-3 border rounded-lg"
												>
													<span className="text-sm">{rate.description}</span>
													<Badge variant="secondary">{rate.rate}%</Badge>
												</div>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="other" className="space-y-4">
							<div className="grid gap-4">
								{/* Social Security */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Social Security Contributions</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										<div className="flex justify-between p-2 bg-slate-50 rounded">
											<span>Employee Rate</span>
											<span className="font-bold">
												{regulation.socialSecurity.employeeRate}%
											</span>
										</div>
										<div className="flex justify-between p-2 bg-slate-50 rounded">
											<span>Employer Rate</span>
											<span className="font-bold">
												{regulation.socialSecurity.employerRate}%
											</span>
										</div>
										{regulation.socialSecurity.cap && (
											<div className="text-sm text-slate-600 mt-2">
												Cap: {regulation.currencySymbol}
												{regulation.socialSecurity.cap.toLocaleString()}
											</div>
										)}
									</CardContent>
								</Card>

								{/* Capital Gains */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Capital Gains Tax</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										<div className="flex justify-between p-2 bg-slate-50 rounded">
											<span>Short-term (&lt;1 year)</span>
											<span className="font-bold text-rose-600">
												{regulation.capitalGainsTax.shortTerm}%
											</span>
										</div>
										<div className="flex justify-between p-2 bg-slate-50 rounded">
											<span>Long-term (&gt;1 year)</span>
											<span className="font-bold text-emerald-600">
												{regulation.capitalGainsTax.longTerm}%
											</span>
										</div>
									</CardContent>
								</Card>

								{/* Dividend Tax */}
								<Card>
									<CardHeader>
										<CardTitle className="text-base">Dividend Tax</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex justify-between items-center">
											<span>Dividend Income Tax Rate</span>
											<span className="text-2xl font-bold text-purple-600">
												{regulation.dividendTax.rate}%
											</span>
										</div>
										{regulation.dividendTax.allowance && (
											<div className="text-sm text-slate-600 mt-2">
												Tax-free allowance: {regulation.currencySymbol}
												{regulation.dividendTax.allowance.toLocaleString()}
											</div>
										)}
									</CardContent>
								</Card>

								{/* Inheritance Tax */}
								{regulation.inheritanceTax.applicable && (
									<Card>
										<CardHeader>
											<CardTitle className="text-base">Inheritance/Estate Tax</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-2">
												<div className="flex justify-between p-2 bg-slate-50 rounded">
													<span>Tax Rate</span>
													<span className="font-bold">
														{regulation.inheritanceTax.rate}%
													</span>
												</div>
												{regulation.inheritanceTax.threshold && (
													<div className="text-sm text-slate-600">
														Tax-free threshold: {regulation.currencySymbol}
														{regulation.inheritanceTax.threshold.toLocaleString()}
													</div>
												)}
											</div>
										</CardContent>
									</Card>
								)}
							</div>
						</TabsContent>

						<TabsContent value="deadlines" className="space-y-4">
							<Card>
								<CardHeader>
									<CardTitle className="text-base flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										Tax Filing Deadlines
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<div className="font-medium">Individual Tax Returns</div>
											<div className="text-sm text-slate-600">Personal income tax filing</div>
										</div>
										<Badge variant="outline" className="text-base">
											{regulation.taxDeadlines.individual}
										</Badge>
									</div>

									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<div className="font-medium">Corporate Tax Returns</div>
											<div className="text-sm text-slate-600">Business tax filing</div>
										</div>
										<Badge variant="outline" className="text-base">
											{regulation.taxDeadlines.corporate}
										</Badge>
									</div>

									<div className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<div className="font-medium">VAT/Sales Tax</div>
											<div className="text-sm text-slate-600">VAT return submission</div>
										</div>
										<Badge variant="outline" className="text-base">
											{regulation.taxDeadlines.vat}
										</Badge>
									</div>
								</CardContent>
							</Card>

							{regulation.specialRules.length > 0 && (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>Special Tax Rules & Considerations</AlertTitle>
									<AlertDescription>
										<ul className="mt-2 space-y-1 list-disc list-inside">
											{regulation.specialRules.map((rule, index) => (
												<li key={index} className="text-sm">
													{rule}
												</li>
											))}
										</ul>
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
}
