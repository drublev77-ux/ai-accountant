import { useSync } from '@/hooks/use-sync';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkStatus() {
	const { syncState, isOnline, forceSync } = useSync();

	const handleForceSync = async () => {
		if (!isOnline) {
			toast.error('Cannot sync while offline');
			return;
		}

		try {
			await forceSync();
			toast.success('Sync completed successfully');
		} catch (error) {
			toast.error('Sync failed. Please try again.');
		}
	};

	const getStatusIcon = () => {
		switch (syncState.status) {
			case 'syncing':
				return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
			case 'success':
				return <CheckCircle className="h-4 w-4 text-emerald-500" />;
			case 'error':
				return <AlertCircle className="h-4 w-4 text-rose-500" />;
			default:
				return <Clock className="h-4 w-4 text-slate-500" />;
		}
	};

	const getStatusText = () => {
		if (!isOnline) return 'Offline';

		switch (syncState.status) {
			case 'syncing':
				return 'Syncing...';
			case 'success':
				return syncState.lastSyncTime
					? `Last synced ${new Date(syncState.lastSyncTime).toLocaleTimeString()}`
					: 'Synced';
			case 'error':
				return `Error: ${syncState.error || 'Unknown error'}`;
			default:
				return 'Ready';
		}
	};

	return (
		<div className="flex items-center gap-3">
			{/* Network Indicator */}
			<Badge
				variant={isOnline ? "default" : "destructive"}
				className="flex items-center gap-1.5"
			>
				{isOnline ? (
					<>
						<Wifi className="h-3 w-3" />
						<span className="text-xs">Online</span>
					</>
				) : (
					<>
						<WifiOff className="h-3 w-3" />
						<span className="text-xs">Offline</span>
					</>
				)}
			</Badge>

			{/* Sync Status */}
			<Badge
				variant="outline"
				className="flex items-center gap-1.5"
			>
				{getStatusIcon()}
				<span className="text-xs">{getStatusText()}</span>
			</Badge>

			{/* Pending Count */}
			{syncState.pendingCount > 0 && (
				<Badge variant="secondary" className="text-xs">
					{syncState.pendingCount} pending
				</Badge>
			)}

			{/* Force Sync Button */}
			<Button
				variant="ghost"
				size="sm"
				onClick={handleForceSync}
				disabled={!isOnline || syncState.status === 'syncing'}
				className="h-8 px-2"
			>
				<RefreshCw className={`h-4 w-4 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
			</Button>
		</div>
	);
}

export function NetworkStatusCard() {
	const { syncState, isOnline, forceSync } = useSync();

	if (isOnline && syncState.pendingCount === 0) {
		return null;
	}

	return (
		<Alert variant={isOnline ? 'default' : 'destructive'}>
			{isOnline ? <AlertCircle className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
			<AlertTitle>
				{isOnline ? 'Pending Synchronization' : 'Offline Mode'}
			</AlertTitle>
			<AlertDescription className="flex items-center justify-between">
				<span>
					{isOnline
						? `You have ${syncState.pendingCount} transaction(s) waiting to sync.`
						: 'Changes will be saved locally and synced when you\'re back online.'
					}
				</span>
				{isOnline && (
					<Button
						onClick={forceSync}
						size="sm"
						variant="outline"
						disabled={syncState.status === 'syncing'}
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Sync Now
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}

export function SyncStatusDetails() {
	const { syncState, isOnline, forceSync, clearLocal } = useSync();

	const handleClearLocal = async () => {
		if (confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
			try {
				await clearLocal();
				toast.success('Local data cleared');
			} catch (error) {
				toast.error('Failed to clear local data');
			}
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					{isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
					Sync Status
				</CardTitle>
				<CardDescription>
					Manage offline data synchronization
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<p className="text-sm font-medium">Network Status</p>
						<Badge variant={isOnline ? "default" : "destructive"}>
							{isOnline ? 'Online' : 'Offline'}
						</Badge>
					</div>

					<div className="space-y-1">
						<p className="text-sm font-medium">Sync Status</p>
						<Badge
							variant={
								syncState.status === 'success' ? 'default' :
								syncState.status === 'error' ? 'destructive' :
								'outline'
							}
						>
							{syncState.status}
						</Badge>
					</div>

					<div className="space-y-1">
						<p className="text-sm font-medium">Pending Items</p>
						<p className="text-2xl font-bold">{syncState.pendingCount}</p>
					</div>

					<div className="space-y-1">
						<p className="text-sm font-medium">Last Sync</p>
						<p className="text-sm text-slate-600">
							{syncState.lastSyncTime
								? new Date(syncState.lastSyncTime).toLocaleString()
								: 'Never'
							}
						</p>
					</div>
				</div>

				{syncState.error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Sync Error</AlertTitle>
						<AlertDescription>{syncState.error}</AlertDescription>
					</Alert>
				)}

				<div className="flex gap-2">
					<Button
						onClick={forceSync}
						disabled={!isOnline || syncState.status === 'syncing'}
						className="flex-1"
					>
						<RefreshCw className={`h-4 w-4 mr-2 ${syncState.status === 'syncing' ? 'animate-spin' : ''}`} />
						Force Sync
					</Button>
					<Button
						onClick={handleClearLocal}
						variant="destructive"
						disabled={syncState.status === 'syncing'}
					>
						Clear Local Data
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
