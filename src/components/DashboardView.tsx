import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionORM, TransactionType } from "@/components/data/orm/orm_transaction";
import { FinancialReminderORM } from "@/components/data/orm/orm_financial_reminder";
import { TaxProfileORM } from "@/components/data/orm/orm_tax_profile";
import { APP_CONFIG } from "@/main";
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, AlertCircle, DollarSign, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function DashboardView() {
	const { t } = useTranslation();
	const userId = APP_CONFIG.userId;

	const { data: transactions, isLoading: transactionsLoading } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results.filter((t) => t.user_id === userId);
		},
	});

	const { data: reminders, isLoading: remindersLoading } = useQuery({
		queryKey: ["reminders", userId],
		queryFn: async () => {
			const orm = FinancialReminderORM.getInstance();
			const [results] = await orm.listFinancialReminder();
			const userReminders = results.filter((r) => r.user_id === userId);
			return userReminders.filter((r) => !r.is_completed);
		},
	});

	const { data: taxProfile } = useQuery({
		queryKey: ["taxProfile", userId],
		queryFn: async () => {
			if (!userId) return null;
			const orm = TaxProfileORM.getInstance();
			const results = await orm.getTaxProfileByUserId(userId);
			return results[0] || null;
		},
		enabled: !!userId,
	});

	const totalIncome = transactions
		?.filter((t) => t.type === TransactionType.Income)
		.reduce((sum, t) => sum + t.amount, 0) || 0;

	const totalExpenses = transactions
		?.filter((t) => t.type === TransactionType.Expense)
		.reduce((sum, t) => sum + t.amount, 0) || 0;

	const netAmount = totalIncome - totalExpenses;

	const upcomingReminders = reminders?.slice(0, 5) || [];

	// Mock Accounts Payable/Receivable data
	const accountsPayable = [
		{ id: "1", vendor: "Office Supplies Co.", amount: 450.00, dueDate: "2025-12-15", status: "pending" },
		{ id: "2", vendor: "Cloud Hosting", amount: 99.00, dueDate: "2025-12-20", status: "pending" },
	];

	const accountsReceivable = [
		{ id: "1", client: "Acme Corp", amount: 3600.00, invoiceNumber: "INV-001", dueDate: "2025-12-31", status: "sent" },
		{ id: "2", client: "TechStart Inc", amount: 2400.00, invoiceNumber: "INV-002", dueDate: "2026-01-05", status: "draft" },
	];

	const totalPayable = accountsPayable.reduce((sum, item) => sum + item.amount, 0);
	const totalReceivable = accountsReceivable.reduce((sum, item) => sum + item.amount, 0);

	if (transactionsLoading || remindersLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<Skeleton className="h-4 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-8 w-32" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("dashboard.income")}</CardTitle>
						<ArrowUpCircle className="h-4 w-4 text-emerald-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-600">
							${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</div>
						<p className="text-xs text-slate-600 mt-1">{t("dashboard.thisMonth")}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("dashboard.expenses")}</CardTitle>
						<ArrowDownCircle className="h-4 w-4 text-rose-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-rose-600">
							${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</div>
						<p className="text-xs text-slate-600 mt-1">{t("dashboard.thisMonth")}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("dashboard.totalBalance")}</CardTitle>
						<TrendingUp className={`h-4 w-4 ${netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
							${netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
						</div>
						<p className="text-xs text-slate-600 mt-1">{t("dashboard.thisMonth")}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t("transactions.title")}</CardTitle>
						<AlertCircle className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{transactions?.length || 0}</div>
						<p className="text-xs text-slate-600 mt-1">{t("dashboard.thisMonth")}</p>
					</CardContent>
				</Card>
			</div>

			{upcomingReminders.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Upcoming Reminders</CardTitle>
						<CardDescription>Tasks that need your attention</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							{upcomingReminders.map((reminder) => (
								<Alert key={reminder.id}>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>{reminder.title}</AlertTitle>
									<AlertDescription>
										{reminder.description && <span>{reminder.description} • </span>}
										Due: {new Date(reminder.due_date).toLocaleDateString()}
									</AlertDescription>
								</Alert>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{!taxProfile && (
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Tax Profile Not Set</AlertTitle>
					<AlertDescription>
						Set up your tax profile in the Tax Calculator tab to get personalized tax estimates and recommendations.
					</AlertDescription>
				</Alert>
			)}

			{/* Accounts Payable & Receivable */}
			<div className="grid gap-4 md:grid-cols-2">
				{/* Accounts Payable */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg flex items-center gap-2">
								<Clock className="h-5 w-5 text-rose-600" />
								Accounts Payable
							</CardTitle>
							<Badge variant="destructive" className="text-sm">
								${totalPayable.toFixed(2)}
							</Badge>
						</div>
						<CardDescription>Bills you need to pay</CardDescription>
					</CardHeader>
					<CardContent>
						{accountsPayable.length === 0 ? (
							<p className="text-sm text-slate-500 text-center py-4">No pending bills</p>
						) : (
							<div className="space-y-3">
								{accountsPayable.map((item) => (
									<div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<p className="font-medium text-sm">{item.vendor}</p>
											<p className="text-xs text-slate-500">
												Due: {new Date(item.dueDate).toLocaleDateString()}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-rose-600">${item.amount.toFixed(2)}</p>
											<Badge variant="outline" className="text-xs">
												{item.status}
											</Badge>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Accounts Receivable */}
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg flex items-center gap-2">
								<DollarSign className="h-5 w-5 text-emerald-600" />
								Accounts Receivable
							</CardTitle>
							<Badge variant="default" className="text-sm bg-emerald-600">
								${totalReceivable.toFixed(2)}
							</Badge>
						</div>
						<CardDescription>Money owed to you</CardDescription>
					</CardHeader>
					<CardContent>
						{accountsReceivable.length === 0 ? (
							<p className="text-sm text-slate-500 text-center py-4">No outstanding invoices</p>
						) : (
							<div className="space-y-3">
								{accountsReceivable.map((item) => (
									<div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
										<div>
											<p className="font-medium text-sm">{item.client}</p>
											<p className="text-xs text-slate-500">
												{item.invoiceNumber} • Due: {new Date(item.dueDate).toLocaleDateString()}
											</p>
										</div>
										<div className="text-right">
											<p className="font-bold text-emerald-600">${item.amount.toFixed(2)}</p>
											<Badge variant="outline" className="text-xs">
												{item.status}
											</Badge>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
