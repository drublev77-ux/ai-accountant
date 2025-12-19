import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TransactionModel } from '@/components/data/orm/orm_transaction';

interface OfflineDB extends DBSchema {
	transactions: {
		key: string;
		value: TransactionModel & {
			_syncStatus?: 'pending' | 'synced' | 'conflict';
			_lastModified?: number;
			_offline?: boolean;
		};
		indexes: {
			'by-user': string;
			'by-date': string;
			'by-sync-status': string;
		};
	};
	syncQueue: {
		key: string;
		value: {
			id: string;
			action: 'create' | 'update' | 'delete';
			data: TransactionModel;
			timestamp: number;
			retryCount: number;
		};
	};
}

const DB_NAME = 'ai-accountant-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OfflineDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
	if (dbInstance) {
		return dbInstance;
	}

	dbInstance = await openDB<OfflineDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			// Transactions store
			if (!db.objectStoreNames.contains('transactions')) {
				const transactionStore = db.createObjectStore('transactions', {
					keyPath: 'id',
				});
				transactionStore.createIndex('by-user', 'user_id');
				transactionStore.createIndex('by-date', 'date');
				transactionStore.createIndex('by-sync-status', '_syncStatus');
			}

			// Sync queue store
			if (!db.objectStoreNames.contains('syncQueue')) {
				db.createObjectStore('syncQueue', {
					keyPath: 'id',
				});
			}
		},
	});

	return dbInstance;
}

export class OfflineStorage {
	private static instance: OfflineStorage;

	private constructor() {}

	static getInstance(): OfflineStorage {
		if (!OfflineStorage.instance) {
			OfflineStorage.instance = new OfflineStorage();
		}
		return OfflineStorage.instance;
	}

	// Transaction operations
	async saveTransaction(transaction: TransactionModel, offline = false): Promise<void> {
		const db = await getDB();
		await db.put('transactions', {
			...transaction,
			_syncStatus: offline ? 'pending' : 'synced',
			_lastModified: Date.now(),
			_offline: offline,
		});
	}

	async getTransaction(id: string): Promise<TransactionModel | undefined> {
		const db = await getDB();
		return await db.get('transactions', id);
	}

	async getAllTransactions(userId: string): Promise<TransactionModel[]> {
		const db = await getDB();
		const allTransactions = await db.getAllFromIndex('transactions', 'by-user', userId);
		return allTransactions.sort((a, b) =>
			new Date(b.date).getTime() - new Date(a.date).getTime()
		);
	}

	async deleteTransaction(id: string): Promise<void> {
		const db = await getDB();
		await db.delete('transactions', id);
	}

	async getPendingTransactions(): Promise<TransactionModel[]> {
		const db = await getDB();
		return await db.getAllFromIndex('transactions', 'by-sync-status', 'pending');
	}

	async updateSyncStatus(id: string, status: 'pending' | 'synced' | 'conflict'): Promise<void> {
		const db = await getDB();
		const transaction = await db.get('transactions', id);
		if (transaction) {
			transaction._syncStatus = status;
			transaction._lastModified = Date.now();
			await db.put('transactions', transaction);
		}
	}

	// Sync queue operations
	async addToSyncQueue(action: 'create' | 'update' | 'delete', data: TransactionModel): Promise<void> {
		const db = await getDB();
		const queueItem = {
			id: `${action}-${data.id}-${Date.now()}`,
			action,
			data,
			timestamp: Date.now(),
			retryCount: 0,
		};
		await db.add('syncQueue', queueItem);
	}

	async getSyncQueue() {
		const db = await getDB();
		return await db.getAll('syncQueue');
	}

	async removeSyncQueueItem(id: string): Promise<void> {
		const db = await getDB();
		await db.delete('syncQueue', id);
	}

	async clearSyncQueue(): Promise<void> {
		const db = await getDB();
		await db.clear('syncQueue');
	}

	async incrementRetryCount(id: string): Promise<void> {
		const db = await getDB();
		const item = await db.get('syncQueue', id);
		if (item) {
			item.retryCount++;
			await db.put('syncQueue', item);
		}
	}

	// Bulk operations
	async bulkSaveTransactions(transactions: TransactionModel[], synced = true): Promise<void> {
		const db = await getDB();
		const tx = db.transaction('transactions', 'readwrite');

		await Promise.all([
			...transactions.map(transaction =>
				tx.store.put({
					...transaction,
					_syncStatus: synced ? 'synced' : 'pending',
					_lastModified: Date.now(),
					_offline: !synced,
				})
			),
			tx.done,
		]);
	}

	async clearAllData(): Promise<void> {
		const db = await getDB();
		await Promise.all([
			db.clear('transactions'),
			db.clear('syncQueue'),
		]);
	}

	// Get storage stats
	async getStats() {
		const db = await getDB();
		const [totalTransactions, pendingCount, queueCount] = await Promise.all([
			db.count('transactions'),
			db.countFromIndex('transactions', 'by-sync-status', 'pending'),
			db.count('syncQueue'),
		]);

		return {
			totalTransactions,
			pendingCount,
			queueCount,
			hasUnsyncedData: pendingCount > 0 || queueCount > 0,
		};
	}
}
