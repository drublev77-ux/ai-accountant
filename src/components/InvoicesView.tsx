import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { APP_CONFIG } from "@/main";
import { Plus, Download, Eye, Send, Trash2, FileText, Globe, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { TAX_REGULATIONS, getCountryList } from "@/lib/tax-regulations";
import { getCurrencyList, getCurrencyByCode } from "@/lib/currencies";

interface InvoiceItem {
	description: string;
	quantity: number;
	unitPrice: number;
	total: number;
}

interface Invoice {
	id: string;
	invoiceNumber: string;
	clientName: string;
	clientEmail: string;
	date: string;
	dueDate: string;
	items: InvoiceItem[];
	subtotal: number;
	taxRate: number;
	taxAmount: number;
	total: number;
	status: "draft" | "sent" | "paid" | "overdue";
	notes?: string;
	currency?: string;
}

export function InvoicesView() {
	const { t } = useTranslation();
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

	const [formData, setFormData] = useState({
		clientName: "",
		clientEmail: "",
		date: new Date().toISOString().split("T")[0],
		dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
		taxRate: "20",
		country: "US",
		currency: "USD",
		notes: "",
	});

	const [items, setItems] = useState<InvoiceItem[]>([
		{ description: "", quantity: 1, unitPrice: 0, total: 0 }
	]);

	// Mock data - in production this would use an ORM
	const mockInvoices: Invoice[] = [
		{
			id: "1",
			invoiceNumber: "INV-001",
			clientName: "Acme Corp",
			clientEmail: "billing@acme.com",
			date: "2025-12-01",
			dueDate: "2025-12-31",
			items: [
				{ description: "Web Development Services", quantity: 40, unitPrice: 75, total: 3000 }
			],
			subtotal: 3000,
			taxRate: 20,
			taxAmount: 600,
			total: 3600,
			status: "sent",
		},
		{
			id: "2",
			invoiceNumber: "INV-002",
			clientName: "TechStart Inc",
			clientEmail: "finance@techstart.com",
			date: "2025-12-05",
			dueDate: "2026-01-05",
			items: [
				{ description: "Consulting Services", quantity: 20, unitPrice: 100, total: 2000 }
			],
			subtotal: 2000,
			taxRate: 20,
			taxAmount: 400,
			total: 2400,
			status: "draft",
		},
	];

	const { data: invoices } = useQuery({
		queryKey: ["invoices", userId],
		queryFn: async () => {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 500));
			return mockInvoices;
		},
	});

	const addItem = () => {
		setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
	};

	const removeItem = (index: number) => {
		if (items.length > 1) {
			setItems(items.filter((_, i) => i !== index));
		}
	};

	const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
		const newItems = [...items];
		newItems[index] = { ...newItems[index], [field]: value };

		// Calculate total for this item
		if (field === 'quantity' || field === 'unitPrice') {
			newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
		}

		setItems(newItems);
	};

	const calculateInvoice = () => {
		const subtotal = items.reduce((sum, item) => sum + item.total, 0);
		const taxRate = parseFloat(formData.taxRate) / 100;
		const taxAmount = subtotal * taxRate;
		const total = subtotal + taxAmount;

		return { subtotal, taxAmount, total };
	};

	const handleGenerateInvoice = () => {
		const startTime = Date.now();
		toast.info("Generating invoice...");

		setTimeout(() => {
			const { subtotal, taxAmount, total } = calculateInvoice();
			const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);

			toast.success(`Invoice generated in ${elapsedTime} seconds!`);

			// Here you would save to database and/or generate PDF
			console.log({
				clientName: formData.clientName,
				clientEmail: formData.clientEmail,
				items,
				subtotal,
				taxAmount,
				total,
			});

			setIsDialogOpen(false);
			resetForm();
		}, 800);
	};

	const resetForm = () => {
		setFormData({
			clientName: "",
			clientEmail: "",
			date: new Date().toISOString().split("T")[0],
			dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			taxRate: "20",
			country: "US",
			currency: "USD",
			notes: "",
		});
		setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
		setEditingInvoice(null);
	};

	const handleDownloadPDF = (invoice: Invoice) => {
		toast.success(`Downloading invoice ${invoice.invoiceNumber}...`);
		// In production, this would generate and download a PDF
	};

	const handleSendEmail = (invoice: Invoice) => {
		toast.success(`Sending invoice ${invoice.invoiceNumber} to ${invoice.clientEmail}...`);
		// In production, this would send an email
	};

	const { subtotal, taxAmount, total } = calculateInvoice();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Invoices
							</CardTitle>
							<CardDescription>Generate professional invoices in seconds</CardDescription>
						</div>
						<Dialog open={isDialogOpen} onOpenChange={(open) => {
							setIsDialogOpen(open);
							if (!open) resetForm();
						}}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Create Invoice
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>Create New Invoice</DialogTitle>
									<DialogDescription>
										Generate a professional invoice with automatic tax calculations
									</DialogDescription>
								</DialogHeader>
								<div className="grid gap-4 py-4">
									{/* Client Information */}
									<div className="grid gap-4 md:grid-cols-2">
										<div className="grid gap-2">
											<Label htmlFor="clientName">Client Name</Label>
											<Input
												id="clientName"
												value={formData.clientName}
												onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
												placeholder="Acme Corp"
												required
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="clientEmail">Client Email</Label>
											<Input
												id="clientEmail"
												type="email"
												value={formData.clientEmail}
												onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
												placeholder="billing@acme.com"
												required
											/>
										</div>
									</div>

									{/* Country, Currency & Tax */}
									<div className="grid gap-4 md:grid-cols-3">
										<div className="grid gap-2">
											<Label htmlFor="country">
												<Globe className="h-3 w-3 inline mr-1" />
												Country (Tax)
											</Label>
											<Select
												value={formData.country}
												onValueChange={(value) => {
													const regulation = TAX_REGULATIONS[value];
													const vatRate = regulation?.vat.standardRate || 0;
													setFormData({
														...formData,
														country: value,
														currency: regulation?.currency || formData.currency,
														taxRate: vatRate.toString()
													});
												}}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{getCountryList().map((country) => (
														<SelectItem key={country.code} value={country.code}>
															{country.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="currency">
												<DollarSign className="h-3 w-3 inline mr-1" />
												Currency
											</Label>
											<Select
												value={formData.currency}
												onValueChange={(value) => setFormData({ ...formData, currency: value })}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{getCurrencyList().slice(0, 50).map((curr) => (
														<SelectItem key={curr.code} value={curr.code}>
															{curr.flag} {curr.code} - {curr.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="taxRate">VAT/Tax (%)</Label>
											<Input
												id="taxRate"
												type="number"
												step="0.1"
												value={formData.taxRate}
												onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
												required
											/>
										</div>
									</div>

									{/* Dates */}
									<div className="grid gap-4 md:grid-cols-2">
										<div className="grid gap-2">
											<Label htmlFor="date">Invoice Date</Label>
											<Input
												id="date"
												type="date"
												value={formData.date}
												onChange={(e) => setFormData({ ...formData, date: e.target.value })}
												required
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="dueDate">Due Date</Label>
											<Input
												id="dueDate"
												type="date"
												value={formData.dueDate}
												onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
												required
											/>
										</div>
									</div>

									{/* Line Items */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label>Line Items</Label>
											<Button type="button" variant="outline" size="sm" onClick={addItem}>
												<Plus className="h-3 w-3 mr-1" />
												Add Item
											</Button>
										</div>
										{items.map((item, index) => (
											<div key={index} className="grid gap-2 md:grid-cols-[2fr,1fr,1fr,1fr,auto] items-end p-3 border rounded-lg">
												<div className="grid gap-1">
													<Label className="text-xs">Description</Label>
													<Input
														placeholder="Service or product"
														value={item.description}
														onChange={(e) => updateItem(index, 'description', e.target.value)}
														required
													/>
												</div>
												<div className="grid gap-1">
													<Label className="text-xs">Qty</Label>
													<Input
														type="number"
														min="1"
														value={item.quantity}
														onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
														required
													/>
												</div>
												<div className="grid gap-1">
													<Label className="text-xs">Price</Label>
													<Input
														type="number"
														step="0.01"
														min="0"
														value={item.unitPrice}
														onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
														required
													/>
												</div>
												<div className="grid gap-1">
													<Label className="text-xs">Total</Label>
													<Input
														value={item.total.toFixed(2)}
														disabled
														className="bg-slate-50"
													/>
												</div>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeItem(index)}
													disabled={items.length === 1}
												>
													<Trash2 className="h-4 w-4 text-rose-600" />
												</Button>
											</div>
										))}
									</div>

									{/* Summary */}
									<div className="bg-slate-50 p-4 rounded-lg space-y-2">
										<div className="flex justify-between text-sm">
											<span className="text-slate-600">Subtotal:</span>
											<span className="font-medium">{getCurrencyByCode(formData.currency)?.symbol || '$'}{subtotal.toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-sm">
											<span className="text-slate-600">Tax ({formData.taxRate}%):</span>
											<span className="font-medium">{getCurrencyByCode(formData.currency)?.symbol || '$'}{taxAmount.toFixed(2)}</span>
										</div>
										<div className="flex justify-between text-lg font-bold border-t pt-2">
											<span>Total:</span>
											<span className="text-emerald-600">{getCurrencyByCode(formData.currency)?.symbol || '$'}{total.toFixed(2)} {formData.currency}</span>
										</div>
									</div>

									{/* Notes */}
									<div className="grid gap-2">
										<Label htmlFor="notes">Notes (Optional)</Label>
										<Textarea
											id="notes"
											placeholder="Payment terms, thank you message, etc."
											value={formData.notes}
											onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
											rows={3}
										/>
									</div>
								</div>
								<DialogFooter>
									<Button type="button" onClick={handleGenerateInvoice}>
										Generate Invoice
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					{!invoices || invoices.length === 0 ? (
						<div className="text-center py-12 text-slate-500">
							<FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
							<p>No invoices yet. Create your first invoice to get started!</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Invoice #</TableHead>
									<TableHead>Client</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Due Date</TableHead>
									<TableHead className="text-right">Amount</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{invoices.map((invoice) => (
									<TableRow key={invoice.id}>
										<TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
										<TableCell>
											<div>
												<div className="font-medium">{invoice.clientName}</div>
												<div className="text-xs text-slate-500">{invoice.clientEmail}</div>
											</div>
										</TableCell>
										<TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
										<TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
										<TableCell className="text-right font-medium text-emerald-600">
											${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										</TableCell>
										<TableCell>
											<Badge variant={
												invoice.status === 'paid' ? 'default' :
												invoice.status === 'sent' ? 'secondary' :
												invoice.status === 'overdue' ? 'destructive' : 'outline'
											}>
												{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
											</Badge>
										</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDownloadPDF(invoice)}
													title="Download PDF"
												>
													<Download className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleSendEmail(invoice)}
													title="Send Email"
												>
													<Send className="h-4 w-4" />
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
		</div>
	);
}
