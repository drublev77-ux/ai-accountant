import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, CheckCircle, AlertCircle, Loader2, Bitcoin, Coins } from "lucide-react";
import { toast } from "sonner";

declare global {
	interface Window {
		ethereum?: {
			isMetaMask?: boolean;
			request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
			on?: (event: string, callback: (...args: unknown[]) => void) => void;
			removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
		};
	}
}

type CryptoType = 'ETH' | 'USDT' | 'USDC' | 'BTC';

interface CryptoOption {
	value: CryptoType;
	label: string;
	icon: string;
	contractAddress?: string; // For ERC-20 tokens
	decimals: number;
	description: string;
}

const CRYPTO_OPTIONS: CryptoOption[] = [
	{
		value: 'ETH',
		label: 'Ethereum',
		icon: '⟠',
		decimals: 18,
		description: 'Native ETH payment'
	},
	{
		value: 'USDT',
		label: 'Tether USD',
		icon: '₮',
		contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT on Ethereum Mainnet
		decimals: 6,
		description: 'USDT (ERC-20)'
	},
	{
		value: 'USDC',
		label: 'USD Coin',
		icon: '$',
		contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC on Ethereum Mainnet
		decimals: 6,
		description: 'USDC (ERC-20)'
	},
	{
		value: 'BTC',
		label: 'Bitcoin',
		icon: '₿',
		decimals: 8,
		description: 'Bitcoin (requires separate wallet)'
	}
];

