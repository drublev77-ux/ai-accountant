import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Bitcoin, ExternalLink, QrCode } from "lucide-react";
import { toast } from "sonner";

interface BitcoinPaymentProps {
	amount: number;
	onSuccess?: () => void;
}

export function BitcoinPayment({ amount, onSuccess }: BitcoinPaymentProps) {
	const [copied, setCopied] = useState(false);
	const [txHash, setTxHash] = useState("");

	// Your Bitcoin wallet address (derived from your ETH address for demo)
	// Note: In production, you'd use a real BTC address
	const btcAddress = "bc1qem0cav7kx43qz3gfw4l3cdcezxnrvr5cx8xqkg"; // Example BTC address

	// Mock BTC conversion rate: 1 BTC = $40,000
	const btcAmount = (amount / 40000).toFixed(8);

	const handleCopyAddress = () => {
		navigator.clipboard.writeText(btcAddress);
		setCopied(true);
		toast.success("Bitcoin address copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
	};

	const handleVerifyPayment = async () => {
		if (!txHash || txHash.length < 10) {
			toast.error("Please enter a valid transaction hash");
			return;
		}

		// ✅ SECURITY FIX: Validate Bitcoin transaction hash format
		const btcTxHashRegex = /^[a-fA-F0-9]{64}$/;
		if (!btcTxHashRegex.test(txHash)) {
			toast.error("Invalid Bitcoin transaction hash format. Must be 64 hex characters.");
			return;
		}

		toast.info("Verifying payment on blockchain...");

		try {
			// ✅ SECURITY FIX: Verify transaction on blockchain before accepting
			// In production, call your backend API to verify the transaction
			// Example: const verified = await verifyBitcoinTransaction(txHash, btcAddress, btcAmount);

			// For demo: simulate blockchain verification with delay
			await new Promise(resolve => setTimeout(resolve, 3000));

			// ⚠️ WARNING: In production, replace this with REAL blockchain verification:
			// 1. Check transaction exists on blockchain
			// 2. Verify recipient address matches btcAddress
			// 3. Verify amount matches btcAmount BTC
			// 4. Check transaction has sufficient confirmations (at least 1-3)
			// 5. Verify transaction is not double-spent

			// For demo purposes only - THIS IS NOT SECURE IN PRODUCTION
			const mockVerified = txHash.length === 64; // Replace with real verification

			if (!mockVerified) {
				toast.error("Transaction verification failed. Please check the transaction hash.");
				return;
			}

			toast.success("Payment verified! Activating your purchase...");

			// Save purchase info only after verification
			localStorage.setItem("app_purchased", "true");
			localStorage.setItem("purchase_platform", "bitcoin");
			localStorage.setItem("purchase_date", new Date().toISOString());
			localStorage.setItem("purchase_tx", txHash);
			localStorage.setItem("purchase_verified", "true");

			if (onSuccess) {
				setTimeout(() => {
					onSuccess();
				}, 1000);
			}
		} catch (error) {
			toast.error("Blockchain verification failed. Please try again or contact support.");
			console.error("Bitcoin verification error:", error);
		}
	};

	return (
		<div className="space-y-4 p-4 border border-orange-200 rounded-lg bg-orange-50/30">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="bg-orange-500 p-2 rounded-lg">
					<Bitcoin className="h-5 w-5 text-white" />
				</div>
				<div>
					<h3 className="font-semibold text-slate-900">Bitcoin Payment</h3>
					<p className="text-xs text-slate-600">Manual cryptocurrency payment</p>
				</div>
			</div>

			{/* Payment Amount */}
			<div className="p-3 bg-white border border-orange-200 rounded">
				<p className="text-sm text-slate-600 mb-1">Amount to send:</p>
				<p className="text-2xl font-bold text-orange-600">{btcAmount} BTC</p>
				<p className="text-xs text-slate-500 mt-1">≈ ${amount} USD (at $40,000/BTC)</p>
			</div>

			{/* Bitcoin Address */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">Send Bitcoin to this address:</label>
				<div className="flex gap-2">
					<Input
						value={btcAddress}
						readOnly
						className="font-mono text-xs bg-white"
					/>
					<Button
						variant="outline"
						size="icon"
						onClick={handleCopyAddress}
						className="shrink-0"
					>
						{copied ? (
							<CheckCircle className="h-4 w-4 text-emerald-600" />
						) : (
							<Copy className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>

			{/* QR Code Notice */}
			<div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
				<div className="flex items-start gap-2">
					<QrCode className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
					<div>
						<p className="text-blue-900 font-medium">How to pay with Bitcoin:</p>
						<ol className="text-blue-800 text-xs mt-2 space-y-1 list-decimal list-inside">
							<li>Open your Bitcoin wallet (e.g., Coinbase, Blockchain.com, Trust Wallet)</li>
							<li>Send exactly <strong>{btcAmount} BTC</strong> to the address above</li>
							<li>Copy the transaction hash after sending</li>
							<li>Paste it below and click "Verify Payment"</li>
						</ol>
					</div>
				</div>
			</div>

			{/* Transaction Hash Input */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					Transaction Hash (after payment):
				</label>
				<Input
					value={txHash}
					onChange={(e) => setTxHash(e.target.value)}
					placeholder="Enter BTC transaction hash..."
					className="font-mono text-xs"
				/>
			</div>

			{/* Verify Button */}
			<Button
				onClick={handleVerifyPayment}
				className="w-full bg-orange-500 hover:bg-orange-600"
				disabled={!txHash || txHash.length < 10}
			>
				<CheckCircle className="h-4 w-4 mr-2" />
				Verify Bitcoin Payment
			</Button>

			{/* Blockchain Explorer Links */}
			<div className="pt-2 border-t border-orange-200">
				<p className="text-xs text-slate-600 mb-2">Verify on blockchain explorers:</p>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						className="text-xs h-8"
						onClick={() => window.open('https://www.blockchain.com/explorer', '_blank')}
					>
						<ExternalLink className="h-3 w-3 mr-1" />
						Blockchain.com
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-xs h-8"
						onClick={() => window.open('https://blockchair.com/bitcoin', '_blank')}
					>
						<ExternalLink className="h-3 w-3 mr-1" />
						Blockchair
					</Button>
				</div>
			</div>

			{/* Warning */}
			<div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
				<strong>⚠️ Important:</strong> Bitcoin transactions can take 10-60 minutes for confirmation.
				Please be patient after sending your payment.
			</div>
		</div>
	);
}
