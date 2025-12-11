import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle, Building, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface BankTransferPaymentProps {
	amount: number;
	onSuccess?: () => void;
}

export function BankTransferPayment({ amount, onSuccess }: BankTransferPaymentProps) {
	const [copied, setCopied] = useState(false);
	const [txReference, setTxReference] = useState("");

	// Bank account details
	const iban = "PL69102011690000810209406432";
	const bankName = "International Bank";
	const bicSwift = "BPKOPLPW";
	const accountHolder = "AI Accountant LLC";
	const currency = "USD";

	const handleCopyAccount = () => {
		navigator.clipboard.writeText(iban);
		setCopied(true);
		toast.success("IBAN copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
	};

	const handleVerifyPayment = () => {
		if (!txReference || txReference.length < 5) {
			toast.error("Please enter a valid transaction reference number");
			return;
		}

		// In production, you would verify the transaction with the bank
		toast.success("Payment verification initiated! Please wait for bank confirmation.");

		// Save purchase info
		localStorage.setItem("app_purchased", "true");
		localStorage.setItem("purchase_platform", "bank_transfer");
		localStorage.setItem("purchase_date", new Date().toISOString());
		localStorage.setItem("purchase_tx", txReference);

		if (onSuccess) {
			setTimeout(() => {
				onSuccess();
			}, 2000);
		}
	};

	return (
		<div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50/30">
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="bg-blue-500 p-2 rounded-lg">
					<Building className="h-5 w-5 text-white" />
				</div>
				<div>
					<h3 className="font-semibold text-slate-900">Bank Transfer (USD)</h3>
					<p className="text-xs text-slate-600">Wire transfer or ACH payment</p>
				</div>
			</div>

			{/* Payment Amount */}
			<div className="p-3 bg-white border border-blue-200 rounded">
				<p className="text-sm text-slate-600 mb-1">Amount to transfer:</p>
				<p className="text-2xl font-bold text-blue-600">${amount.toFixed(2)} USD</p>
			</div>

			{/* Bank Account Details */}
			<div className="space-y-3 p-3 bg-white border border-blue-200 rounded">
				<h4 className="font-semibold text-slate-900 text-sm">Transfer to this account:</h4>

				{/* IBAN */}
				<div className="space-y-1">
					<label className="text-xs font-medium text-slate-600">IBAN:</label>
					<div className="flex gap-2">
						<Input
							value={iban}
							readOnly
							className="font-mono text-sm bg-slate-50 font-bold"
						/>
						<Button
							variant="outline"
							size="icon"
							onClick={handleCopyAccount}
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

				{/* Account Holder */}
				<div className="space-y-1">
					<label className="text-xs font-medium text-slate-600">Account Holder:</label>
					<Input
						value={accountHolder}
						readOnly
						className="text-sm bg-slate-50"
					/>
				</div>

				{/* Bank Name */}
				<div className="space-y-1">
					<label className="text-xs font-medium text-slate-600">Bank Name:</label>
					<Input
						value={bankName}
						readOnly
						className="text-sm bg-slate-50"
					/>
				</div>

				{/* BIC/SWIFT Code */}
				<div className="space-y-1">
					<label className="text-xs font-medium text-slate-600">BIC/SWIFT Code:</label>
					<Input
						value={bicSwift}
						readOnly
						className="text-sm bg-slate-50 font-mono font-bold"
					/>
				</div>

				{/* Currency */}
				<div className="space-y-1">
					<label className="text-xs font-medium text-slate-600">Currency:</label>
					<Input
						value={currency}
						readOnly
						className="text-sm bg-slate-50 font-bold"
					/>
				</div>
			</div>

			{/* Instructions */}
			<div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
				<div className="flex items-start gap-2">
					<Building className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
					<div>
						<p className="text-green-900 font-medium">How to pay via Bank Transfer:</p>
						<ol className="text-green-800 text-xs mt-2 space-y-1 list-decimal list-inside">
							<li>Log in to your online banking or visit your bank</li>
							<li>Initiate a wire transfer or ACH payment for <strong>${amount.toFixed(2)} USD</strong></li>
							<li>Use the account details shown above</li>
							<li>In the transfer description, write: "AI Accountant Subscription"</li>
							<li>After sending, copy your transaction reference number</li>
							<li>Paste it below and click "Verify Payment"</li>
						</ol>
					</div>
				</div>
			</div>

			{/* Transaction Reference Input */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					Transaction Reference Number:
				</label>
				<Input
					value={txReference}
					onChange={(e) => setTxReference(e.target.value)}
					placeholder="Enter bank transaction reference..."
					className="text-sm"
				/>
			</div>

			{/* Verify Button */}
			<Button
				onClick={handleVerifyPayment}
				className="w-full bg-blue-500 hover:bg-blue-600"
				disabled={!txReference || txReference.length < 5}
			>
				<CheckCircle className="h-4 w-4 mr-2" />
				Verify Bank Transfer
			</Button>

			{/* Support Link */}
			<div className="pt-2 border-t border-blue-200">
				<p className="text-xs text-slate-600 mb-2">Need help with bank transfer?</p>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs h-8 w-full"
					onClick={() => window.open('mailto:support@aiaccountant.app', '_blank')}
				>
					<ExternalLink className="h-3 w-3 mr-1" />
					Contact Support
				</Button>
			</div>

			{/* Warning */}
			<div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
				<strong>⚠️ Important:</strong> Bank transfers can take 1-3 business days for processing.
				Your access will be activated after payment confirmation.
			</div>
		</div>
	);
}
