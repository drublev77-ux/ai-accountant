import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Smartphone, Apple, CreditCard, Wallet, RefreshCw } from "lucide-react";
import { PayPalButton } from "@/components/PayPalButton";
import { StripeCardButton } from "@/components/StripeCardButton";
import { ApplePayButton } from "@/components/ApplePayButton";
import { GooglePayButton } from "@/components/GooglePayButton";
import { MetamaskButton } from "@/components/MetamaskButton";
import { BitcoinPayment } from "@/components/BitcoinPayment";
import { BankTransferPayment } from "@/components/BankTransferPayment";
import { useState, useEffect } from "react";
import { type PayPalCaptureResult } from "@/components/PayPalButton";
import { purchaseManager, type PlatformType } from "@/services/purchase-manager";

interface PricingPaywallProps {
	onPurchaseComplete?: () => void;
}

export function PricingPaywall({ onPurchaseComplete }: PricingPaywallProps) {
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [currentPlatform, setCurrentPlatform] = useState<PlatformType>('web');
	const [isRestoring, setIsRestoring] = useState(false);
	const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

	// Detect platform on mount
	useEffect(() => {
		const platform = purchaseManager.getPlatform();
		setCurrentPlatform(platform);
	}, []);

	const currentAmount = selectedPlan === 'monthly' ? '50.00' : '500.00';

	const handlePaymentSuccess = (details: PayPalCaptureResult | unknown) => {
		console.log("Payment successful:", details);

		// Save web purchase info
		localStorage.setItem('app_purchased', 'true');
		localStorage.setItem('purchase_platform', 'web');
		localStorage.setItem('purchase_date', new Date().toISOString());
		localStorage.setItem('purchase_verified', 'true');
		localStorage.setItem('subscription_plan', selectedPlan);

		setShowSuccessMessage(true);
		// Auto-unlock after showing success message
		setTimeout(() => {
			onPurchaseComplete?.();
		}, 2000);
	};

	const handlePaymentError = (error: Error) => {
		console.error("Payment error:", error);
		alert("Payment failed. Please try again or contact support.");
	};

	const handlePaymentCancel = () => {
		console.log("Payment cancelled by user");
	};

	const handleAppStorePurchase = async () => {
		try {
			// Use the unified purchase manager for App Store
			const result = await purchaseManager.purchaseViaStore();

			if (result.success) {
				setShowSuccessMessage(true);
				setTimeout(() => {
					onPurchaseComplete?.();
				}, 2000);
			} else {
				// If IAP not available, fallback to browser redirect
				const appStoreUrl = "https://apps.apple.com/app/ai-accountant/id123456789";
				window.open(appStoreUrl, '_blank');

				// For demo purposes, simulate purchase completion
				setTimeout(() => {
					if (confirm("Did you complete the purchase on App Store?")) {
						localStorage.setItem('app_purchased', 'true');
						localStorage.setItem('purchase_platform', 'appstore');
						localStorage.setItem('purchase_date', new Date().toISOString());
						onPurchaseComplete?.();
					}
				}, 2000);
			}
		} catch (error) {
			console.error('App Store purchase failed:', error);
			alert('Purchase failed. Please try again.');
		}
	};

	const handleGooglePlayPurchase = async () => {
		try {
			// Use the unified purchase manager for Google Play
			const result = await purchaseManager.purchaseViaStore();

			if (result.success) {
				setShowSuccessMessage(true);
				setTimeout(() => {
					onPurchaseComplete?.();
				}, 2000);
			} else {
				// If IAP not available, fallback to browser redirect
				const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.aiaccountant.app";
				window.open(googlePlayUrl, '_blank');

				// For demo purposes, simulate purchase completion
				setTimeout(() => {
					if (confirm("Did you complete the purchase on Google Play?")) {
						localStorage.setItem('app_purchased', 'true');
						localStorage.setItem('purchase_platform', 'googleplay');
						localStorage.setItem('purchase_date', new Date().toISOString());
						onPurchaseComplete?.();
					}
				}, 2000);
			}
		} catch (error) {
			console.error('Google Play purchase failed:', error);
			alert('Purchase failed. Please try again.');
		}
	};

	const handlePalmStorePurchase = async () => {
		try {
			// Use the unified purchase manager for Palm Store
			const result = await purchaseManager.purchaseViaStore();

			if (result.success) {
				setShowSuccessMessage(true);
				setTimeout(() => {
					onPurchaseComplete?.();
				}, 2000);
			} else {
				alert(result.error || 'Palm Store is only available on webOS devices');
			}
		} catch (error) {
			console.error('Palm Store purchase failed:', error);
			alert('Purchase failed. Please try again.');
		}
	};

	const handleRestorePurchases = async () => {
		setIsRestoring(true);

		try {
			const result = await purchaseManager.restorePurchases();

			if (result.success) {
				alert('Purchase restored successfully!');
				onPurchaseComplete?.();
			} else {
				alert('No previous purchases found. Please make a new purchase.');
			}
		} catch (error) {
			console.error('Restore failed:', error);
			alert('Failed to restore purchases. Please try again.');
		} finally {
			setIsRestoring(false);
		}
	};

	const features = [
		"AI-powered financial insights and advice",
		"Unlimited transaction tracking",
		"Smart tax calculation and optimization",
		"Automated financial reports",
		"Bill reminders and notifications",
		"Multi-currency support",
		"Bank-level encryption and security",
		"Priority customer support",
		"Lifetime updates and improvements",
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-950 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
			</div>

			<div className="max-w-4xl w-full relative z-10">
				<div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
					<div className="inline-flex items-center gap-3 mb-4 group">
						<div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-3 rounded-2xl shadow-2xl shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
							<Smartphone className="h-8 w-8 text-white" />
						</div>
						<h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 animate-pulse">
							AI Accountant
						</h1>
					</div>
					<p className="text-2xl text-purple-200 font-light tracking-wide">Your Personal Financial Assistant</p>
				</div>

				<Card className="border-purple-500/30 bg-gradient-to-br from-slate-900/80 via-purple-900/30 to-pink-900/30 backdrop-blur-xl shadow-2xl shadow-purple-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
					<CardHeader className="text-center pb-8">
						<div className="mb-6">
							<Badge variant="secondary" className="mb-2 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-300 border-emerald-400/50 shadow-lg shadow-emerald-500/50 px-4 py-1.5 text-sm font-semibold animate-pulse">
								✨ Subscription Plans ✨
							</Badge>
						</div>

						{/* Plan Selection Buttons */}
						<div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
							<button
								onClick={() => setSelectedPlan('monthly')}
								className={`p-5 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:-rotate-2 ${
									selectedPlan === 'monthly'
										? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/50 scale-105'
										: 'border-slate-600/50 bg-slate-800/30 hover:border-purple-400/50 hover:shadow-purple-500/30'
								}`}
							>
								<div className="text-sm text-purple-300 mb-1 font-medium">Monthly</div>
								<div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">$50</div>
								<div className="text-xs text-purple-300 mt-1">per month</div>
							</button>
							<button
								onClick={() => setSelectedPlan('yearly')}
								className={`p-5 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105 hover:rotate-2 relative ${
									selectedPlan === 'yearly'
										? 'border-emerald-400 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/50 scale-105'
										: 'border-slate-600/50 bg-slate-800/30 hover:border-purple-400/50 hover:shadow-purple-500/30'
								}`}
							>
								<div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg shadow-pink-500/50 font-bold animate-bounce">
									🔥 Save 17%
								</div>
								<div className="text-sm text-purple-300 mb-1 font-medium">Yearly</div>
								<div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">$500</div>
								<div className="text-xs text-purple-300 mt-1">per year</div>
							</button>
						</div>

						<CardTitle className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 mb-3 animate-pulse">
							{selectedPlan === 'monthly' ? '$50' : '$500'}
						</CardTitle>
						<CardDescription className="text-lg text-purple-200 font-medium">
							{selectedPlan === 'monthly' ? '💳 Billed monthly' : '🎯 Billed annually - save $100/year'}
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-8">
						{/* Features List */}
						<div className="grid gap-3">
							{features.map((feature, index) => (
								<div key={index} className="flex items-start gap-3 group hover:translate-x-2 transition-all duration-300">
									<div className="bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-full p-1.5 mt-0.5 shadow-md shadow-emerald-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
										<Check className="h-4 w-4 text-emerald-300" />
									</div>
									<span className="text-purple-100 group-hover:text-white transition-colors duration-300">{feature}</span>
								</div>
							))}
						</div>

						{/* Purchase Buttons */}
						<div className="space-y-4 pt-4">
							{showSuccessMessage && (
								<div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg mb-4">
									<p className="text-emerald-400 text-center font-semibold">
										✓ Payment successful! Unlocking your account...
									</p>
								</div>
							)}

							<p className="text-center text-sm text-slate-400 mb-2">
								Choose your payment method:
							</p>
							<p className="text-center text-xs text-emerald-400 mb-4">
								✓ Secure checkout • ✓ Instant access • ✓ All methods accepted
							</p>

							{/* Platform Badge */}
							{currentPlatform !== 'web' && (
								<div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
									<p className="text-blue-400 text-center text-sm">
										Platform detected: <strong className="capitalize">{currentPlatform === 'googleplay' ? 'Google Play' : currentPlatform === 'appstore' ? 'App Store' : currentPlatform === 'palmstore' ? 'Palm Store' : currentPlatform}</strong>
									</p>
								</div>
							)}

							{/* All Payment Methods - Displayed in Single View */}
							<div className="space-y-6">
								{/* Credit/Debit Cards Section */}
								<div className="space-y-3">
									<div className="flex items-center gap-2 mb-3">
										<CreditCard className="h-5 w-5 text-emerald-400" />
										<h3 className="text-lg font-semibold text-emerald-400">💳 Credit & Debit Cards</h3>
									</div>
									<StripeCardButton
										amount={currentAmount}
										description={`AI Accountant - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`}
										onSuccess={handlePaymentSuccess}
										onError={handlePaymentError}
										onCancel={handlePaymentCancel}
									/>
								</div>

								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-slate-700"></div>
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="bg-slate-800 px-2 text-slate-500">or choose another payment method</span>
									</div>
								</div>

								{/* Digital Wallets Section */}
								<div className="space-y-3">
									<div className="flex items-center gap-2 mb-3">
										<Wallet className="h-5 w-5 text-blue-400" />
										<h3 className="text-lg font-semibold text-blue-400">📱 Digital Wallets</h3>
									</div>
									<PayPalButton
										amount={currentAmount}
										description={`AI Accountant - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`}
										onSuccess={handlePaymentSuccess}
										onError={handlePaymentError}
										onCancel={handlePaymentCancel}
									/>

									<ApplePayButton
										amount={currentAmount}
										description={`AI Accountant - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`}
										onSuccess={handlePaymentSuccess}
										onError={handlePaymentError}
										onCancel={handlePaymentCancel}
									/>

									<GooglePayButton
										amount={currentAmount}
										description={`AI Accountant - ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`}
										onSuccess={handlePaymentSuccess}
										onError={handlePaymentError}
										onCancel={handlePaymentCancel}
									/>
								</div>

								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-slate-700"></div>
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="bg-slate-800 px-2 text-slate-500">or pay with cryptocurrency</span>
									</div>
								</div>

								{/* Cryptocurrency Section */}
								<div className="space-y-3">
									<div className="flex items-center gap-2 mb-3">
										<Wallet className="h-5 w-5 text-orange-400" />
										<h3 className="text-lg font-semibold text-orange-400">🪙 Cryptocurrency</h3>
									</div>

									{/* MetaMask - ETH, USDT, USDC */}
									<div className="space-y-2">
										<div className="flex items-center gap-2 mb-2">
											<span className="text-sm font-semibold text-slate-200">MetaMask (ETH / USDT / USDC)</span>
										</div>
										<MetamaskButton
											amount={selectedPlan === 'monthly' ? 50 : 500}
											onSuccess={() => handlePaymentSuccess({})}
										/>
									</div>

									{/* Bitcoin Payment */}
									<BitcoinPayment
										amount={selectedPlan === 'monthly' ? 50 : 500}
										onSuccess={() => handlePaymentSuccess({})}
									/>
								</div>

								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-slate-700"></div>
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="bg-slate-800 px-2 text-slate-500">or use bank transfer</span>
									</div>
								</div>

								{/* Bank Transfer Section */}
								<div className="space-y-3">
									<div className="flex items-center gap-2 mb-3">
										<CreditCard className="h-5 w-5 text-green-400" />
										<h3 className="text-lg font-semibold text-green-400">🏦 Bank Transfer</h3>
									</div>
									<BankTransferPayment
										amount={selectedPlan === 'monthly' ? 50 : 500}
										onSuccess={() => handlePaymentSuccess({})}
									/>
								</div>

								<div className="relative py-2">
									<div className="absolute inset-0 flex items-center">
										<div className="w-full border-t border-slate-700"></div>
									</div>
									<div className="relative flex justify-center text-xs">
										<span className="bg-slate-800 px-2 text-slate-500">or use app store</span>
									</div>
								</div>

								{/* App Store Section */}
								<div className="space-y-3">
									<div className="flex items-center gap-2 mb-3">
										<Smartphone className="h-5 w-5 text-purple-400" />
										<h3 className="text-lg font-semibold text-purple-400">📲 App Stores</h3>
									</div>

									<Button
										onClick={handleAppStorePurchase}
										size="lg"
										variant="outline"
										className="w-full border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white text-lg py-6"
									>
										<Apple className="h-6 w-6 mr-3" />
										Purchase on App Store
									</Button>

									<Button
										onClick={handleGooglePlayPurchase}
										size="lg"
										variant="outline"
										className="w-full border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white text-lg py-6"
									>
										<Smartphone className="h-6 w-6 mr-3" />
										Purchase on Google Play
									</Button>

									<Button
										onClick={handlePalmStorePurchase}
										size="lg"
										variant="outline"
										className="w-full border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white text-lg py-6"
									>
										<Smartphone className="h-6 w-6 mr-3" />
										Purchase on Palm Store
									</Button>

									<div className="relative py-2">
										<div className="absolute inset-0 flex items-center">
											<div className="w-full border-t border-slate-700"></div>
										</div>
										<div className="relative flex justify-center text-xs">
											<span className="bg-slate-800 px-2 text-slate-500">already purchased?</span>
										</div>
									</div>

									<Button
										onClick={handleRestorePurchases}
										size="lg"
										variant="ghost"
										className="w-full text-slate-300 hover:text-white"
										disabled={isRestoring}
									>
										{isRestoring ? (
											<>
												<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
												Restoring...
											</>
										) : (
											<>
												<RefreshCw className="h-4 w-4 mr-2" />
												Restore Previous Purchase
											</>
										)}
									</Button>
								</div>
							</div>
						</div>

						{/* Trust Badges */}
						<div className="pt-6 border-t border-purple-500/30">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div className="group hover:scale-110 transition-transform duration-300">
									<p className="text-3xl font-bold mb-2 group-hover:animate-bounce">🔒</p>
									<p className="text-xs text-purple-300 font-medium">Secure Payment</p>
								</div>
								<div className="group hover:scale-110 transition-transform duration-300">
									<p className="text-3xl font-bold mb-2 group-hover:animate-bounce">✓</p>
									<p className="text-xs text-purple-300 font-medium">Instant Access</p>
								</div>
								<div className="group hover:scale-110 transition-transform duration-300">
									<p className="text-3xl font-bold mb-2 group-hover:animate-bounce">♻️</p>
									<p className="text-xs text-purple-300 font-medium">Cancel Anytime</p>
								</div>
							</div>
						</div>

						<p className="text-center text-xs text-purple-300/80">
							By purchasing, you agree to our Terms of Service and Privacy Policy.
							<br />
							All payments are processed securely. We accept credit cards, PayPal, Apple Pay, Google Pay, bank transfers (USD), cryptocurrencies (ETH, USDT, USDC, BTC), and in-app purchases via Google Play, App Store, and Palm Store.
							<br />
							<span className="text-emerald-400 font-bold text-sm">✨ Selected plan: {selectedPlan === 'monthly' ? 'Monthly $50/month' : 'Yearly $500/year'}</span>
						</p>
					</CardContent>
				</Card>

				<p className="text-center text-sm text-purple-300 mt-6 animate-pulse">
					💬 Need help? Contact support@aiaccountant.app
				</p>
			</div>
		</div>
	);
}
