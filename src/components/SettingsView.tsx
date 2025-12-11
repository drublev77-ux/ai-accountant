import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Smartphone, Apple, ShieldCheck, RefreshCw, Bitcoin, Copy, Check } from "lucide-react";
import { useState } from "react";
import { CurrencyConverter } from "@/components/CurrencyConverter";

export function SettingsView() {
	const [purchaseInfo] = useState({
		purchased: localStorage.getItem('app_purchased') === 'true',
		platform: localStorage.getItem('purchase_platform') || 'unknown',
		date: localStorage.getItem('purchase_date') || new Date().toLocaleDateString(),
	});
	const [copied, setCopied] = useState(false);

	const bitcoinAddress = "bc1qazhtq0xh99jdpmm9pr67pngxh40zt75gnxeslz";

	const handleRestorePurchase = () => {
		// In production, this would verify the purchase with App Store/Google Play
		const purchased = localStorage.getItem('app_purchased') === 'true';
		if (purchased) {
			alert('✓ Purchase verified successfully!');
		} else {
			alert('No previous purchase found. Please purchase the app first.');
		}
	};

	const handleCopyBitcoinAddress = async () => {
		try {
			await navigator.clipboard.writeText(bitcoinAddress);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error('Failed to copy:', err);
		}
	};

	const getPlatformIcon = () => {
		if (purchaseInfo.platform === 'appstore') {
			return <Apple className="h-5 w-5" />;
		}
		if (purchaseInfo.platform === 'googleplay') {
			return <Smartphone className="h-5 w-5" />;
		}
		return <ShieldCheck className="h-5 w-5" />;
	};

	const getPlatformName = () => {
		if (purchaseInfo.platform === 'appstore') return 'App Store';
		if (purchaseInfo.platform === 'googleplay') return 'Google Play';
		return 'Unknown';
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-3xl font-bold text-slate-900">Settings & Account</h2>
				<p className="text-slate-600 mt-1">Manage your subscription and app settings</p>
			</div>

			{/* Purchase Information */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<CheckCircle className="h-5 w-5 text-emerald-500" />
								Purchase Status
							</CardTitle>
							<CardDescription>Your app license information</CardDescription>
						</div>
						<Badge className="bg-emerald-500 hover:bg-emerald-600">
							Active
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
							<div className="bg-blue-500 text-white p-2 rounded-lg">
								{getPlatformIcon()}
							</div>
							<div>
								<p className="text-sm font-medium text-slate-600">Platform</p>
								<p className="text-lg font-semibold text-slate-900">{getPlatformName()}</p>
							</div>
						</div>

						<div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50">
							<div className="bg-emerald-500 text-white p-2 rounded-lg">
								<CheckCircle className="h-5 w-5" />
							</div>
							<div>
								<p className="text-sm font-medium text-slate-600">License Type</p>
								<p className="text-lg font-semibold text-slate-900">Lifetime</p>
							</div>
						</div>
					</div>

					<Separator />

					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span className="text-slate-600">Purchase Price</span>
							<span className="font-semibold text-slate-900">$50.00 USD</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-slate-600">Purchase Date</span>
							<span className="font-semibold text-slate-900">{purchaseInfo.date}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-slate-600">Payment Status</span>
							<span className="font-semibold text-emerald-600">Paid</span>
						</div>
					</div>

					<Button
						onClick={handleRestorePurchase}
						variant="outline"
						className="w-full"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Restore Purchase
					</Button>
				</CardContent>
			</Card>

			{/* Features Included */}
			<Card>
				<CardHeader>
					<CardTitle>Included Features</CardTitle>
					<CardDescription>Everything included in your lifetime license</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2">
						{[
							"AI Financial Assistant",
							"Unlimited Transactions",
							"Tax Calculator",
							"Financial Reports",
							"Bill Reminders",
							"Multi-Currency Support",
							"Priority Support",
							"Lifetime Updates",
						].map((feature, index) => (
							<div key={index} className="flex items-center gap-2">
								<CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
								<span className="text-sm text-slate-700">{feature}</span>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Currency Converter */}
			<CurrencyConverter />

			{/* Bitcoin Donations */}
			<Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
				<CardHeader>
					<div className="flex items-center gap-2">
						<div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-lg">
							<Bitcoin className="h-5 w-5 text-white" />
						</div>
						<div>
							<CardTitle>Support Development</CardTitle>
							<CardDescription>Bitcoin donations are appreciated</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 bg-white rounded-lg border border-orange-200">
						<p className="text-xs font-medium text-slate-600 mb-2">Bitcoin Address</p>
						<div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
							<code className="text-sm font-mono text-slate-900 flex-1 break-all">
								{bitcoinAddress}
							</code>
							<Button
								size="sm"
								variant="outline"
								onClick={handleCopyBitcoinAddress}
								className="flex-shrink-0"
							>
								{copied ? (
									<Check className="h-4 w-4 text-emerald-500" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>
					<p className="text-xs text-slate-600 text-center">
						Your donations help us continue improving this app. Thank you for your support!
					</p>
				</CardContent>
			</Card>

			{/* App Information */}
			<Card>
				<CardHeader>
					<CardTitle>App Information</CardTitle>
					<CardDescription>Version and support details</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="flex justify-between">
						<span className="text-slate-600">Version</span>
						<span className="font-semibold text-slate-900">1.0.0</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-600">Support Email</span>
						<span className="font-semibold text-blue-600">support@aiaccountant.app</span>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-600">Privacy Policy</span>
						<Button variant="link" className="h-auto p-0 text-blue-600">
							View Policy
						</Button>
					</div>
					<div className="flex justify-between">
						<span className="text-slate-600">Terms of Service</span>
						<Button variant="link" className="h-auto p-0 text-blue-600">
							View Terms
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
