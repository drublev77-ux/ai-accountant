import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChatCompletion } from "@/hooks/use-openai-gpt-chat";
import { TaxProfileORM, TaxProfileFilingStatus, type TaxProfileModel } from "@/components/data/orm/orm_tax_profile";
import { TransactionORM, TransactionType } from "@/components/data/orm/orm_transaction";
import { APP_CONFIG } from "@/main";
import { Calculator, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

export function TaxCalculatorView() {
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const chat = useChatCompletion();
	const [taxEstimate, setTaxEstimate] = useState<string | null>(null);

	const [profileData, setProfileData] = useState({
		jurisdiction: "",
		filingStatus: "1",
		dependents: "0",
		estimatedTaxRate: "",
		yearlyIncome: "",
	});

	const { data: taxProfile, isLoading: profileLoading } = useQuery({
		queryKey: ["taxProfile", userId],
		queryFn: async () => {
			if (!userId) return null;
			const orm = TaxProfileORM.getInstance();
			const results = await orm.getTaxProfileByUserId(userId);
			const profile = results[0] || null;

			if (profile) {
				setProfileData({
					jurisdiction: profile.jurisdiction,
					filingStatus: profile.filing_status.toString(),
					dependents: profile.dependents.toString(),
					estimatedTaxRate: profile.estimated_tax_rate.toString(),
					yearlyIncome: profile.yearly_income.toString(),
				});
			}

			return profile;
		},
		enabled: !!userId,
	});

	const { data: transactions } = useQuery({
		queryKey: ["transactions", userId],
		queryFn: async () => {
			const orm = TransactionORM.getInstance();
			const [results] = await orm.listTransaction();
			return results.filter((t) => t.user_id === userId);
		},
	});

	const saveMutation = useMutation({
		mutationFn: async (data: Partial<TaxProfileModel>) => {
			const orm = TaxProfileORM.getInstance();

			if (taxProfile) {
				return await orm.setTaxProfileById(taxProfile.id, {
					...taxProfile,
					...data,
				});
			} else {
				return await orm.insertTaxProfile([data as TaxProfileModel]);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["taxProfile"] });
			toast.success("Tax profile saved successfully");
		},
		onError: () => {
			toast.error("Failed to save tax profile");
		},
	});

	const handleSaveProfile = () => {
		if (!userId) {
			toast.error("User not authenticated");
			return;
		}

		saveMutation.mutate({
			user_id: userId,
			jurisdiction: profileData.jurisdiction,
			filing_status: parseInt(profileData.filingStatus) as TaxProfileFilingStatus,
			dependents: parseInt(profileData.dependents),
			estimated_tax_rate: parseFloat(profileData.estimatedTaxRate),
			yearly_income: parseFloat(profileData.yearlyIncome),
		});
	};

	const handleCalculateTax = async () => {
		if (!userId) {
			toast.error("User not authenticated");
			return;
		}

		const totalIncome = transactions
			?.filter((t) => t.type === TransactionType.Income)
			.reduce((sum, t) => sum + t.amount, 0) || 0;

		const filingStatusMap: Record<string, string> = {
			"1": "Single",
			"2": "Married Filing Jointly",
			"3": "Married Filing Separately",
			"4": "Head of Household",
		};

		const prompt = `As a tax expert, calculate estimated taxes for:
- Filing Status: ${filingStatusMap[profileData.filingStatus]}
- Jurisdiction: ${profileData.jurisdiction || "United States"}
- Number of Dependents: ${profileData.dependents}
- Total Income from Transactions: $${totalIncome.toLocaleString()}
- Estimated Yearly Income: $${profileData.yearlyIncome || totalIncome}

Provide:
1. Estimated federal tax liability
2. Potential deductions
3. Tax optimization strategies
4. Important tax deadlines

Be specific with dollar amounts and percentages.`;

		try {
			const response = await chat.mutateAsync({
				messages: [
					{ role: "system", content: "You are a tax calculation expert. Provide accurate tax estimates and advice." },
					{ role: "user", content: prompt }
				],
			});

			setTaxEstimate(response.message);
		} catch (error) {
			toast.error("Failed to calculate tax estimate");
		}
	};

	if (profileLoading) {
		return <Card><CardContent className="py-8 text-center">Loading tax profile...</CardContent></Card>;
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Tax Profile</CardTitle>
					<CardDescription>Set up your tax information for personalized estimates</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="jurisdiction">Jurisdiction</Label>
						<Input
							id="jurisdiction"
							placeholder="e.g., United States, California"
							value={profileData.jurisdiction}
							onChange={(e) => setProfileData({ ...profileData, jurisdiction: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="filingStatus">Filing Status</Label>
						<Select value={profileData.filingStatus} onValueChange={(value) => setProfileData({ ...profileData, filingStatus: value })}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Single</SelectItem>
								<SelectItem value="2">Married Filing Jointly</SelectItem>
								<SelectItem value="3">Married Filing Separately</SelectItem>
								<SelectItem value="4">Head of Household</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="dependents">Number of Dependents</Label>
						<Input
							id="dependents"
							type="number"
							min="0"
							value={profileData.dependents}
							onChange={(e) => setProfileData({ ...profileData, dependents: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="yearlyIncome">Estimated Yearly Income</Label>
						<Input
							id="yearlyIncome"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={profileData.yearlyIncome}
							onChange={(e) => setProfileData({ ...profileData, yearlyIncome: e.target.value })}
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="taxRate">Estimated Tax Rate (%)</Label>
						<Input
							id="taxRate"
							type="number"
							step="0.01"
							placeholder="0.00"
							value={profileData.estimatedTaxRate}
							onChange={(e) => setProfileData({ ...profileData, estimatedTaxRate: e.target.value })}
						/>
					</div>

					<Button onClick={handleSaveProfile} disabled={saveMutation.isPending} className="w-full">
						{saveMutation.isPending ? "Saving..." : "Save Tax Profile"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calculator className="h-5 w-5" />
						AI Tax Calculation
					</CardTitle>
					<CardDescription>Get AI-powered tax estimates and recommendations</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<Button
						onClick={handleCalculateTax}
						disabled={chat.isPending || !profileData.jurisdiction}
						className="w-full"
					>
						{chat.isPending ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Calculating...
							</>
						) : (
							<>
								<Sparkles className="h-4 w-4 mr-2" />
								Calculate Tax Estimate
							</>
						)}
					</Button>

					{taxEstimate && (
						<Alert>
							<Sparkles className="h-4 w-4" />
							<AlertTitle>AI Tax Estimate</AlertTitle>
							<AlertDescription className="mt-2 whitespace-pre-wrap text-sm">
								{taxEstimate}
							</AlertDescription>
						</Alert>
					)}

					{!taxEstimate && !chat.isPending && (
						<div className="text-center py-8 text-slate-500">
							Click the button above to get your personalized tax estimate
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
