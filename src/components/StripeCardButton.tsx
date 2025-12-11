import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface StripeCardButtonProps {
	amount: string;
	description: string;
	onSuccess?: (paymentIntent: unknown) => void;
	onError?: (error: Error) => void;
	onCancel?: () => void;
}

declare global {
	interface Window {
		Stripe?: (publishableKey: string) => {
			paymentRequest: (options: {
				country: string;
				currency: string;
				total: { label: string; amount: number };
				requestPayerName: boolean;
				requestPayerEmail: boolean;
			}) => {
				canMakePayment: () => Promise<{ applePay?: boolean; googlePay?: boolean } | null>;
				on: (event: string, callback: (ev: { complete: (status: string) => void; paymentMethod: unknown }) => void) => void;
				show: () => void;
			};
		};
	}
}

export function StripeCardButton({
	amount,
	description,
	onSuccess,
	onError,
}: StripeCardButtonProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Cleanup function
		return () => {
			if (containerRef.current) {
				containerRef.current.innerHTML = '';
			}
		};
	}, []);

	const handleCardPayment = async () => {
		setIsProcessing(true);
		setErrorMessage(null);

		try {
			// In production, you would:
			// 1. Create a payment intent on your backend
			// 2. Use Stripe Elements to collect card details securely
			// 3. Confirm the payment with Stripe

			// For demo purposes, we'll simulate a successful payment
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Save purchase info
			localStorage.setItem('app_purchased', 'true');
			localStorage.setItem('purchase_platform', 'stripe');
			localStorage.setItem('purchase_date', new Date().toISOString());
			localStorage.setItem('purchase_amount', amount);
			localStorage.setItem('purchase_description', description);

			const mockPaymentIntent = {
				id: 'pi_' + Math.random().toString(36).substring(7),
				amount: parseFloat(amount) * 100,
				currency: 'usd',
				status: 'succeeded',
			};

			onSuccess?.(mockPaymentIntent);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : 'Payment failed';
			setErrorMessage(errorMsg);
			onError?.(error instanceof Error ? error : new Error(errorMsg));
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="space-y-2">
			<div ref={containerRef} />

			{errorMessage && (
				<div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-sm text-red-400">
					{errorMessage}
				</div>
			)}

			<Button
				onClick={handleCardPayment}
				disabled={isProcessing}
				size="lg"
				className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg py-6"
			>
				<CreditCard className="h-5 w-5 mr-3" />
				{isProcessing ? 'Processing...' : 'Pay with Credit Card'}
			</Button>

			<p className="text-xs text-center text-slate-500">
				Secure payment powered by Stripe • PCI DSS compliant
			</p>
		</div>
	);
}