interface MetamaskButtonProps {
	amount: number;
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

export function MetamaskButton({ amount, onSuccess, onError }: MetamaskButtonProps) {
	const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	const [account, setAccount] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('ETH');

	useEffect(() => {
		// Check if MetaMask is installed
		if (typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask) {
			setIsMetaMaskInstalled(true);
			checkConnection();
		}
	}, []);

	const checkConnection = async () => {
		if (!window.ethereum) return;

		try {
			const accounts = await window.ethereum.request({ method: "eth_accounts" }) as string[];
			if (accounts.length > 0) {
				setAccount(accounts[0]);
				setIsConnected(true);
			}
		} catch (error) {
			console.error("Error checking MetaMask connection:", error);
		}
	};

	const connectWallet = async () => {
		if (!window.ethereum) {
			toast.error("MetaMask is not installed");
			return;
		}

		try {
			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			}) as string[];

			if (accounts.length > 0) {
				setAccount(accounts[0]);
				setIsConnected(true);
				toast.success("Wallet connected successfully!");
			}
		} catch (error) {
			console.error("Error connecting to MetaMask:", error);
			toast.error("Failed to connect wallet");
		}
	};

	const handlePayment = async () => {
		if (!isConnected || !window.ethereum) {
			toast.error("Please connect your wallet first");
			return;
		}

		// Your wallet address
		const recipientAddress = "0xcecd3bcf98d5642722258c346c5dc1cdb83c8986";
		const cryptoOption = CRYPTO_OPTIONS.find(c => c.value === selectedCrypto);

		if (!cryptoOption) {
			toast.error("Invalid cryptocurrency selected");
			return;
		}

		// Handle Bitcoin separately (requires different wallet)
		if (selectedCrypto === 'BTC') {
			toast.error("Bitcoin payments require a Bitcoin wallet. Please use MetaMask for ETH, USDT, or USDC payments.");
			return;
		}

		setIsProcessing(true);

		try {
			let txHash: string;

			if (selectedCrypto === 'ETH') {
				// Native ETH payment
				// Mock conversion rate: 1 ETH = $2000
				const ethAmount = (amount / 2000).toFixed(6);
				const weiAmount = BigInt(Math.floor(parseFloat(ethAmount) * 1e18)).toString(16);

				const transactionParameters = {
					to: recipientAddress,
					from: account,
					value: `0x${weiAmount}`,
				};

				txHash = await window.ethereum.request({
					method: "eth_sendTransaction",
					params: [transactionParameters],
				}) as string;
			} else {
				// ERC-20 token payment (USDT or USDC)
				// For stablecoins, amount is 1:1 with USD
				const tokenAmount = amount;
				const tokenAmountHex = BigInt(Math.floor(tokenAmount * Math.pow(10, cryptoOption.decimals))).toString(16);

				// ERC-20 transfer function signature: transfer(address,uint256)
				const transferFunctionSignature = '0xa9059cbb';

				// Encode recipient address (remove 0x and pad to 32 bytes)
				const encodedRecipient = recipientAddress.slice(2).padStart(64, '0');

				// Encode amount (pad to 32 bytes)
				const encodedAmount = tokenAmountHex.padStart(64, '0');

				// Combine data
				const data = transferFunctionSignature + encodedRecipient + encodedAmount;

				const transactionParameters = {
					to: cryptoOption.contractAddress,
					from: account,
					data: data,
				};

				txHash = await window.ethereum.request({
					method: "eth_sendTransaction",
					params: [transactionParameters],
				}) as string;
			}

			toast.success(`${selectedCrypto} payment sent! Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);

			// Save purchase info
			localStorage.setItem("app_purchased", "true");
			localStorage.setItem("purchase_platform", `metamask_${selectedCrypto.toLowerCase()}`);
			localStorage.setItem("purchase_date", new Date().toISOString());
			localStorage.setItem("purchase_tx", txHash);

			if (onSuccess) {
				onSuccess();
			}
		} catch (error) {
			console.error("Payment error:", error);
			const err = error as Error;
			toast.error(`Payment failed: ${err.message || "Unknown error"}`);
			if (onError) {
				onError(err);
			}
		} finally {
			setIsProcessing(false);
		}
	};

	if (!isMetaMaskInstalled) {
		return (
			<Button
				variant="outline"
				className="w-full"
				onClick={() => {
					window.open("https://metamask.io/download/", "_blank");
				}}
			>
				<Wallet className="h-4 w-4 mr-2" />
				Install MetaMask
			</Button>
		);
	}

	if (!isConnected) {
		return (
			<Button
				variant="outline"
				className="w-full border-orange-300 hover:bg-orange-50"
				onClick={connectWallet}
			>
				<Wallet className="h-4 w-4 mr-2 text-orange-600" />
				Connect MetaMask
			</Button>
		);
	}

	const selectedOption = CRYPTO_OPTIONS.find(c => c.value === selectedCrypto);

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-2 rounded">
				<CheckCircle className="h-4 w-4" />
				<span className="flex-1 truncate">Connected: {account}</span>
			</div>

			{/* Currency Selector */}
			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">Select Cryptocurrency:</label>
				<Select value={selectedCrypto} onValueChange={(value) => setSelectedCrypto(value as CryptoType)}>
					<SelectTrigger className="w-full">
						<SelectValue>
							<div className="flex items-center gap-2">
								<span className="text-lg">{selectedOption?.icon}</span>
								<span>{selectedOption?.label}</span>
							</div>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{CRYPTO_OPTIONS.map((crypto) => (
							<SelectItem key={crypto.value} value={crypto.value}>
								<div className="flex items-center gap-2">
									<span className="text-lg">{crypto.icon}</span>
									<div className="flex flex-col">
										<span className="font-medium">{crypto.label}</span>
										<span className="text-xs text-slate-500">{crypto.description}</span>
									</div>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Payment Info */}
			<div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
				<p className="text-blue-900 font-medium mb-1">Payment Details:</p>
				<p className="text-blue-800">
					Amount: <strong>${amount} USD</strong>
				</p>
				<p className="text-blue-800 text-xs mt-1">
					{selectedCrypto === 'ETH'
						? `≈ ${(amount / 2000).toFixed(6)} ETH (at $2000/ETH)`
						: selectedCrypto === 'BTC'
						? 'Bitcoin requires separate wallet'
						: `${amount} ${selectedCrypto} (1:1 USD)`
					}
				</p>
			</div>

			{/* Payment Button */}
			<Button
				className="w-full bg-orange-500 hover:bg-orange-600 text-white"
				onClick={handlePayment}
				disabled={isProcessing || selectedCrypto === 'BTC'}
			>
				{isProcessing ? (
					<>
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
						Processing {selectedCrypto} payment...
					</>
				) : selectedCrypto === 'BTC' ? (
					<>
						<AlertCircle className="h-4 w-4 mr-2" />
						Bitcoin Not Supported via MetaMask
					</>
				) : (
					<>
						<Coins className="h-4 w-4 mr-2" />
						Pay ${amount} with {selectedCrypto}
					</>
				)}
			</Button>

			{/* Wallet Address Info */}
			<div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
				<p className="text-slate-600">
					<strong>Recipient:</strong> 0xcecd...8986
				</p>
				<p className="text-slate-500 mt-1">
					All payments go to your secure wallet
				</p>
			</div>
		</div>
	);
}
