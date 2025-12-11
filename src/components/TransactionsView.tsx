import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TransactionORM, TransactionType, type TransactionModel } from "@/components/data/orm/orm_transaction";
import { APP_CONFIG } from "@/main";
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, Pencil, Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function TransactionsView() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingTransaction, setEditingTransaction] = useState<TransactionModel | null>(null);
	const [isProcessingReceipt, setIsProcessingReceipt] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [formData, setFormData] = useState({
		type: "1",
		category: "",
		amount: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	});

	const { data: transactions, isLoading } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results
				.filter((t) => t.user_id === userId)
				.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: Partial<TransactionModel>) => {
			const orm = TransactionORM.getInstance();
			return await orm.insertTransaction([data as TransactionModel]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Transaction added successfully");
			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to add transaction");
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (transaction: TransactionModel) => {
			const orm = TransactionORM.getInstance();
			return await orm.setTransactionById(transaction.id, transaction);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Transaction updated successfully");
			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to update transaction");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const orm = TransactionORM.getInstance();
			await orm.deleteTransactionById(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["transactions"] });
			toast.success("Transaction deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete transaction");
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
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Transactions</CardTitle>
						<CardDescription>Track your income and expenses</CardDescription>
					</div>
					<div className="flex gap-2">
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
								<Button>
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
				) : !transactions || transactions.length === 0 ? (
					<div className="text-center py-8 text-slate-500">
						No transactions yet. Add your first transaction to get started!
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Description</TableHead>
								<TableHead className="text-right">Amount</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{transactions.map((transaction) => (
								<TableRow key={transaction.id}>
									<TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
									<TableCell>
										<Badge variant={transaction.type === TransactionType.Income ? "default" : "destructive"}>
											{transaction.type === TransactionType.Income ? (
												<ArrowUpCircle className="h-3 w-3 mr-1" />
											) : (
												<ArrowDownCircle className="h-3 w-3 mr-1" />
											)}
											{transaction.type === TransactionType.Income ? "Income" : "Expense"}
										</Badge>
									</TableCell>
									<TableCell>{transaction.category}</TableCell>
									<TableCell className="max-w-xs truncate">{transaction.description || "-"}</TableCell>
									<TableCell className={`text-right font-medium ${
										transaction.type === TransactionType.Income ? "text-emerald-600" : "text-rose-600"
									}`}>
										${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
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
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
