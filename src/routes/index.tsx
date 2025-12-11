import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardView } from "@/components/DashboardView";
import { TransactionsView } from "@/components/TransactionsView";
import { AIAssistantView } from "@/components/AIAssistantView";
import { TaxCalculatorView } from "@/components/TaxCalculatorView";
import { TaxComplianceView } from "@/components/TaxComplianceView";
import { ReportsView } from "@/components/ReportsView";
import { RemindersView } from "@/components/RemindersView";
import { SettingsView } from "@/components/SettingsView";
import { InvoicesView } from "@/components/InvoicesView";
import { PricingPaywall } from "@/components/PricingPaywall";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LayoutDashboard, Receipt, MessageSquare, Calculator, FileText, Bell, Settings, FileSpreadsheet, Globe } from "lucide-react";

export const Route = createFileRoute("/")({
	component: () => (
		<Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
			<div className="text-white text-xl">Loading...</div>
		</div>}>
			<App />
		</Suspense>
	),
});

function App() {
	const { t, i18n } = useTranslation();
	const [activeTab, setActiveTab] = useState("dashboard");
	const [isPurchased, setIsPurchased] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Check purchase status on mount
	useEffect(() => {
		const checkPurchaseStatus = () => {
			const purchased = localStorage.getItem('app_purchased') === 'true';
			setIsPurchased(purchased);
			setIsLoading(false);
		};

		checkPurchaseStatus();
	}, []);

	// Handle purchase completion
	const handlePurchaseComplete = () => {
		setIsPurchased(true);
	};

	// Show loading state briefly
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
				<div className="text-white text-xl">{t("app.loading")}</div>
			</div>
		);
	}

	// Show paywall if not purchased
	if (!isPurchased) {
		return <PricingPaywall onPurchaseComplete={handlePurchaseComplete} />;
	}

	return (
		<div key={i18n.language} className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 left-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>

			<header className="bg-gradient-to-r from-white/80 via-purple-50/80 to-pink-50/80 backdrop-blur-xl border-b border-purple-200/50 shadow-lg shadow-purple-200/50 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between gap-3">
						<div className="flex items-center gap-3 group">
							<div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-3 rounded-2xl shadow-xl shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
								<Calculator className="h-6 w-6 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">{t("app.title")}</h1>
								<p className="text-sm text-purple-600 font-medium">{t("app.subtitle")}</p>
							</div>
						</div>
						<LanguageSwitcher />
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6 relative z-10">
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-1.5 h-auto bg-gradient-to-r from-white/80 via-purple-50/80 to-pink-50/80 backdrop-blur-xl border border-purple-200/50 shadow-lg shadow-purple-200/30 p-1.5">
						<TabsTrigger value="dashboard" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<LayoutDashboard className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.dashboard")}</span>
						</TabsTrigger>
						<TabsTrigger value="transactions" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<Receipt className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.transactions")}</span>
						</TabsTrigger>
						<TabsTrigger value="invoices" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.invoices")}</span>
						</TabsTrigger>
						<TabsTrigger value="assistant" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<MessageSquare className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.assistant")}</span>
						</TabsTrigger>
						<TabsTrigger value="tax" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<Calculator className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.tax")}</span>
						</TabsTrigger>
						<TabsTrigger value="compliance" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<Globe className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.compliance")}</span>
						</TabsTrigger>
						<TabsTrigger value="reports" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<FileText className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.reports")}</span>
						</TabsTrigger>
						<TabsTrigger value="reminders" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<Bell className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.reminders")}</span>
						</TabsTrigger>
						<TabsTrigger value="settings" className="flex items-center justify-center gap-1.5 px-2 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 text-xs sm:text-sm">
							<Settings className="h-4 w-4 flex-shrink-0" />
							<span className="hidden sm:inline truncate">{t("tabs.settings")}</span>
						</TabsTrigger>
					</TabsList>

					<TabsContent value="dashboard" className="space-y-4">
						<DashboardView />
					</TabsContent>

					<TabsContent value="transactions">
						<TransactionsView />
					</TabsContent>

					<TabsContent value="invoices">
						<InvoicesView />
					</TabsContent>

					<TabsContent value="assistant">
						<AIAssistantView />
					</TabsContent>

					<TabsContent value="tax">
						<TaxCalculatorView />
					</TabsContent>

					<TabsContent value="compliance">
						<TaxComplianceView />
					</TabsContent>

					<TabsContent value="reports">
						<ReportsView />
					</TabsContent>

					<TabsContent value="reminders">
						<RemindersView />
					</TabsContent>

					<TabsContent value="settings">
						<SettingsView />
					</TabsContent>
				</Tabs>
			</main>
		</div>
	);
}
