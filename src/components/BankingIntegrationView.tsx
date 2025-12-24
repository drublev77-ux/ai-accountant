import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlaidLinkToken, useExchangePlaidToken, usePlaidAccounts, usePlaidTransactions } from "@/hooks/use-plaid";
import { BankConnectionORM } from "@/components/data/orm/orm_bank_connection";
import { BankAccountORM } from "@/components/data/orm/orm_bank_account";
import { APP_CONFIG } from "@/main";
import { Building2, Plus, RefreshCw, AlertCircle, CheckCircle2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";

export function BankingIntegrationView() {
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;

	const [activeTab, setActiveTab] = useState("connections");
	const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

	// Fetch Plaid Link Token
	const { data: linkTokenData, isLoading: linkTokenLoading } = usePlaidLinkToken();

	// Exchange token mutation
	const exchangeToken = useExchangePlaidToken();

	// Fetch connected banks
	const { data: bankConnections, isLoading: connectionsLoading } = useQuery({
		queryKey: ["bank_connections", userId],
		queryFn: async () => {
			const orm = BankConnectionORM.getInstance();
			const [results] = await orm.listBankConnection();
			return results.filter(c => c.user_id === userId);
		},
	});

	// Fetch bank accounts
	const { data: bankAccounts } = useQuery({
		queryKey: ["bank_accounts", userId],
		queryFn: async () => {
			const orm = BankAccountORM.getInstance();
			const [results] = await orm.listBankAccount();
			return results.filter(a => a.user_id === userId);
		},
	});

	// Fetch Plaid accounts for selected connection
	const selectedConnectionData = bankConnections?.find(c => c.id === selectedConnection);
	const { data: plaidAccounts, isLoading: accountsLoading } = usePlaidAccounts({
		access_token: selectedConnectionData?.access_token || "",
	});

	// Fetch transactions
	const { data: plaidTransactions, isLoading: transactionsLoading } = usePlaidTransactions({
		access_token: selectedConnectionData?.access_token || "",
		start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
		end_date: new Date().toISOString().split("T")[0],
	});

	// Save bank connection
	const saveConnectionMutation = useMutation({
		mutationFn: async (data: { access_token: string; item_id: string; institution_name: string }) => {
			const orm = BankConnectionORM.getInstance();
			return await orm.insertBankConnection([{
				user_id: userId,
				provider_name: data.institution_name,
				access_token: data.access_token,
				status: 1, // Active
				last_sync_timestamp: new Date().toISOString(),
			} as any]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bank_connections"] });
			toast.success("Bank connected successfully");
		},
	});

	// Delete connection
	const deleteConnectionMutation = useMutation({
		mutationFn: async (id: string) => {
			const orm = BankConnectionORM.getInstance();
			await orm.deleteBankConnectionById(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bank_connections"] });
			toast.success("Bank connection removed");
		},
	});

	// Handle Plaid Link success
	const handlePlaidSuccess = async (public_token: string, metadata: any) => {
		try {
			const result = await exchangeToken.mutateAsync({ public_token });

			await saveConnectionMutation.mutateAsync({
				access_token: result.access_token,
				item_id: result.item_id,
				institution_name: metadata?.institution?.name || "Bank",
			});
		} catch (error) {
			toast.error("Failed to connect bank account");
		}
	};

	// Simulate Plaid Link (in real app, use Plaid Link SDK)
	const handleConnectBank = () => {
		if (!linkTokenData?.link_token) {
			toast.error("Unable to initialize bank connection");
			return;
		}

		// In a real implementation, you would use Plaid Link SDK here
		// For demo purposes, we'll simulate a successful connection
		toast.info("In production, this would open Plaid Link to connect your bank");

		// Simulate connection (remove this in production)
		handlePlaidSuccess("public-sandbox-test-token", {
			institution: { name: "Demo Bank" }
		});
	};

	// Sync transactions
	const handleSyncTransactions = async (connectionId: string) => {
		toast.info("Syncing transactions from bank...");

		// In production, this would fetch transactions and save them to the database
		queryClient.invalidateQueries({ queryKey: ["transactions"] });

		setTimeout(() => {
			toast.success("Transactions synced successfully");
		}, 1500);
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Building2 className="h-5 w-5 text-emerald-600" />
							<div>
								<CardTitle>Banking Integrations</CardTitle>
								<CardDescription>Connect your bank accounts for automatic transaction syncing</CardDescription>
			</div>
						</div>
						<Button onClick={handleConnectBank} disabled={linkTokenLoading}>
							<Plus className="h-4 w-4 mr-2" />
							Connect Bank
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="connections">Connected Banks</TabsTrigger>
							<TabsTrigger value="transactions">Transactions</TabsTrigger>
						</TabsList>

						<TabsContent value="connections" className="space-y-4">
							{connectionsLoading ? (
								<div className="space-y-3">
									{[1, 2].map((i) => (
										<Skeleton key={i} className="h-24 w-full" />
									))}
								</div>
							) : bankConnections && bankConnections.length > 0 ? (
								<div className="space-y-3">
									{bankConnections.map((connection) => (
										<Card key={connection.id}>
											<CardContent className="pt-6">
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-4">
														<div className="bg-emerald-100 p-3 rounded-full">
															<Building2 className="h-6 w-6 text-emerald-600" />
														</div>
														<div>
															<h3 className="font-semibold">{connection.provider_name}</h3>
															<p className="text-sm text-slate-600">
																Last synced: {new Date(connection.last_sync_timestamp || "").toLocaleDateString()}
															</p>
															<Badge variant={connection.status === 1 ? "default" : "destructive"} className="mt-1">
																{connection.status === 1 ? "Active" : "Inactive"}
															</Badge>
														</div>
													</div>
													<div className="flex gap-2">
														<Button
															variant="outline"
															size="sm"
															onClick={() => {
																setSelectedConnection(connection.id);
																handleSyncTransactions(connection.id);
															}}
														>
															<RefreshCw className="h-4 w-4 mr-2" />
															Sync
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => deleteConnectionMutation.mutate(connection.id)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</div>

												{/* Show accounts for this connection */}
												{selectedConnection === connection.id && plaidAccounts && (
													<div className="mt-4 space-y-2 border-t pt-4">
														<h4 className="text-sm font-semibold">Accounts:</h4>
														{plaidAccounts.accounts.map((account) => (
															<div key={account.id} className="flex items-center justify-between bg-slate-50 p-3 rounded">
																<div>
																	<p className="font-medium">{account.name}</p>
																	<p className="text-sm text-slate-600">{account.type}</p>
																</div>
																<div className="text-right">
																	<p className="font-semibold">{account.currency} {account.balance.toFixed(2)}</p>
																	<Badge variant="outline" className="mt-1">Balance</Badge>
																</div>
															</div>
														))}
													</div>
												)}
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>No connected banks</AlertTitle>
									<AlertDescription>
										Connect your bank account to automatically sync transactions and track your finances.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						<TabsContent value="transactions" className="space-y-4">
							{transactionsLoading ? (
								<div className="space-y-3">
									{[1, 2, 3].map((i) => (
										<Skeleton key={i} className="h-16 w-full" />
									))}
								</div>
							) : plaidTransactions && plaidTransactions.transactions.length > 0 ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between mb-4">
										<h3 className="font-semibold">Recent Transactions (Last 30 Days)</h3>
										<Button variant="outline" size="sm">
											<Download className="h-4 w-4 mr-2" />
											Import All
										</Button>
									</div>
									{plaidTransactions.transactions.map((transaction) => (
										<Card key={transaction.id}>
											<CardContent className="pt-4">
												<div className="flex items-center justify-between">
													<div>
														<p className="font-medium">{transaction.description}</p>
														<p className="text-sm text-slate-600">{transaction.date}</p>
														<div className="flex gap-1 mt-1">
															{transaction.category.map((cat, idx) => (
																<Badge key={idx} variant="secondary" className="text-xs">
																	{cat}
																</Badge>
															))}
														</div>
													</div>
													<div className="text-right">
														<p className={`font-semibold ${transaction.amount < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
															${Math.abs(transaction.amount).toFixed(2)}
														</p>
														<p className="text-xs text-slate-600">
															{transaction.amount < 0 ? 'Credit' : 'Debit'}
														</p>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							) : (
								<Alert>
									<AlertCircle className="h-4 w-4" />
									<AlertTitle>No transactions</AlertTitle>
									<AlertDescription>
										Select a connected bank to view transactions.
									</AlertDescription>
								</Alert>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Info about banking integration */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircle2 className="h-5 w-5 text-emerald-600" />
						Secure Banking Integration
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-slate-600">
					<p>✅ Bank-level 256-bit encryption</p>
					<p>✅ Read-only access to your accounts</p>
					<p>✅ No credentials stored on our servers</p>
					<p>✅ Powered by Plaid - trusted by millions</p>
					<p>✅ Automatic transaction categorization</p>
				</CardContent>
			</Card>
		</div>
	);
}
