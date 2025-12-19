import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Loader2, Check, ChevronsUpDown } from "lucide-react";
import {
	getCurrencyList,
	searchCurrencies,
	convertCurrency,
	EXCHANGE_RATES,
	getCurrencyByCode,
} from "@/lib/currencies";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

export function CurrencyConverter() {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<string>("100");
	const [fromCurrency, setFromCurrency] = useState<string>("USD");
	const [toCurrency, setToCurrency] = useState<string>("RUB");
	const [convertedAmount, setConvertedAmount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [lastUpdated, setLastUpdated] = useState<string>("");
	const [openFrom, setOpenFrom] = useState(false);
	const [openTo, setOpenTo] = useState(false);

	// Fetch exchange rates (using our static rates from currencies.ts)
	const fetchExchangeRates = async () => {
		setIsLoading(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));
			setLastUpdated(new Date().toLocaleString());
		} catch (error) {
			console.error("Failed to fetch exchange rates:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchExchangeRates();
	}, []);

	useEffect(() => {
		const numAmount = parseFloat(amount);
		if (!isNaN(numAmount)) {
			const result = convertCurrency(numAmount, fromCurrency, toCurrency);
			setConvertedAmount(result);
		}
	}, [amount, fromCurrency, toCurrency]);

	const handleSwapCurrencies = () => {
		setFromCurrency(toCurrency);
		setToCurrency(fromCurrency);
	};

	const getExchangeRate = () => {
		const rate = convertCurrency(1, fromCurrency, toCurrency);
		return rate.toFixed(4);
	};

	const fromCurrencyData = getCurrencyByCode(fromCurrency);
	const toCurrencyData = getCurrencyByCode(toCurrency);
	const allCurrencies = getCurrencyList();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<TrendingUp className="h-5 w-5" />
					Currency Converter
				</CardTitle>
				<CardDescription>
					Convert between 100+ world currencies with exchange rates
					{lastUpdated && (
						<span className="block text-xs mt-1">Last updated: {lastUpdated}</span>
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-4">
					{/* From Currency */}
					<div className="grid gap-2">
						<Label htmlFor="amount">Amount</Label>
						<div className="grid grid-cols-[2fr,140px] gap-2">
							<Input
								id="amount"
								type="number"
								step="0.01"
								min="0"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="100.00"
								className="text-lg"
							/>
							<Popover open={openFrom} onOpenChange={setOpenFrom}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={openFrom}
										className="justify-between"
									>
										<span className="flex items-center gap-1">
											{fromCurrencyData?.flag} {fromCurrency}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[300px] p-0">
									<Command>
										<CommandInput placeholder="Search currency..." />
										<CommandEmpty>No currency found.</CommandEmpty>
										<CommandGroup>
											<ScrollArea className="h-[300px]">
												{allCurrencies.map((currency) => (
													<CommandItem
														key={currency.code}
														value={`${currency.code} ${currency.name}`}
														onSelect={() => {
															setFromCurrency(currency.code);
															setOpenFrom(false);
														}}
													>
														<Check
															className={`mr-2 h-4 w-4 ${fromCurrency === currency.code ? "opacity-100" : "opacity-0"}`}
														/>
														<span className="mr-2">{currency.flag}</span>
														<div className="flex flex-col">
															<span className="font-medium">{currency.code}</span>
															<span className="text-xs text-slate-500">{currency.name}</span>
														</div>
													</CommandItem>
												))}
											</ScrollArea>
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					{/* Swap Button */}
					<div className="flex justify-center">
						<Button
							variant="outline"
							size="icon"
							onClick={handleSwapCurrencies}
							className="rounded-full"
							disabled={isLoading}
						>
							<ArrowRightLeft className="h-4 w-4" />
						</Button>
					</div>

					{/* To Currency */}
					<div className="grid gap-2">
						<Label htmlFor="converted">Converted Amount</Label>
						<div className="grid grid-cols-[2fr,140px] gap-2">
							<div className="relative">
								<Input
									id="converted"
									type="text"
									value={isLoading ? "Converting..." : convertedAmount.toFixed(toCurrencyData?.decimalDigits || 2)}
									disabled
									className="text-lg font-bold bg-slate-50"
								/>
								{isLoading && (
									<Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-slate-400" />
								)}
							</div>
							<Popover open={openTo} onOpenChange={setOpenTo}>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										role="combobox"
										aria-expanded={openTo}
										className="justify-between"
									>
										<span className="flex items-center gap-1">
											{toCurrencyData?.flag} {toCurrency}
										</span>
										<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[300px] p-0">
									<Command>
										<CommandInput placeholder="Search currency..." />
										<CommandEmpty>No currency found.</CommandEmpty>
										<CommandGroup>
											<ScrollArea className="h-[300px]">
												{allCurrencies.map((currency) => (
													<CommandItem
														key={currency.code}
														value={`${currency.code} ${currency.name}`}
														onSelect={() => {
															setToCurrency(currency.code);
															setOpenTo(false);
														}}
													>
														<Check
															className={`mr-2 h-4 w-4 ${toCurrency === currency.code ? "opacity-100" : "opacity-0"}`}
														/>
														<span className="mr-2">{currency.flag}</span>
														<div className="flex flex-col">
															<span className="font-medium">{currency.code}</span>
															<span className="text-xs text-slate-500">{currency.name}</span>
														</div>
													</CommandItem>
												))}
											</ScrollArea>
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>

				{/* Exchange Rate Info */}
				<div className="bg-blue-50 p-4 rounded-lg">
					<p className="text-sm text-blue-900">
						<span className="font-medium">Exchange Rate:</span> 1 {fromCurrency} = {getExchangeRate()} {toCurrency}
					</p>
					<p className="text-xs text-blue-700 mt-1">
						{fromCurrencyData?.name} → {toCurrencyData?.name}
					</p>
				</div>

				{/* Quick Convert Buttons */}
				<div className="space-y-2">
					<Label className="text-xs text-slate-600">Quick amounts:</Label>
					<div className="flex gap-2 flex-wrap">
						{[100, 500, 1000, 5000, 10000].map((quickAmount) => (
							<Button
								key={quickAmount}
								variant="outline"
								size="sm"
								onClick={() => setAmount(quickAmount.toString())}
							>
								{quickAmount.toLocaleString()}
							</Button>
						))}
					</div>
				</div>

				{/* Refresh Button */}
				<Button
					variant="outline"
					onClick={fetchExchangeRates}
					disabled={isLoading}
					className="w-full"
				>
					{isLoading ? (
						<>
							<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							Updating...
						</>
					) : (
						"Refresh Rates"
					)}
				</Button>
			</CardContent>
		</Card>
	);
}
