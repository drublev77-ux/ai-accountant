import { useState, useEffect } from 'react';
import { SyncManager, type SyncState } from '@/lib/sync-manager';

export function useSync() {
	const [syncState, setSyncState] = useState<SyncState>({
		status: 'idle',
		lastSyncTime: null,
		pendingCount: 0,
		error: null,
	});
	const [isOnline, setIsOnline] = useState(navigator.onLine);

	useEffect(() => {
		const syncManager = SyncManager.getInstance();

		// Subscribe to sync state updates
		const unsubscribe = syncManager.subscribe((state) => {
			setSyncState(state);
		});

		// Network status listeners
		const handleOnline = () => {
			setIsOnline(true);
		};

		const handleOffline = () => {
			setIsOnline(false);
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		// Initial sync
		syncManager.sync();

		return () => {
			unsubscribe();
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	}, []);

	const forceSync = async () => {
		const syncManager = SyncManager.getInstance();
		await syncManager.forceSync();
	};

	const clearLocal = async () => {
		const syncManager = SyncManager.getInstance();
		await syncManager.clearLocalData();
	};

	return {
		syncState,
		isOnline,
		forceSync,
		clearLocal,
	};
}
