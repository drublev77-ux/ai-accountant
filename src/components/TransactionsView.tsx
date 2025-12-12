import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionORM, TransactionType, type TransactionModel } from "@/components/data/orm/orm_transaction";
import { APP_CONFIG } from "@/main";
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Pencil, Camera, Upload, Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SyncManager } from "@/lib/sync-manager";
import { NetworkStatusCard } from "@/components/NetworkStatus";
import { useMetaMask } from "@/hooks/useMetaMask";

export function TransactionsView() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isCryptoDialogOpen, setIsCryptoDialogOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<TransactionModel | null>(null);
	const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const parentRef = useRef<HTMLDivElement>(null);

	const { account, balance, isConnected, connect, disconnect, sendTransaction, hasMetaMask } = useMetaMask();

	const [formData, setFormData] = useState({
		type: "1",
		category: "",
		amount: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	});

	const [cryptoFormData, setCryptoFormData] = useState({
		type: "2",
		category: "Crypto",
		to_address: "",
		amount_eth: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	});

	const { data: transactions = [], isLoading } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results
				.filter((t) => t.user_id === userId)
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		},
	});

	// Virtualization setup
	const rowVirtualizer = useVirtualizer({
		count: transactions.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60, // Estimated row height in pixels
		overscan: 5, // Number of items to render outside visible area
	});

	const createMutation = useMutation({
		mutationFn: async (data: Partial<TransactionModel>) => {
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				const orm = TransactionORM.getInstance();
				return await orm.insertTransaction([data as TransactionModel]);
			} else {
				// Save offline
				const transaction = data as TransactionModel;
				await syncManager.saveOffline(transaction, 'create');
				return [transaction];
			}
		},
		onSuccess: (result, variables) => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				toast.success("Transaction added successfully");
			} else {
				toast.success("Transaction saved offline - will sync when online");
			}

			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to add transaction");
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (transaction: TransactionModel) => {
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				const orm = TransactionORM.getInstance();
				return await orm.setTransactionById(transaction.id, transaction);
			} else {
				// Save offline
				await syncManager.saveOffline(transaction, 'update');
				return transaction;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				toast.success("Transaction updated successfully");
			} else {
				toast.success("Transaction updated offline - will sync when online");
			}

			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to update transaction");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				const orm = TransactionORM.getInstance();
				await orm.deleteTransactionById(id);
			} else {
				// Delete offline - find transaction first
				const transaction = transactions.find(t => t.id === id);
				if (transaction) {
					await syncManager.saveOffline(transaction, 'delete');
				}
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			const syncManager = SyncManager.getInstance();
			const isOnline = syncManager.isNetworkOnline();

			if (isOnline) {
				toast.success("Transaction deleted successfully");
			} else {
				toast.success("Transaction deleted offline - will sync when online");
			}
		},
		onError: () => {
			toast.error("Failed to delete transaction");
		},
	});

	const sendCryptoMutation = useMutation({
		mutationFn: async (data: typeof cryptoFormData) => {
			if (!isConnected || !account) {
				throw new Error("MetaMask not connected");
			}

			// Send ETH transaction via MetaMask
			const tx = await sendTransaction({
				to: data.to_address,
				value: data.amount_eth,
			});

			if (!tx) {
				throw new Error("Transaction failed");
			}

			// Wait for transaction confirmation
			toast.info("Waiting for transaction confirmation...");
			const receipt = await tx.wait();

			if (!receipt) {
				throw new Error("Transaction receipt not found");
			}

			// Save transaction to database
			const transactionData: Partial<TransactionModel> = {
				user_id: userId || "",
				type: parseInt(data.type) as TransactionType,
				category: data.category,
				amount: parseFloat(data.amount_eth),
				description: `${data.description || ""} | Crypto: ${receipt.hash} | From: ${account} | To: ${data.to_address} | ${parseFloat(data.amount_eth)} ETH (Ethereum)`,
				date: data.date,
			};

			const orm = TransactionORM.getInstance();
			return await orm.insertTransaction([transactionData as TransactionModel]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Crypto transaction completed successfully");
			resetCryptoForm();
			setIsCryptoDialogOpen(false);
		},
		onError: (error) => {
			toast.error(`Crypto transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
		},
	});

	const resetForm = () => {
		setFormData({
			type: "1",
			category: "",
			amount: "",
			description: "",
			date: new Date().toISOString().split("T")[0],
		});
		setEditingTransaction(null);
	};

	const resetCryptoForm = () => {
		setCryptoFormData({
			type: "2",
			category: "Crypto",
			to_address: "",
			amount_eth: "",
			description: "",
			date: new Date().toISOString().split("T")[0],
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!userId) {
			toast.error("User not authenticated");
			return;
		}

		const transactionData = {
			user_id: userId,
			type: parseInt(formData.type) as TransactionType,
			category: formData.category,
			amount: parseFloat(formData.amount),
			description: formData.description || null,
			date: formData.date,
		};

		if (editingTransaction) {
			updateMutation.mutate({
				...editingTransaction,
				...transactionData,
			});
		} else {
			createMutation.mutate(transactionData);
		}
	};

	const handleEdit = (transaction: TransactionModel) => {
		setEditingTransaction(transaction);
		setFormData({
			type: transaction.type.toString(),
			category: transaction.category,
			amount: transaction.amount.toString(),
			description: transaction.description || "",
			date: transaction.date,
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this transaction?")) {
			deleteMutation.mutate(id);
		}
	};

	const handleCryptoSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!userId) {
			toast.error("User not authenticated");
			return;
		}

		if (!isConnected) {
			toast.error("Please connect MetaMask first");
			return;
		}

		sendCryptoMutation.mutate(cryptoFormData);
	};

	const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			toast.error("Please upload an image file");
			return;
		}

		setIsProcessingReceipt(true);
		toast.info("Processing receipt...");

		try {
			// Simulate OCR processing with AI extraction
			// In production, this would call a real OCR API like Google Vision, Tesseract, or OpenAI Vision
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Mock extracted data - in production this would come from OCR
			const mockExtractedData = {
				amount: (Math.random() * 500 + 10).toFixed(2),
				category: ["Food", "Transportation", "Entertainment", "Utilities"][Math.floor(Math.random() * 4)],
				description: `Receipt from ${file.name.split('.')[0]}`,
				date: new Date().toISOString().split("T")[0],
			};

			// Auto-fill form with extracted data
			setFormData({
				type: "2", // Expense
				category: mockExtractedData.category,
				amount: mockExtractedData.amount,
				description: mockExtractedData.description,
				date: mockExtractedData.date,
			});

			setIsDialogOpen(true);
			toast.success("Receipt processed! Review and save the transaction.");
		} catch (error) {
			toast.error("Failed to process receipt. Please try again.");
		} finally {
			setIsProcessingReceipt(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const categories = [
		"Salary",
		"Freelance",
		"Rent",
		"Utilities",
		"Food",
		"Transportation",
		"Entertainment",
		"Healthcare",
		"Taxes",
		"Other",
	];

	return (
		<div className="space-y-4">
			<NetworkStatusCard />

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
					<div>
						<CardTitle>Transactions</CardTitle>
						<CardDescription>Track your income and expenses</CardDescription>
					</div>
					<div className="flex gap-2 flex-wrap">
						{/* MetaMask Connection */}
						{hasMetaMask && (
							<Button
								variant={isConnected ? "default" : "outline"}
								onClick={isConnected ? disconnect : connect}
								size="sm"
							>
								<Wallet className="h-4 w-4 mr-2" />
								{isConnected ? `${account?.slice(0, 6)}...${account?.slice(-4)}` : "Connect MetaMask"}
							</Button>
						)}

						{/* Crypto Payment Dialog */}
						{hasMetaMask && isConnected && (
							<Dialog open={isCryptoDialogOpen} onOpenChange={(open) => {
								setIsCryptoDialogOpen(open);
								if (!open) resetCryptoForm();
							}}>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm">
										<Wallet className="h-4 w-4 mr-2" />
										Send Crypto
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Send Cryptocurrency</DialogTitle>
										<DialogDescription>
											Send ETH via MetaMask and record the transaction
										</DialogDescription>
									</DialogHeader>
									<form onSubmit={handleCryptoSubmit}>
										<div className="grid gap-4 py-4">
											<div className="grid gap-2">
												<Label>Your Wallet</Label>
												<Input value={account || ""} disabled />
											</div>
											<div className="grid gap-2">
												<Label>Balance</Label>
												<Input value={`${balance || "0"} ETH`} disabled />
											</div>
											<div className="grid gap-2">
												<Label htmlFor="to_address">Recipient Address</Label>
												<Input
													id="to_address"
													placeholder="0x..."
													value={cryptoFormData.to_address}
													onChange={(e) => setCryptoFormData({ ...cryptoFormData, to_address: e.target.value })}
													required
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="amount_eth">Amount (ETH)</Label>
												<Input
													id="amount_eth"
													type="number"
													step="0.000001"
													placeholder="0.001"
													value={cryptoFormData.amount_eth}
													onChange={(e) => setCryptoFormData({ ...cryptoFormData, amount_eth: e.target.value })}
													required
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="crypto_date">Date</Label>
												<Input
													id="crypto_date"
													type="date"
													value={cryptoFormData.date}
													onChange={(e) => setCryptoFormData({ ...cryptoFormData, date: e.target.value })}
													required
												/>
											</div>
											<div className="grid gap-2">
												<Label htmlFor="crypto_description">Description (Optional)</Label>
												<Textarea
													id="crypto_description"
													placeholder="Payment for..."
													value={cryptoFormData.description}
													onChange={(e) => setCryptoFormData({ ...cryptoFormData, description: e.target.value })}
												/>
											</div>
										</div>
										<DialogFooter>
											<Button type="submit" disabled={sendCryptoMutation.isPending}>
												{sendCryptoMutation.isPending ? (
													<>
														<Loader2 className="h-4 w-4 mr-2 animate-spin" />
														Sending...
													</>
												) : (
													"Send & Record Transaction"
												)}
											</Button>
										</DialogFooter>
									</form>
								</DialogContent>
							</Dialog>
						)}

						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={handleReceiptUpload}
							disabled={isProcessingReceipt}
						/>
						<Button
							variant="outline"
							onClick={() => fileInputRef.current?.click()}
							disabled={isProcessingReceipt}
							size="sm"
						>
							{isProcessingReceipt ? (
								<>
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
									Processing...
								</>
							) : (
								<>
									<Camera className="h-4 w-4 mr-2" />
									Scan Receipt
								</>
							)}
						</Button>
						<Dialog open={isDialogOpen} onOpenChange={(open) => {
							setIsDialogOpen(open);
							if (!open) resetForm();
						}}>
							<DialogTrigger asChild>
								<Button size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Transaction
								</Button>
							</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
								<DialogDescription>
									{editingTransaction ? "Update" : "Enter"} transaction details below
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit}>
								<div className="grid gap-4 py-4">
									<div className="grid gap-2">
										<Label htmlFor="type">Type</Label>
										<Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">Income</SelectItem>
												<SelectItem value="2">Expense</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="category">Category</Label>
										<Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
											<SelectContent>
												{categories.map((cat) => (
													<SelectItem key={cat} value={cat}>
														{cat}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="amount">Amount</Label>
										<Input
											id="amount"
											type="number"
											step="0.01"
											placeholder="0.00"
											value={formData.amount}
											onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
											required
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="date">Date</Label>
										<Input
											id="date"
											type="date"
											value={formData.date}
											onChange={(e) => setFormData({ ...formData, date: e.target.value })}
											required
										/>
									</div>
									<div className="grid gap-2">
										<Label htmlFor="description">Description (Optional)</Label>
										<Textarea
											id="description"
											placeholder="Add notes..."
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
										{editingTransaction ? "Update" : "Add"} Transaction
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
						</Dialog>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="text-center py-8 text-slate-500">Loading transactions...</div>
				) : transactions.length === 0 ? (
					<div className="text-center py-8 text-slate-500">
						No transactions yet. Add your first transaction to get started!
					</div>
				) : (
					<div>
						{/* Table Header */}
						<div className="border rounded-lg overflow-hidden">
							<div className="bg-slate-50 dark:bg-slate-800 border-b">
								<div className="grid grid-cols-12 gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
									<div className="col-span-1">Date</div>
									<div className="col-span-1">Type</div>
									<div className="col-span-2">Category</div>
									<div className="col-span-2">Description</div>
									<div className="col-span-2">Crypto</div>
									<div className="col-span-2 text-right">Amount</div>
									<div className="col-span-2 text-right">Actions</div>
								</div>
							</div>

							{/* Virtualized List Container */}
							<div
								ref={parentRef}
								className="overflow-auto"
								style={{ height: '500px' }}
							>
								<div
									style={{
										height: `${rowVirtualizer.getTotalSize()}px`,
										width: '100%',
										position: 'relative',
									}}
								>
									{rowVirtualizer.getVirtualItems().map((virtualRow) => {
										const transaction = transactions[virtualRow.index];
										return (
											<div
												key={transaction.id}
												style={{
													position: 'absolute',
													top: 0,
													left: 0,
													width: '100%',
													height: `${virtualRow.size}px`,
													transform: `translateY(${virtualRow.start}px)`,
												}}
												className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
											>
												<div className="grid grid-cols-12 gap-2 px-4 py-4 items-center text-sm">
													<div className="col-span-1 text-xs">
														{new Date(transaction.date).toLocaleDateString()}
													</div>
													<div className="col-span-1">
														<Badge variant={transaction.type === TransactionType.Income ? "default" : "destructive"} className="text-xs">
															{transaction.type === TransactionType.Income ? (
																<ArrowUpCircle className="h-3 w-3 mr-1" />
															) : (
																<ArrowDownCircle className="h-3 w-3 mr-1" />
															)}
															{transaction.type === TransactionType.Income ? "Income" : "Expense"}
														</Badge>
													</div>
													<div className="col-span-2 text-xs">{transaction.category}</div>
													<div className="col-span-2 truncate text-xs">{transaction.description || "-"}</div>
													<div className="col-span-2 text-xs">
														{transaction.description?.includes("Crypto:") ? (
															<div className="space-y-1">
																<Badge variant="outline" className="text-xs">
																	<Wallet className="h-3 w-3 mr-1" />
																	Crypto
																</Badge>
																<div className="text-xs text-slate-500 truncate">
																	{transaction.description.split("|")[0].trim()}
																</div>
															</div>
														) : (
															<span className="text-slate-400 text-xs">-</span>
														)}
													</div>
													<div className={`col-span-2 text-right font-medium ${
														transaction.type === TransactionType.Income ? "text-emerald-600" : "text-rose-600"
													}`}>
														${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
													</div>
													<div className="col-span-2 text-right">
														<div className="flex justify-end gap-1">
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleEdit(transaction)}
															>
																<Pencil className="h-4 w-4" />
															</Button>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(transaction.id)}
																disabled={deleteMutation.isPending}
															>
																<Trash2 className="h-4 w-4 text-rose-600" />
															</Button>
														</div>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>

						{/* Transaction count indicator */}
						<div className="mt-4 text-sm text-slate-500 text-center">
							Showing {rowVirtualizer.getVirtualItems().length} of {transactions.length} transactions
						</div>
					</div>
				)}
			</CardContent>
		</Card>
		</div>
	);
}
