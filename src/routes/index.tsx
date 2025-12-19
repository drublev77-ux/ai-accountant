import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayCircle, CheckCircle2, XCircle, Clock, GitBranch, RefreshCw, Search, Filter, Github, Zap, Shield, Package, Rocket, AlertCircle, Download, ExternalLink, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
	component: GitHubActionsAutomation,
});

// Types for GitHub Actions data
interface WorkflowRun {
	id: number;
	name: string;
	status: "success" | "failure" | "in_progress" | "queued";
	conclusion?: string;
	created_at: string;
	duration: string;
	event: string;
	branch: string;
	commit: string;
	actor: string;
}

interface Workflow {
	id: number;
	name: string;
	description: string;
	icon: React.ReactNode;
	runs: WorkflowRun[];
	badge_url: string;
}

function GitHubActionsAutomation() {
	const [workflows, setWorkflows] = useState<Workflow[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");
	const [githubToken, setGithubToken] = useState("");
	const [repoOwner, setRepoOwner] = useState("drublev77-ux");
	const [repoName, setRepoName] = useState("ai-accountant");
	const [autoRefresh, setAutoRefresh] = useState(false);

	// Mock workflow data based on the GitHub Actions page
	const mockWorkflows: Workflow[] = [
		{
			id: 1,
			name: "Build Android AAB",
			description: "Compiles Android application bundles for production deployment",
			icon: <Package className="h-5 w-5" />,
			badge_url: `https://github.com/${repoOwner}/${repoName}/actions/workflows/build-android.yml/badge.svg`,
			runs: [
				{
					id: 101,
					name: "Build Android AAB",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-10T14:30:00Z",
					duration: "2m 15s",
					event: "push",
					branch: "main",
					commit: "feat: update dependencies",
					actor: "drublev77-ux"
				},
				{
					id: 102,
					name: "Build Android AAB",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-09T10:20:00Z",
					duration: "2m 45s",
					event: "push",
					branch: "main",
					commit: "fix: gradle config",
					actor: "drublev77-ux"
				}
			]
		},
		{
			id: 2,
			name: "CodeQL",
			description: "Automated code security scanning and vulnerability detection",
			icon: <Shield className="h-5 w-5" />,
			badge_url: `https://github.com/${repoOwner}/${repoName}/actions/workflows/codeql.yml/badge.svg`,
			runs: [
				{
					id: 201,
					name: "CodeQL Analysis",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-11T08:00:00Z",
					duration: "3m 10s",
					event: "schedule",
					branch: "main",
					commit: "scheduled scan",
					actor: "github-actions"
				},
				{
					id: 202,
					name: "CodeQL Analysis",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-10T08:00:00Z",
					duration: "2m 55s",
					event: "schedule",
					branch: "main",
					commit: "scheduled scan",
					actor: "github-actions"
				}
			]
		},
		{
			id: 3,
			name: "Dependabot Updates",
			description: "Manages dependency version updates and security patches",
			icon: <Zap className="h-5 w-5" />,
			badge_url: `https://github.com/${repoOwner}/${repoName}/actions/workflows/dependabot.yml/badge.svg`,
			runs: [
				{
					id: 301,
					name: "Bump js-yaml from 3.13.1 to 3.14.1",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-12T06:15:00Z",
					duration: "45s",
					event: "pull_request",
					branch: "dependabot/npm_and_yarn/js-yaml-3.14.1",
					commit: "Bump js-yaml",
					actor: "dependabot[bot]"
				},
				{
					id: 302,
					name: "Bump lodash from 4.17.20 to 4.17.21",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-11T12:30:00Z",
					duration: "38s",
					event: "pull_request",
					branch: "dependabot/npm_and_yarn/lodash-4.17.21",
					commit: "Bump lodash",
					actor: "dependabot[bot]"
				}
			]
		},
		{
			id: 4,
			name: "Deploy to GitHub Pages",
			description: "Publishes static content to GitHub Pages hosting",
			icon: <Rocket className="h-5 w-5" />,
			badge_url: `https://github.com/${repoOwner}/${repoName}/actions/workflows/pages.yml/badge.svg`,
			runs: [
				{
					id: 401,
					name: "Deploy to GitHub Pages",
					status: "success",
					conclusion: "success",
					created_at: "2025-01-12T15:45:00Z",
					duration: "1m 20s",
					event: "push",
					branch: "main",
					commit: "docs: update README",
					actor: "drublev77-ux"
				}
			]
		}
	];

	// Load workflows on mount
	useEffect(() => {
		const loadWorkflows = async () => {
			setLoading(true);
			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));
			setWorkflows(mockWorkflows);
			setLoading(false);
		};

		loadWorkflows();
	}, [repoOwner, repoName]);

	// Auto-refresh functionality
	useEffect(() => {
		if (!autoRefresh) return;

		const interval = setInterval(() => {
			console.log("Auto-refreshing workflows...");
			setWorkflows([...mockWorkflows]);
		}, 30000); // Refresh every 30 seconds

		return () => clearInterval(interval);
	}, [autoRefresh]);

	// Get status icon and color
	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success":
				return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>;
			case "failure":
				return <Badge className="bg-red-500 hover:bg-red-600 text-white"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
			case "in_progress":
				return <Badge className="bg-blue-500 hover:bg-blue-600 text-white"><Clock className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
			case "queued":
				return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="h-3 w-3 mr-1" />Queued</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	// Filter workflows based on search and filters
	const filteredWorkflows = workflows.filter(workflow => {
		const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			workflow.description.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesWorkflowFilter = selectedWorkflow === "all" || workflow.name === selectedWorkflow;

		return matchesSearch && matchesWorkflowFilter;
	});

	// Get all runs filtered by status
	const getAllFilteredRuns = () => {
		const allRuns: (WorkflowRun & { workflowName: string })[] = [];

		filteredWorkflows.forEach(workflow => {
			workflow.runs.forEach(run => {
				allRuns.push({ ...run, workflowName: workflow.name });
			});
		});

		if (filterStatus === "all") return allRuns;
		return allRuns.filter(run => run.status === filterStatus);
	};

	const allFilteredRuns = getAllFilteredRuns().sort((a, b) =>
		new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	// Trigger workflow manually
	const triggerWorkflow = async (workflowName: string) => {
		alert(`Triggering workflow: ${workflowName}\n\nNote: You need to configure GitHub token and implement GitHub API integration for real automation.`);
	};

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		return `${diffDays}d ago`;
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
			{/* Header */}
			<header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-lg">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div className="flex items-center gap-3">
							<div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
								<Github className="h-7 w-7 text-white" />
							</div>
							<div>
								<h1 className="text-2xl font-bold text-slate-900 dark:text-white">GitHub Actions Automation</h1>
								<p className="text-sm text-slate-600 dark:text-slate-400">{repoOwner}/{repoName}</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={autoRefresh ? "default" : "outline"}
								size="sm"
								onClick={() => setAutoRefresh(!autoRefresh)}
								className="gap-2"
							>
								<RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
								Auto Refresh
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => window.open(`https://github.com/${repoOwner}/${repoName}/actions`, '_blank')}
								className="gap-2"
							>
								<ExternalLink className="h-4 w-4" />
								Open in GitHub
							</Button>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				{/* Configuration Section */}
				<Card className="mb-6 border-2 border-blue-200 dark:border-blue-900">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<AlertCircle className="h-5 w-5 text-blue-600" />
							Configuration
						</CardTitle>
						<CardDescription>Configure repository and authentication settings</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="owner">Repository Owner</Label>
								<Input
									id="owner"
									value={repoOwner}
									onChange={(e) => setRepoOwner(e.target.value)}
									placeholder="drublev77-ux"
								/>
							</div>
							<div>
								<Label htmlFor="repo">Repository Name</Label>
								<Input
									id="repo"
									value={repoName}
									onChange={(e) => setRepoName(e.target.value)}
									placeholder="ai-accountant"
								/>
							</div>
							<div>
								<Label htmlFor="token">GitHub Token (Optional)</Label>
								<Input
									id="token"
									type="password"
									value={githubToken}
									onChange={(e) => setGithubToken(e.target.value)}
									placeholder="ghp_xxxxxxxxxxxx"
								/>
							</div>
						</div>
						<Alert className="mt-4">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Note</AlertTitle>
							<AlertDescription>
								For full automation features, provide a GitHub Personal Access Token with 'repo' and 'workflow' permissions.
							</AlertDescription>
						</Alert>
					</CardContent>
				</Card>

				{/* Workflows Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
					{workflows.map((workflow) => (
						<Card key={workflow.id} className="hover:shadow-xl transition-shadow cursor-pointer border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600">
							<CardHeader className="pb-3">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
										{workflow.icon}
										<CardTitle className="text-base">{workflow.name}</CardTitle>
									</div>
								</div>
								<CardDescription className="text-xs">{workflow.description}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex items-center justify-between text-sm">
										<span className="text-slate-600 dark:text-slate-400">Latest Run:</span>
										{workflow.runs[0] && getStatusBadge(workflow.runs[0].status)}
									</div>
									<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
										<span>{workflow.runs[0] && formatDate(workflow.runs[0].created_at)}</span>
										<span>{workflow.runs[0]?.duration}</span>
									</div>
									<Button
										size="sm"
										className="w-full gap-2"
										onClick={() => triggerWorkflow(workflow.name)}
									>
										<PlayCircle className="h-4 w-4" />
										Trigger Workflow
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>

				{/* Filters and Search */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Filters & Search
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="search" className="flex items-center gap-2">
									<Search className="h-4 w-4" />
									Search
								</Label>
								<Input
									id="search"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search workflows..."
									className="mt-1"
								/>
							</div>
							<div>
								<Label htmlFor="workflow-filter">Workflow</Label>
								<select
									id="workflow-filter"
									value={selectedWorkflow}
									onChange={(e) => setSelectedWorkflow(e.target.value)}
									className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="all">All Workflows</option>
									{workflows.map(w => (
										<option key={w.id} value={w.name}>{w.name}</option>
									))}
								</select>
							</div>
							<div>
								<Label htmlFor="status-filter">Status</Label>
								<select
									id="status-filter"
									value={filterStatus}
									onChange={(e) => setFilterStatus(e.target.value)}
									className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									<option value="all">All Status</option>
									<option value="success">Success</option>
									<option value="failure">Failed</option>
									<option value="in_progress">Running</option>
									<option value="queued">Queued</option>
								</select>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Workflow Runs List */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<GitBranch className="h-5 w-5" />
							Recent Workflow Runs ({allFilteredRuns.length})
						</CardTitle>
						<CardDescription>Latest workflow executions across all workflows</CardDescription>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
							</div>
						) : allFilteredRuns.length === 0 ? (
							<div className="text-center py-12 text-slate-500">
								<GitBranch className="h-12 w-12 mx-auto mb-3 opacity-50" />
								<p>No workflow runs found matching your filters.</p>
							</div>
						) : (
							<div className="space-y-3">
								{allFilteredRuns.map((run) => (
									<div
										key={run.id}
										className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												{getStatusBadge(run.status)}
												<span className="font-semibold text-slate-900 dark:text-white truncate">
													{run.workflowName}
												</span>
											</div>
											<div className="text-sm text-slate-600 dark:text-slate-400 truncate">
												{run.commit}
											</div>
											<div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
												<span className="flex items-center gap-1">
													<GitBranch className="h-3 w-3" />
													{run.branch}
												</span>
												<span className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{formatDate(run.created_at)}
												</span>
												<span>Event: {run.event}</span>
												<span>By: {run.actor}</span>
											</div>
										</div>
										<div className="flex items-center gap-3 ml-4">
											<div className="text-right">
												<div className="text-sm font-medium text-slate-900 dark:text-white">
													{run.duration}
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												onClick={() => window.open(`https://github.com/${repoOwner}/${repoName}/actions/runs/${run.id}`, '_blank')}
											>
												<ExternalLink className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Total Runs</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-blue-600">{allFilteredRuns.length}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Successful</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-green-600">
								{allFilteredRuns.filter(r => r.status === "success").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Failed</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-red-600">
								{allFilteredRuns.filter(r => r.status === "failure").length}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardDescription>Active Workflows</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold text-purple-600">{workflows.length}</div>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
