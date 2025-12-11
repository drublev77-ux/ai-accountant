import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// PayPal SDK Types
interface PayPalSDK {
	Buttons: (options: PayPalButtonsOptions) => {
		render: (container: string | HTMLElement) => Promise<void>;
	};
}

interface PayPalButtonsOptions {
	style?: {
		layout?: "vertical" | "horizontal";
		color?: "gold" | "blue" | "silver" | "white" | "black";
		shape?: "rect" | "pill";
		label?: "paypal" | "checkout" | "buynow" | "pay";
		height?: number;
	};
	createOrder: (data: unknown, actions: PayPalOrderActions) => Promise<string>;
	onApprove: (data: PayPalOrderData, actions: PayPalCaptureActions) => Promise<void>;
	onError?: (err: Error) => void;
	onCancel?: (data: unknown) => void;
}

interface PayPalOrderActions {
	order: {
		create: (orderData: PayPalOrderCreateData) => Promise<string>;
	};
}

interface PayPalOrderCreateData {
	purchase_units: Array<{
		amount: {
			value: string;
			currency_code?: string;
		};
		description?: string;
	}>;
	application_context?: {
		brand_name?: string;
		shipping_preference?: "NO_SHIPPING" | "GET_FROM_FILE" | "SET_PROVIDED_ADDRESS";
	};
}

interface PayPalOrderData {
	orderID: string;
}

interface PayPalCaptureActions {
	order: {
		capture: () => Promise<PayPalCaptureResult>;
	};
}

export interface PayPalCaptureResult {
	id: string;
	status: string;
	payer: {
		email_address?: string;
		name?: {
			given_name?: string;
			surname?: string;
		};
	};
	purchase_units: Array<{
		payments: {
			captures: Array<{
				id: string;
				status: string;
				amount: {
					value: string;
					currency_code: string;
				};
			}>;
		};
	}>;
}

declare global {
	interface Window {
		paypal?: PayPalSDK;
	}
}

interface PayPalButtonProps {
	amount: string;
	description?: string;
	onSuccess?: (details: PayPalCaptureResult) => void;
	onError?: (error: Error) => void;
	onCancel?: () => void;
}

export function PayPalButton({
	amount,
	description = "AI Accountant - Lifetime Access",
	onSuccess,
	onError,
	onCancel,
}: PayPalButtonProps) {
	const [sdkReady, setSdkReady] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const paypalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Check if PayPal SDK is loaded
		const checkPayPalSDK = () => {
			if (window.paypal) {
				setSdkReady(true);
				setIsLoading(false);
			} else {
				// Wait for SDK to load
				const interval = setInterval(() => {
					if (window.paypal) {
						setSdkReady(true);
						setIsLoading(false);
						clearInterval(interval);
					}
				}, 100);

				// Timeout after 10 seconds
				setTimeout(() => {
					if (!window.paypal) {
						setError("PayPal SDK failed to load. Please refresh the page.");
						setIsLoading(false);
						clearInterval(interval);
					}
				}, 10000);

				return () => clearInterval(interval);
			}
		};

		checkPayPalSDK();
	}, []);

	useEffect(() => {
		if (sdkReady && paypalRef.current && window.paypal) {
			// Render PayPal button
			try {
				window.paypal
					.Buttons({
						style: {
							layout: "vertical",
							color: "gold",
							shape: "rect",
							label: "paypal",
							height: 50,
						},
						createOrder: (data, actions) => {
							return actions.order.create({
								purchase_units: [
									{
										amount: {
											value: amount,
											currency_code: "USD",
										},
										description: description,
									},
								],
								application_context: {
									brand_name: "AI Accountant",
									shipping_preference: "NO_SHIPPING",
								},
							});
						},
						onApprove: async (data, actions) => {
							try {
								const details = await actions.order.capture();

								// Store purchase information
								localStorage.setItem("app_purchased", "true");
								localStorage.setItem("purchase_platform", "paypal");
								localStorage.setItem("purchase_date", new Date().toISOString());
								localStorage.setItem("purchase_order_id", details.id);

								onSuccess?.(details);
							} catch (err) {
								const error = err instanceof Error ? err : new Error("Payment capture failed");
								setError("Payment capture failed. Please contact support.");
								onError?.(error);
							}
						},
						onError: (err) => {
							const error = err instanceof Error ? err : new Error("PayPal error occurred");
							setError("An error occurred with PayPal. Please try again.");
							onError?.(error);
						},
						onCancel: (data) => {
							onCancel?.();
						},
					})
					.render(paypalRef.current);
			} catch (err) {
				setError("Failed to initialize PayPal button. Please refresh the page.");
			}
		}
	}, [sdkReady, amount, description, onSuccess, onError, onCancel]);

	if (isLoading) {
		return (
			<Button
				disabled
				size="lg"
				className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg py-6"
			>
				<Loader2 className="h-5 w-5 mr-3 animate-spin" />
				Loading PayPal...
			</Button>
		);
	}

	if (error) {
		return (
			<div className="w-full p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
				<p className="text-red-400 text-sm text-center">{error}</p>
				<Button
					onClick={() => window.location.reload()}
					size="sm"
					variant="outline"
					className="w-full mt-2 border-red-500/50 text-red-400 hover:bg-red-500/20"
				>
					Refresh Page
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full">
			<div ref={paypalRef} className="w-full" />
		</div>
	);
}
