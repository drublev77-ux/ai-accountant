/**
 * Unified Purchase Manager
 *
 * This service provides a unified interface for managing purchases across
 * multiple platforms: Google Play, App Store, Palm Store, and web payments
 */

import { googlePlayIAP, type GooglePlayPurchaseResult } from './google-play-iap';
import { appleStoreIAP, type AppStorePurchaseResult } from './apple-store-iap';
import { palmStoreIAP, type PalmStorePurchaseResult } from './palm-store-iap';

export type PlatformType = 'googleplay' | 'appstore' | 'palmstore' | 'web' | 'unknown';

export interface UnifiedPurchaseResult {
	success: boolean;
	platform: PlatformType;
	purchaseId?: string;
	transactionId?: string;
	error?: string;
	verified?: boolean;
}

export interface PurchaseInfo {
	hasPurchase: boolean;
	platform?: PlatformType;
	purchaseDate?: string;
	purchaseId?: string;
	isVerified?: boolean;
}

class PurchaseManager {
	private currentPlatform: PlatformType = 'unknown';

	constructor() {
		this.detectPlatform();
	}

	/**
	 * Detect current platform
	 */
	private detectPlatform(): PlatformType {
		const userAgent = navigator.userAgent.toLowerCase();

		// Check for webOS (Palm Store)
		if (/webos|web0s|hpwos/.test(userAgent) || typeof (window as any).PalmSystem !== 'undefined') {
			this.currentPlatform = 'palmstore';
			return 'palmstore';
		}

		// Check for iOS (App Store)
		if (/iphone|ipad|ipod/.test(userAgent) || typeof (window as any).webkit?.messageHandlers?.StoreKit !== 'undefined') {
			this.currentPlatform = 'appstore';
			return 'appstore';
		}

		// Check for Android (Google Play)
		if (/android/.test(userAgent) || typeof (window as any).AndroidBillingClient !== 'undefined') {
			this.currentPlatform = 'googleplay';
			return 'googleplay';
		}

		// Default to web
		this.currentPlatform = 'web';
		return 'web';
	}

	/**
	 * Get current platform
	 */
	getPlatform(): PlatformType {
		return this.currentPlatform;
	}

	/**
	 * Initialize appropriate store service
	 */
	async initialize(): Promise<boolean> {
		try {
			switch (this.currentPlatform) {
				case 'googleplay':
					return await googlePlayIAP.initialize();
				case 'appstore':
					return await appleStoreIAP.initialize();
				case 'palmstore':
					return await palmStoreIAP.initialize();
				default:
					// Web platform doesn't need initialization
					return true;
			}
		} catch (error) {
			console.error('Failed to initialize purchase manager:', error);
			return false;
		}
	}

	/**
	 * Purchase via platform-specific store
	 */
	async purchaseViaStore(): Promise<UnifiedPurchaseResult> {
		await this.initialize();

		try {
			let result: UnifiedPurchaseResult;

			switch (this.currentPlatform) {
				case 'googleplay': {
					const googleResult = await googlePlayIAP.completePurchase();
					result = this.mapGooglePlayResult(googleResult);
					break;
				}
				case 'appstore': {
					const appleResult = await appleStoreIAP.completePurchase();
					result = this.mapAppStoreResult(appleResult);
					break;
				}
				case 'palmstore': {
					const palmResult = await palmStoreIAP.completePurchase();
					result = this.mapPalmStoreResult(palmResult);
					break;
				}
				default:
					result = {
						success: false,
						platform: 'web',
						error: 'Platform-specific store not available. Please use web payment methods.',
					};
			}

			// Save purchase info if successful
			if (result.success) {
				this.savePurchaseInfo(result);
			}

			return result;
		} catch (error) {
			console.error('Purchase failed:', error);
			return {
				success: false,
				platform: this.currentPlatform,
				error: error instanceof Error ? error.message : 'Purchase failed',
			};
		}
	}

