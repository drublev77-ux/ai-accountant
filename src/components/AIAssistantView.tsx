import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatCompletion, useConversation } from "@/hooks/use-openai-gpt-chat";
import { TransactionORM } from "@/components/data/orm/orm_transaction";
import { APP_CONFIG } from "@/main";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function AIAssistantView() {
	const userId = APP_CONFIG.userId;
	const [inputMessage, setInputMessage] = useState("");
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

			if (userMessage.toLowerCase().includes("transaction") ||
			    userMessage.toLowerCase().includes("spending") ||
			    userMessage.toLowerCase().includes("income") ||
			    userMessage.toLowerCase().includes("expense")) {
				if (transactions && transactions.length > 0) {
					const transactionSummary = transactions.slice(0, 20).map(t =>
						`${t.date}: ${t.type === 1 ? 'Income' : 'Expense'} - ${t.category} - $${t.amount}${t.description ? ' (' + t.description + ')' : ''}`
					).join('\n');

					contextMessage = `User's recent transactions:\n${transactionSummary}\n\nUser question: ${userMessage}`;
				}
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
	];

	return (
		<Card className="h-[calc(100vh-16rem)]">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-emerald-600" />
					<div>
						<CardTitle>AI Financial Assistant</CardTitle>
						<CardDescription>Ask me anything about your finances, taxes, or budgeting</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col h-[calc(100%-5rem)]">
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
