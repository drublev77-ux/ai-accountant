import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FinancialReminderORM, FinancialReminderFrequency, type FinancialReminderModel } from "@/components/data/orm/orm_financial_reminder";
import { APP_CONFIG } from "@/main";
import { Plus, Bell, Check, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function RemindersView() {
	const queryClient = useQueryClient();
	const userId = APP_CONFIG.userId;
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingReminder, setEditingReminder] = useState<FinancialReminderModel | null>(null);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		dueDate: "",
		frequency: "1",
		category: "",
	});

	const { data: reminders, isLoading } = useQuery({
		queryKey: ["reminders", userId],
		queryFn: async () => {
			const orm = FinancialReminderORM.getInstance();
			const [results] = await orm.listFinancialReminder();
			return results
				.filter((r) => r.user_id === userId)
				.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: Partial<FinancialReminderModel>) => {
			const orm = FinancialReminderORM.getInstance();
			return await orm.insertFinancialReminder([data as FinancialReminderModel]);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reminders"] });
			toast.success("Reminder created successfully");
			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to create reminder");
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (reminder: FinancialReminderModel) => {
			const orm = FinancialReminderORM.getInstance();
			return await orm.setFinancialReminderById(reminder.id, reminder);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reminders"] });
			toast.success("Reminder updated successfully");
			resetForm();
			setIsDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to update reminder");
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const orm = FinancialReminderORM.getInstance();
			await orm.deleteFinancialReminderById(id);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reminders"] });
			toast.success("Reminder deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete reminder");
		},
	});

	const resetForm = () => {
		setFormData({
			title: "",
			description: "",
			dueDate: "",
			frequency: "1",
			category: "",
		});
		setEditingReminder(null);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!userId) {
			toast.error("User not authenticated");
			return;
		}

		const reminderData = {
			user_id: userId,
			title: formData.title,
			description: formData.description || null,
			due_date: formData.dueDate,
			frequency: parseInt(formData.frequency) as FinancialReminderFrequency,
			is_completed: false,
			category: formData.category || null,
		};

		if (editingReminder) {
			updateMutation.mutate({
				...editingReminder,
				...reminderData,
			});
		} else {
			createMutation.mutate(reminderData);
		}
	};

	const handleToggleComplete = (reminder: FinancialReminderModel) => {
		updateMutation.mutate({
			...reminder,
			is_completed: !reminder.is_completed,
		});
	};

	const handleEdit = (reminder: FinancialReminderModel) => {
		setEditingReminder(reminder);
		setFormData({
			title: reminder.title,
			description: reminder.description || "",
			dueDate: reminder.due_date,
			frequency: reminder.frequency.toString(),
			category: reminder.category || "",
		});
		setIsDialogOpen(true);
	};

	const handleDelete = (id: string) => {
		if (confirm("Are you sure you want to delete this reminder?")) {
			deleteMutation.mutate(id);
		}
	};

	const frequencyNames: Record<number, string> = {
		1: "One Time",
		2: "Daily",
		3: "Weekly",
		4: "Monthly",
		5: "Yearly",
	};

	const categories = ["Tax Deadline", "Bill Payment", "Report Generation", "General"];

	const activeReminders = reminders?.filter((r) => !r.is_completed) || [];
	const completedReminders = reminders?.filter((r) => r.is_completed) || [];

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Financial Reminders</CardTitle>
							<CardDescription>Never miss important financial tasks</CardDescription>
						</div>
						<Dialog open={isDialogOpen} onOpenChange={(open) => {
							setIsDialogOpen(open);
							if (!open) resetForm();
						}}>
							<DialogTrigger asChild>
								<Button>
									<Plus className="h-4 w-4 mr-2" />
									Add Reminder
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>{editingReminder ? "Edit Reminder" : "Add Reminder"}</DialogTitle>
									<DialogDescription>
										{editingReminder ? "Update" : "Create"} a reminder for financial tasks
									</DialogDescription>
								</DialogHeader>
								<form onSubmit={handleSubmit}>
									<div className="grid gap-4 py-4">
										<div className="grid gap-2">
											<Label htmlFor="title">Title</Label>
											<Input
												id="title"
												placeholder="e.g., Pay quarterly taxes"
												value={formData.title}
												onChange={(e) => setFormData({ ...formData, title: e.target.value })}
												required
											/>
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
											<Label htmlFor="dueDate">Due Date</Label>
											<Input
												id="dueDate"
												type="date"
												value={formData.dueDate}
												onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
												required
											/>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="frequency">Frequency</Label>
											<Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="1">One Time</SelectItem>
													<SelectItem value="2">Daily</SelectItem>
													<SelectItem value="3">Weekly</SelectItem>
													<SelectItem value="4">Monthly</SelectItem>
													<SelectItem value="5">Yearly</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="description">Description (Optional)</Label>
											<Textarea
												id="description"
												placeholder="Add details..."
												value={formData.description}
												onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											/>
										</div>
									</div>
									<DialogFooter>
										<Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
											{editingReminder ? "Update" : "Create"} Reminder
										</Button>
									</DialogFooter>
								</form>
							</DialogContent>
						</Dialog>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="text-center py-8 text-slate-500">Loading reminders...</div>
					) : !reminders || reminders.length === 0 ? (
						<div className="text-center py-8 text-slate-500">
							No reminders yet. Create your first reminder!
						</div>
					) : (
						<div className="space-y-6">
							{activeReminders.length > 0 && (
								<div className="space-y-3">
									<h3 className="font-semibold text-sm text-slate-700">Active Reminders</h3>
									{activeReminders.map((reminder) => {
										const isPastDue = new Date(reminder.due_date) < new Date();
										return (
											<Card key={reminder.id} className={isPastDue ? "border-rose-300" : ""}>
												<CardContent className="pt-4">
													<div className="flex items-start gap-3">
														<Checkbox
															checked={reminder.is_completed}
															onCheckedChange={() => handleToggleComplete(reminder)}
															className="mt-1"
														/>
														<div className="flex-1">
															<div className="flex items-start justify-between">
																<div>
																	<h4 className="font-medium">{reminder.title}</h4>
																	{reminder.description && (
																		<p className="text-sm text-slate-600 mt-1">
																			{reminder.description}
																		</p>
																	)}
																	<div className="flex gap-2 mt-2">
																		<Badge variant={isPastDue ? "destructive" : "outline"}>
																			<Bell className="h-3 w-3 mr-1" />
																			{new Date(reminder.due_date).toLocaleDateString()}
																		</Badge>
																		<Badge variant="secondary">
																			{frequencyNames[reminder.frequency]}
																		</Badge>
																		{reminder.category && (
																			<Badge variant="outline">{reminder.category}</Badge>
																		)}
																	</div>
																</div>
																<div className="flex gap-2">
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => handleEdit(reminder)}
																	>
																		<Pencil className="h-4 w-4" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="sm"
																		onClick={() => handleDelete(reminder.id)}
																		disabled={deleteMutation.isPending}
																	>
																		<Trash2 className="h-4 w-4 text-rose-600" />
																	</Button>
																</div>
															</div>
														</div>
													</div>
												</CardContent>
											</Card>
										);
									})}
								</div>
							)}

							{completedReminders.length > 0 && (
								<div className="space-y-3">
									<h3 className="font-semibold text-sm text-slate-700">Completed</h3>
									{completedReminders.map((reminder) => (
										<Card key={reminder.id} className="opacity-60">
											<CardContent className="pt-4">
												<div className="flex items-start gap-3">
													<Checkbox
														checked={reminder.is_completed}
														onCheckedChange={() => handleToggleComplete(reminder)}
														className="mt-1"
													/>
													<div className="flex-1">
														<div className="flex items-start justify-between">
															<div>
																<h4 className="font-medium line-through">{reminder.title}</h4>
																{reminder.description && (
																	<p className="text-sm text-slate-600 mt-1 line-through">
																		{reminder.description}
																	</p>
																)}
																<div className="flex gap-2 mt-2">
																	<Badge variant="outline">
																		<Check className="h-3 w-3 mr-1" />
																		Completed
																	</Badge>
																</div>
															</div>
															<Button
																variant="ghost"
																size="sm"
																onClick={() => handleDelete(reminder.id)}
																disabled={deleteMutation.isPending}
															>
																<Trash2 className="h-4 w-4 text-rose-600" />
															</Button>
														</div>
													</div>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
