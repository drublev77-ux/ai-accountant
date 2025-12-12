import { OfflineStorage } from './offline-storage';
import { TransactionORM } from '@/components/data/orm/orm_transaction';
import type { TransactionModel } from '@/components/data/orm/orm_transaction';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
	status: SyncStatus;
	lastSyncTime: number | null;
	pendingCount: number;
	error: string | null;
}

type SyncStateListener = (state: SyncState) => void;

export class SyncManager {
	private static instance: SyncManager;
	private offlineStorage: OfflineStorage;
	private orm: TransactionORM;
	private syncState: SyncState = {
		status: 'idle',
		lastSyncTime: null,
		pendingCount: 0,
		error: null,
	};
	private listeners: Set<SyncStateListener> = new Set();
	private syncInterval: number | null = null;
	private isOnline = navigator.onLine;

	private constructor() {
		this.offlineStorage = OfflineStorage.getInstance();
		this.orm = TransactionORM.getInstance();
		this.setupNetworkListeners();
		this.startAutoSync();
	}

	static getInstance(): SyncManager {
		if (!SyncManager.instance) {
			SyncManager.instance = new SyncManager();
		}
		return SyncManager.instance;
	}

	private setupNetworkListeners(): void {
		window.addEventListener('online', () => {
			this.isOnline = true;
			console.log('Network: Online - triggering sync');
			this.sync();
		});

		window.addEventListener('offline', () => {
			this.isOnline = false;
			console.log('Network: Offline - data will be queued');
			this.updateSyncState({ status: 'idle', error: 'Offline mode' });
		});
	}

	private startAutoSync(): void {
		// Auto-sync every 30 seconds when online
		this.syncInterval = window.setInterval(() => {
			if (this.isOnline && this.syncState.status !== 'syncing') {
				this.sync();
			}
		}, 30000);
	}

	stopAutoSync(): void {
		if (this.syncInterval) {
			clearInterval(this.syncInterval);
			this.syncInterval = null;
		}
	}

	subscribe(listener: SyncStateListener): () => void {
		this.listeners.add(listener);
		// Immediately notify with current state
		listener(this.syncState);

		return () => {
			this.listeners.delete(listener);
		};
	}

	private updateSyncState(updates: Partial<SyncState>): void {
		this.syncState = { ...this.syncState, ...updates };
		this.listeners.forEach(listener => listener(this.syncState));
	}

	getState(): SyncState {
		return { ...this.syncState };
	}

	isNetworkOnline(): boolean {
		return this.isOnline;
	}

	async sync(): Promise<void> {
		if (!this.isOnline) {
			console.log('Sync skipped: offline');
			return;
		}

		if (this.syncState.status === 'syncing') {
			console.log('Sync already in progress');
			return;
		}

		try {
			this.updateSyncState({ status: 'syncing', error: null });

			// Step 1: Process sync queue
			const queue = await this.offlineStorage.getSyncQueue();
			console.log(`Processing ${queue.length} items in sync queue`);

			for (const item of queue) {
				try {
					switch (item.action) {
						case 'create':
							await this.orm.insertTransaction([item.data]);
							break;
						case 'update':
							await this.orm.setTransactionById(item.data.id, item.data);
							break;
						case 'delete':
							await this.orm.deleteTransactionById(item.data.id);
							break;
					}

					// Remove from queue on success
					await this.offlineStorage.removeSyncQueueItem(item.id);
					await this.offlineStorage.updateSyncStatus(item.data.id, 'synced');
				} catch (error) {
					console.error(`Failed to sync item ${item.id}:`, error);
					await this.offlineStorage.incrementRetryCount(item.id);

					// Remove from queue after 5 failed attempts
					if (item.retryCount >= 5) {
						console.warn(`Removing item ${item.id} after 5 failed attempts`);
						await this.offlineStorage.removeSyncQueueItem(item.id);
						await this.offlineStorage.updateSyncStatus(item.data.id, 'conflict');
					}
				}
			}

			// Step 2: Pull latest data from server
			const [remoteTransactions] = await this.orm.listTransaction();
			console.log(`Pulled ${remoteTransactions.length} transactions from server`);

			// Step 3: Update local storage with remote data
			await this.offlineStorage.bulkSaveTransactions(remoteTransactions, true);

			// Step 4: Get pending count
			const stats = await this.offlineStorage.getStats();

			this.updateSyncState({
				status: 'success',
				lastSyncTime: Date.now(),
				pendingCount: stats.pendingCount,
				error: null,
			});

			console.log('Sync completed successfully');
		} catch (error) {
			console.error('Sync failed:', error);
			this.updateSyncState({
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown sync error',
			});
		}
	}

	async saveOffline(transaction: TransactionModel, action: 'create' | 'update' | 'delete'): Promise<void> {
		// Save to local storage
		await this.offlineStorage.saveTransaction(transaction, true);

		// Add to sync queue
		await this.offlineStorage.addToSyncQueue(action, transaction);

		// Update pending count
		const stats = await this.offlineStorage.getStats();
		this.updateSyncState({ pendingCount: stats.pendingCount });

		// Try to sync if online
		if (this.isOnline) {
			setTimeout(() => this.sync(), 100);
		}
	}

	async getLocalTransactions(userId: string): Promise<TransactionModel[]> {
		return await this.offlineStorage.getAllTransactions(userId);
	}

	async clearLocalData(): Promise<void> {
		await this.offlineStorage.clearAllData();
		this.updateSyncState({
			pendingCount: 0,
			lastSyncTime: null,
		});
	}

	async forceSync(): Promise<void> {
		console.log('Force sync triggered');
		await this.sync();
	}
}
