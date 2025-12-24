import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

interface GooglePayButtonProps {
	amount: string;
	description: string;
	onSuccess?: (details: unknown) => void;
	onError?: (error: Error) => void;
	onCancel?: () => void;
}

export function GooglePayButton({
	amount,
	description,
	onSuccess,
	onError,
}: GooglePayButtonProps) {
	const [isEligible] = useState(true); // Always show for demo purposes
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		// In production, check if device supports Google Pay
		// For now, we'll assume it's available for demo
	}, []);

	const handleGooglePay = async () => {
		setIsProcessing(true);

		try {
			// In production, this would:
			// 1. Create order via PayPal API with Google Pay
			// 2. Show Google Pay sheet
			// 3. Confirm payment

			// For demo purposes, simulate payment
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Save purchase info
			localStorage.setItem('app_purchased', 'true');
			localStorage.setItem('purchase_platform', 'googlepay');
			localStorage.setItem('purchase_date', new Date().toISOString());
			localStorage.setItem('purchase_amount', amount);
			localStorage.setItem('purchase_description', description);

			const mockDetails = {
				id: 'googlepay_' + Math.random().toString(36).substring(7),
				status: 'COMPLETED',
				amount: amount,
				description: description,
			};

			onSuccess?.(mockDetails);
		} catch (error) {
			onError?.(error instanceof Error ? error : new Error('Google Pay failed'));
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
				onClick={handleGooglePay}
				disabled={isProcessing}
				size="lg"
				className="w-full bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300 text-lg py-6"
			>
				<Smartphone className="h-5 w-5 mr-3" />
				{isProcessing ? 'Processing...' : 'Pay with Google Pay'}
			</Button>
		</div>
	);
}
