import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Apple } from "lucide-react";

interface ApplePayButtonProps {
	amount: string;
	description: string;
	onSuccess?: (details: unknown) => void;
	onError?: (error: Error) => void;
	onCancel?: () => void;
}

export function ApplePayButton({
	amount,
	description,
	onSuccess,
	onError,
}: ApplePayButtonProps) {
	const [isEligible] = useState(true); // Always show for demo purposes
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		// In production, check if device supports Apple Pay
		// For now, we'll assume it's available for demo
	}, []);

	const handleApplePay = async () => {
		setIsProcessing(true);

		try {
			// In production, this would:
			// 1. Create order via PayPal API
			// 2. Show Apple Pay sheet
			// 3. Confirm payment with PayPal

			// For demo purposes, simulate payment
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Save purchase info
			localStorage.setItem('app_purchased', 'true');
			localStorage.setItem('purchase_platform', 'applepay');
			localStorage.setItem('purchase_date', new Date().toISOString());
			localStorage.setItem('purchase_amount', amount);
			localStorage.setItem('purchase_description', description);

			const mockDetails = {
				id: 'applepay_' + Math.random().toString(36).substring(7),
				status: 'COMPLETED',
				amount: amount,
				description: description,
			};

			onSuccess?.(mockDetails);
		} catch (error) {
			onError?.(error instanceof Error ? error : new Error('Apple Pay failed'));
		} finally {
			setIsProcessing(false);
		}
	};

	if (!isEligible) {
		return null;
	}

	return (
		<div className="space-y-2">
			<Button
				onClick={handleApplePay}
				disabled={isProcessing}
				size="lg"
				className="w-full bg-black hover:bg-gray-900 text-white text-lg py-6"
			>
				<Apple className="h-5 w-5 mr-3" />
				{isProcessing ? 'Processing...' : 'Pay with Apple Pay'}
			</Button>
		</div>
	);
}
