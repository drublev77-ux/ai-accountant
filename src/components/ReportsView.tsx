import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useChatCompletion } from "@/hooks/use-openai-gpt-chat";
import { TransactionORM, TransactionType } from "@/components/data/orm/orm_transaction";
import { FinancialReportORM, FinancialReportReportType, type FinancialReportModel } from "@/components/data/orm/orm_financial_report";
import { APP_CONFIG } from "@/main";
import { FileText, Download, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ReportsView() {
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const chat = useChatCompletion();

	const [reportType, setReportType] = useState<string>("1");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [generatingReport, setGeneratingReport] = useState(false);

	const { data: transactions } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results.filter((t) => t.user_id === userId);
		},
	});

	const { data: reports, isLoading: reportsLoading } = useQuery({
		queryKey: ["reports", userId],
		queryFn: async () => {
			const orm = FinancialReportORM.getInstance();
			const [results] = await orm.listFinancialReport();
			return results
				.filter((r) => r.user_id === userId)
				.sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime());
		},
	});

	const saveMutation = useMutation({
		mutationFn: async (data: Partial<FinancialReportModel>) => {
			const orm = FinancialReportORM.getInstance();
			return await orm.insertFinancialReport([data as FinancialReportModel]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reports"] });
			toast.success("Report generated successfully");
			setGeneratingReport(false);
		},
		onError: () => {
			toast.error("Failed to save report");
			setGeneratingReport(false);
		},
	});

	const handleGenerateReport = async () => {
		if (!userId || !transactions) {
			toast.error("Unable to generate report");
			return;
		}

		setGeneratingReport(true);

		const filteredTransactions = transactions.filter((t) => {
			if (!startDate && !endDate) return true;
			const tDate = new Date(t.date);
			const start = startDate ? new Date(startDate) : new Date(0);
			const end = endDate ? new Date(endDate) : new Date();
			return tDate >= start && tDate <= end;
		});

		const income = filteredTransactions
			.filter((t) => t.type === TransactionType.Income)
			.reduce((sum, t) => sum + t.amount, 0);

		const expenses = filteredTransactions
			.filter((t) => t.type === TransactionType.Expense)
			.reduce((sum, t) => sum + t.amount, 0);

		const categoryBreakdown: Record<string, number> = {};
		filteredTransactions.forEach((t) => {
			if (t.type === TransactionType.Expense) {
				categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
			}
		});

		const reportTypeMap: Record<string, string> = {
			"1": "Income Statement",
			"2": "Spending Analysis",
			"3": "Tax Summary",
			"4": "Net Worth",
		};

		const prompt = `Generate a detailed ${reportTypeMap[reportType]} financial report with the following data:

Period: ${startDate || "Beginning"} to ${endDate || "Present"}
Total Income: $${income.toLocaleString()}
Total Expenses: $${expenses.toLocaleString()}
Net: $${(income - expenses).toLocaleString()}

Expense Breakdown by Category:
${Object.entries(categoryBreakdown)
	.sort(([, a], [, b]) => b - a)
	.map(([cat, amt]) => `- ${cat}: $${amt.toLocaleString()}`)
	.join('\n')}

Number of Transactions: ${filteredTransactions.length}

Provide:
1. Executive summary
2. Key insights and trends
3. Recommendations for improvement
4. Areas of concern (if any)
5. Next steps

Format the report professionally with clear sections.`;

		try {
			const response = await chat.mutateAsync({
				messages: [
					{ role: "system", content: "You are a financial analyst creating professional financial reports." },
					{ role: "user", content: prompt }
				],
			});

			const reportData = {
				summary: {
					income,
					expenses,
					net: income - expenses,
					transactionCount: filteredTransactions.length,
					categoryBreakdown,
				},
				aiAnalysis: response.message,
			};

			await saveMutation.mutateAsync({
				user_id: userId,
				report_type: parseInt(reportType) as FinancialReportReportType,
				report_data: JSON.stringify(reportData),
				start_date: startDate || new Date(0).toISOString().split("T")[0],
				end_date: endDate || new Date().toISOString().split("T")[0],
				generated_at: new Date().toISOString(),
			});
		} catch (error) {
			toast.error("Failed to generate report");
			setGeneratingReport(false);
		}
	};

	const handleDownloadReport = (report: FinancialReportModel) => {
		const data = JSON.parse(report.report_data);
		const reportTypeNames: Record<number, string> = {
			1: "Income Statement",
			2: "Spending Analysis",
			3: "Tax Summary",
			4: "Net Worth",
		};

		const content = `
${reportTypeNames[report.report_type] || "Financial Report"}
Generated: ${new Date(report.generated_at).toLocaleString()}
Period: ${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}

===========================================

SUMMARY:
- Total Income: $${data.summary.income.toLocaleString()}
- Total Expenses: $${data.summary.expenses.toLocaleString()}
- Net Amount: $${data.summary.net.toLocaleString()}
- Number of Transactions: ${data.summary.transactionCount}

AI ANALYSIS:
${data.aiAnalysis}
`;

		const blob = new Blob([content], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `financial-report-${new Date(report.generated_at).toISOString().split("T")[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast.success("Report downloaded");
	};

	const reportTypeNames: Record<number, string> = {
		1: "Income Statement",
		2: "Spending Analysis",
		3: "Tax Summary",
		4: "Net Worth",
	};

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Generate Report</CardTitle>
					<CardDescription>Create AI-powered financial reports</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="reportType">Report Type</Label>
						<Select value={reportType} onValueChange={setReportType}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Income Statement</SelectItem>
								<SelectItem value="2">Spending Analysis</SelectItem>
								<SelectItem value="3">Tax Summary</SelectItem>
								<SelectItem value="4">Net Worth</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="startDate">Start Date (Optional)</Label>
						<Input
							id="startDate"
							type="date"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="endDate">End Date (Optional)</Label>
						<Input
							id="endDate"
							type="date"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
						/>
					</div>

					<Button
						onClick={handleGenerateReport}
						disabled={generatingReport || !transactions || transactions.length === 0}
						className="w-full"
					>
						{generatingReport ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Generating Report...
							</>
						) : (
							<>
								<Sparkles className="h-4 w-4 mr-2" />
								Generate Report
							</>
						)}
					</Button>

					{transactions && transactions.length === 0 && (
						<p className="text-sm text-slate-600 text-center">
							Add transactions first to generate reports
						</p>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Generated Reports</CardTitle>
					<CardDescription>View and download your financial reports</CardDescription>
				</CardHeader>
				<CardContent>
					{reportsLoading ? (
						<div className="text-center py-8 text-slate-500">Loading reports...</div>
					) : !reports || reports.length === 0 ? (
						<div className="text-center py-8 text-slate-500">
							No reports yet. Generate your first report!
						</div>
					) : (
						<div className="space-y-3">
							{reports.map((report) => {
								const data = JSON.parse(report.report_data);
								return (
									<Card key={report.id}>
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="space-y-1">
													<CardTitle className="text-base">
														{reportTypeNames[report.report_type]}
													</CardTitle>
													<CardDescription className="text-xs">
														{new Date(report.start_date).toLocaleDateString()} -{" "}
														{new Date(report.end_date).toLocaleDateString()}
													</CardDescription>
												</div>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleDownloadReport(report)}
												>
													<Download className="h-4 w-4" />
												</Button>
											</div>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex gap-2 text-xs">
												<Badge variant="outline">
													Income: ${data.summary.income.toLocaleString()}
												</Badge>
												<Badge variant="outline">
													Expenses: ${data.summary.expenses.toLocaleString()}
												</Badge>
											</div>
											<p className="text-xs text-slate-600 mt-2">
												Generated: {new Date(report.generated_at).toLocaleString()}
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