	/**
	 * Restore previous purchases
	 */
	async restorePurchases(): Promise<UnifiedPurchaseResult> {
		await this.initialize();

		try {
			let hasValidPurchase = false;
			let purchaseId: string | undefined;

			switch (this.currentPlatform) {
				case 'googleplay': {
					const purchases = await googlePlayIAP.restorePurchases();
					hasValidPurchase = purchases.length > 0;
					purchaseId = purchases[0]?.orderId;
					break;
				}
				case 'appstore': {
					const transactions = await appleStoreIAP.restorePurchases();
					hasValidPurchase = transactions.length > 0;
					purchaseId = transactions[0]?.transactionId;
					break;
				}
				case 'palmstore': {
					const purchases = await palmStoreIAP.restorePurchases();
					hasValidPurchase = purchases.length > 0;
					purchaseId = purchases[0]?.purchaseId;
					break;
				}
				default: {
					// Check localStorage for web purchases
					hasValidPurchase = localStorage.getItem('app_purchased') === 'true';
					purchaseId = localStorage.getItem('purchase_id') || undefined;
				}
			}

			if (hasValidPurchase) {
				const result: UnifiedPurchaseResult = {
					success: true,
					platform: this.currentPlatform,
					purchaseId,
					verified: true,
				};

				this.savePurchaseInfo(result);
				return result;
			}

			return {
				success: false,
				platform: this.currentPlatform,
				error: 'No purchases found to restore',
			};
		} catch (error) {
			console.error('Restore failed:', error);
			return {
				success: false,
				platform: this.currentPlatform,
				error: error instanceof Error ? error.message : 'Restore failed',
			};
		}
	}

	/**
	 * Get current purchase status
	 */
	getPurchaseInfo(): PurchaseInfo {
		const hasPurchase = localStorage.getItem('app_purchased') === 'true';

		if (!hasPurchase) {
			return { hasPurchase: false };
		}

		return {
			hasPurchase: true,
			platform: (localStorage.getItem('purchase_platform') as PlatformType) || undefined,
			purchaseDate: localStorage.getItem('purchase_date') || undefined,
			purchaseId: localStorage.getItem('purchase_id') || undefined,
			isVerified: localStorage.getItem('purchase_verified') === 'true',
		};
	}

	/**
	 * Check if user has valid purchase
	 */
	hasPurchase(): boolean {
		return this.getPurchaseInfo().hasPurchase;
	}

	/**
	 * Clear purchase data (for testing/logout)
	 */
	clearPurchaseData(): void {
		localStorage.removeItem('app_purchased');
		localStorage.removeItem('purchase_platform');
		localStorage.removeItem('purchase_date');
		localStorage.removeItem('purchase_id');
		localStorage.removeItem('purchase_verified');
		localStorage.removeItem('purchase_transaction_id');
		localStorage.removeItem('purchase_order_id');
	}

	/**
	 * Save purchase info to localStorage
	 */
	private savePurchaseInfo(result: UnifiedPurchaseResult): void {
		localStorage.setItem('app_purchased', 'true');
		localStorage.setItem('purchase_platform', result.platform);
		localStorage.setItem('purchase_date', new Date().toISOString());
		localStorage.setItem('purchase_verified', result.verified ? 'true' : 'false');

		if (result.purchaseId) {
			localStorage.setItem('purchase_id', result.purchaseId);
		}

		if (result.transactionId) {
			localStorage.setItem('purchase_transaction_id', result.transactionId);
		}
	}

	/**
	 * Map Google Play result to unified format
	 */
	private mapGooglePlayResult(result: GooglePlayPurchaseResult): UnifiedPurchaseResult {
		return {
			success: result.success,
			platform: 'googleplay',
			purchaseId: result.purchase?.orderId,
			transactionId: result.purchase?.purchaseToken,
			error: result.error,
			verified: result.success && result.purchase?.purchaseState === 0,
		};
	}

	/**
	 * Map App Store result to unified format
	 */
	private mapAppStoreResult(result: AppStorePurchaseResult): UnifiedPurchaseResult {
		return {
			success: result.success,
			platform: 'appstore',
			purchaseId: result.transaction?.originalTransactionId,
			transactionId: result.transaction?.transactionId,
			error: result.error,
			verified: result.transaction?.verificationStatus === 'verified',
		};
	}

	/**
	 * Map Palm Store result to unified format
	 */
	private mapPalmStoreResult(result: PalmStorePurchaseResult): UnifiedPurchaseResult {
		return {
			success: result.success,
			platform: 'palmstore',
			purchaseId: result.purchase?.purchaseId,
			transactionId: result.purchase?.orderId,
			error: result.error,
			verified: result.success && result.purchase?.status === 'completed',
		};
	}

	/**
	 * Get store URL for manual purchase
	 */
	getStoreUrl(): string {
		switch (this.currentPlatform) {
			case 'googleplay':
				return 'https://play.google.com/store/apps/details?id=com.aiaccountant.app';
			case 'appstore':
				return 'https://apps.apple.com/app/ai-accountant/id123456789';
			case 'palmstore':
				return 'https://palmstore.com/apps/aiaccountant';
			default:
				return window.location.origin;
		}
	}

	/**
	 * Open store page
	 */
	openStorePage(): void {
		const url = this.getStoreUrl();
		window.open(url, '_blank');
	}
}

// Export singleton instance
export const purchaseManager = new PurchaseManager();
