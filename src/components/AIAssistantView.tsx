import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChatCompletion, useConversation } from "@/hooks/use-openai-gpt-chat";
import { TransactionORM } from "@/components/data/orm/orm_transaction";
import { InvoiceORM } from "@/components/data/orm/orm_invoice";
import { TaxProfileORM } from "@/components/data/orm/orm_tax_profile";
import { APP_CONFIG } from "@/main";
import { Send, Loader2, Sparkles, TrendingUp, AlertCircle, FileText, Calculator, DollarSign, PieChart, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function AIAssistantView() {
	const userId = APP_CONFIG.userId;
	const [inputMessage, setInputMessage] = useState("");
	const [analysisMode, setAnalysisMode] = useState<string>("general");
	const scrollRef = useRef<HTMLDivElement>(null);

	const conversation = useConversation(
		"You are an expert personal accountant and financial advisor. Help users with financial questions, tax advice, expense tracking, budgeting, and financial planning. Provide clear, actionable advice. When discussing numbers, be specific and practical."
	);

	const chat = useChatCompletion();

	const { data: transactions } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results.filter((t) => t.user_id === userId);
		},
	});

	const { data: invoices } = useQuery({
		queryKey: ["invoices", userId],
		queryFn: async () => {
			const orm = InvoiceORM.getInstance();
			const [results] = await orm.listInvoice();
			return results.filter((i) => i.user_id === userId);
		},
	});

	const { data: taxProfile } = useQuery({
		queryKey: ["taxProfile", userId],
		queryFn: async () => {
			if (!userId) return null;
			const orm = TaxProfileORM.getInstance();
			const [results] = await orm.listTaxProfile();
			return results.filter(p => p.user_id === userId)[0] || null;
		},
		enabled: !!userId,
	});

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [conversation.messages]);

	const handleSend = async () => {
		if (!inputMessage.trim() || chat.isPending) return;

		const userMessage = inputMessage.trim();
		setInputMessage("");

		conversation.addMessage({ role: "user", content: userMessage });

		try {
			let contextMessage = userMessage;
			let contextData = "";

			// Build comprehensive context based on analysis mode and keywords
			if (analysisMode === "spending" || userMessage.toLowerCase().includes("spending") || userMessage.toLowerCase().includes("expense")) {
				if (transactions && transactions.length > 0) {
					const expenses = transactions.filter(t => t.type === 2);
					const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
					const categoryBreakdown = expenses.reduce((acc: Record<string, number>, t) => {
						acc[t.category] = (acc[t.category] || 0) + t.amount;
						return acc;
					}, {});

					contextData += `\n\nExpense Summary:\nTotal Expenses: $${totalExpenses.toFixed(2)}\nCategory Breakdown: ${JSON.stringify(categoryBreakdown, null, 2)}\n`;
					contextData += `Recent Expenses (last 10):\n${expenses.slice(-10).map(t =>
						`${t.date}: ${t.category} - $${t.amount}${t.description ? ' (' + t.description + ')' : ''}`
					).join('\n')}`;
				}
			}

			if (analysisMode === "income" || userMessage.toLowerCase().includes("income") || userMessage.toLowerCase().includes("revenue")) {
				if (transactions && transactions.length > 0) {
					const income = transactions.filter(t => t.type === 1);
					const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);

					contextData += `\n\nIncome Summary:\nTotal Income: $${totalIncome.toFixed(2)}\n`;
					contextData += `Recent Income (last 10):\n${income.slice(-10).map(t =>
						`${t.date}: ${t.category} - $${t.amount}${t.description ? ' (' + t.description + ')' : ''}`
					).join('\n')}`;
				}
			}

			if (analysisMode === "tax" || userMessage.toLowerCase().includes("tax")) {
				if (taxProfile) {
					const deductions = taxProfile.deductions ? JSON.parse(taxProfile.deductions) : {};
					contextData += `\n\nTax Profile:\nJurisdiction: ${taxProfile.jurisdiction}\nFiling Status: ${taxProfile.filing_status}\nDeductions: ${JSON.stringify(deductions, null, 2)}\n`;
				}
			}

			if (analysisMode === "invoices" || userMessage.toLowerCase().includes("invoice")) {
				if (invoices && invoices.length > 0) {
					const pending = invoices.filter(i => i.status === 1);
					const paid = invoices.filter(i => i.status === 2);
					contextData += `\n\nInvoice Summary:\nPending: ${pending.length} (Total: $${pending.reduce((sum, i) => sum + i.total_amount, 0).toFixed(2)})\nPaid: ${paid.length} (Total: $${paid.reduce((sum, i) => sum + i.total_amount, 0).toFixed(2)})\n`;
				}
			}

			if (contextData) {
				contextMessage = `${contextData}\n\nUser question: ${userMessage}`;
			}

			const response = await chat.mutateAsync({
				messages: [
					...conversation.messages,
					{ role: "user", content: contextMessage }
				],
			});

			conversation.addMessage({ role: "assistant", content: response.message });
		} catch (error) {
			toast.error("Failed to get response from AI assistant");
			conversation.messages.pop();
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const quickQuestions = [
		"How can I reduce my taxes?",
		"What's a good budget strategy?",
		"Analyze my spending patterns",
		"Tips for saving money",
		"Forecast my cash flow for next month",
		"What are my biggest expenses?",
		"Should I invest my savings?",
		"Help me create a retirement plan",
	];

	const analysisModes = [
		{ value: "general", label: "General", icon: Sparkles },
		{ value: "spending", label: "Spending", icon: TrendingUp },
		{ value: "income", label: "Income", icon: DollarSign },
		{ value: "tax", label: "Tax", icon: Calculator },
		{ value: "invoices", label: "Invoices", icon: FileText },
		{ value: "forecast", label: "Forecast", icon: BarChart3 },
	];

	return (
		<Card className="h-[calc(100vh-16rem)]">
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-emerald-600" />
						<div>
							<CardTitle>AI Financial Assistant</CardTitle>
							<CardDescription>Ask me anything about your finances, taxes, or budgeting</CardDescription>
						</div>
					</div>
					<Select value={analysisMode} onValueChange={setAnalysisMode}>
						<SelectTrigger className="w-[180px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{analysisModes.map((mode) => {
								const Icon = mode.icon;
								return (
									<SelectItem key={mode.value} value={mode.value}>
										<div className="flex items-center gap-2">
											<Icon className="h-4 w-4" />
											<span>{mode.label}</span>
										</div>
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col h-[calc(100%-7rem)]">
				<ScrollArea className="flex-1 pr-4" ref={scrollRef}>
					{conversation.messages.length === 1 ? (
						<div className="space-y-4">
							<div className="text-center py-8">
								<Sparkles className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
								<h3 className="text-lg font-semibold mb-2">Welcome to Your AI Accountant</h3>
								<p className="text-slate-600 mb-6">Ask me anything about your finances. Here are some suggestions:</p>
							</div>
							<div className="grid gap-2 sm:grid-cols-2">
								{quickQuestions.map((question, idx) => (
									<Button
										key={idx}
										variant="outline"
										className="h-auto py-3 px-4 text-left whitespace-normal"
										onClick={() => {
											setInputMessage(question);
										}}
									>
										{question}
									</Button>
								))}
							</div>
						</div>
					) : (
						<div className="space-y-4 pb-4">
							{conversation.messages.slice(1).map((message, idx) => (
								<div
									key={idx}
									className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
								>
									{message.role === "assistant" && (
										<Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600">
											<AvatarFallback className="text-white text-xs">AI</AvatarFallback>
										</Avatar>
									)}
									<div
										className={`rounded-lg px-4 py-2 max-w-[80%] ${
											message.role === "user"
												? "bg-emerald-600 text-white"
												: "bg-slate-100 text-slate-900"
										}`}
									>
										<p className="text-sm whitespace-pre-wrap">{message.content}</p>
									</div>
									{message.role === "user" && (
										<Avatar className="h-8 w-8 bg-slate-700">
											<AvatarFallback className="text-white text-xs">ME</AvatarFallback>
										</Avatar>
									)}
								</div>
							))}
							{chat.isPending && (
								<div className="flex gap-3 justify-start">
									<Avatar className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-teal-600">
										<AvatarFallback className="text-white text-xs">AI</AvatarFallback>
									</Avatar>
									<div className="rounded-lg px-4 py-2 bg-slate-100">
										<Loader2 className="h-4 w-4 animate-spin" />
									</div>
								</div>
							)}
						</div>
					)}
				</ScrollArea>

				<div className="flex gap-2 mt-4 pt-4 border-t">
					<Textarea
						placeholder="Ask about your finances, taxes, budgeting..."
						value={inputMessage}
						onChange={(e) => setInputMessage(e.target.value)}
						onKeyPress={handleKeyPress}
						className="min-h-[60px] resize-none"
						disabled={chat.isPending}
					/>
					<Button
						onClick={handleSend}
						disabled={!inputMessage.trim() || chat.isPending}
						size="icon"
						className="h-[60px] w-[60px]"
					>
						{chat.isPending ? (
							<Loader2 className="h-5 w-5 animate-spin" />
						) : (
							<Send className="h-5 w-5" />
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
