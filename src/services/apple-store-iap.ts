/**
 * Apple App Store In-App Purchase Integration
 *
 * This service handles in-app purchases through Apple StoreKit
 * For web/PWA apps, this uses StoreKit 2 via JavaScriptCore bridge
 *
 * Production setup requires:
 * 1. App Store Connect setup with product IDs
 * 2. StoreKit configuration file
 * 3. Server-side receipt validation with Apple
 */

export interface AppStoreProduct {
	productId: string;
	localizedTitle: string;
	localizedDescription: string;
	price: number;
	priceLocale: string;
	priceFormatted: string;
}

export interface AppStoreTransaction {
	transactionId: string;
	productId: string;
	transactionDate: Date;
	originalTransactionId: string;
	receipt: string;
	verificationStatus: 'pending' | 'verified' | 'failed';
}

export interface AppStorePurchaseResult {
	success: boolean;
	transaction?: AppStoreTransaction;
	error?: string;
}

class AppleStoreIAPService {
	private readonly PRODUCT_ID = 'com.aiaccountant.lifetime.50usd';
	private isInitialized = false;
	private storeKit: unknown = null;

	/**
	 * Initialize Apple StoreKit
	 * In production, this connects to the iOS StoreKit framework
	 */
	async initialize(): Promise<boolean> {
		try {
			// Check if running in iOS environment with StoreKit
			const hasStoreKit = this.isIOSEnvironment();

			if (!hasStoreKit) {
				console.warn('Apple StoreKit not available in this environment');
				return false;
			}

			// In production: Initialize StoreKit 2
			// this.storeKit = await window.webkit.messageHandlers.StoreKit.initialize()

			this.isInitialized = true;
			console.log('Apple StoreKit initialized');
			return true;
		} catch (error) {
			console.error('Failed to initialize Apple StoreKit:', error);
			return false;
		}
	}

	/**
	 * Check if running in iOS environment with StoreKit support
	 */
	private isIOSEnvironment(): boolean {
		// Check for iOS WebKit interface
		if (typeof (window as any).webkit?.messageHandlers?.StoreKit !== 'undefined') {
			return true;
		}

		// Check for iOS user agent
		const userAgent = navigator.userAgent.toLowerCase();
		const isIOS = /iphone|ipad|ipod/.test(userAgent);
		const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

		return isIOS || isSafari;
	}

	/**
	 * Query product details from App Store
	 */
	async getProductDetails(): Promise<AppStoreProduct | null> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return null;
		}

		try {
			// In production: Request products from StoreKit
			// const products = await window.webkit.messageHandlers.StoreKit.requestProducts([this.PRODUCT_ID])

			// Mock product for development/web environments
			const mockProduct: AppStoreProduct = {
				productId: this.PRODUCT_ID,
				localizedTitle: 'AI Accountant - Lifetime Access',
				localizedDescription: 'Full access to all AI Accountant features forever',
				price: 50.00,
				priceLocale: 'en_US',
				priceFormatted: '$50.00',
			};

			return mockProduct;
		} catch (error) {
			console.error('Failed to query product details:', error);
			return null;
		}
	}

	/**
	 * Launch purchase flow
	 */
	async launchPurchaseFlow(): Promise<AppStorePurchaseResult> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return {
				success: false,
				error: 'Apple StoreKit not available. Please install from App Store.',
			};
		}

		try {
			// In production: Purchase via StoreKit
			// const result = await window.webkit.messageHandlers.StoreKit.purchase(this.PRODUCT_ID)

			// For web/PWA: Redirect to App Store
			if (!this.isIOSEnvironment()) {
				const appStoreUrl = `https://apps.apple.com/app/ai-accountant/id123456789`;
				window.open(appStoreUrl, '_blank');

				return {
					success: false,
					error: 'Please complete purchase on App Store',
				};
			}

			// Mock successful transaction for development
			const mockTransaction: AppStoreTransaction = {
				transactionId: this.generateTransactionId(),
				productId: this.PRODUCT_ID,
				transactionDate: new Date(),
				originalTransactionId: this.generateTransactionId(),
				receipt: this.generateMockReceipt(),
				verificationStatus: 'pending',
			};

			return {
				success: true,
				transaction: mockTransaction,
			};
		} catch (error) {
			console.error('Purchase flow failed:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Purchase failed',
			};
		}
	}

	/**
	 * Verify receipt with Apple's servers
	 */
	async verifyReceipt(receipt: string): Promise<boolean> {
		try {
			// In production: Send receipt to backend for verification
			// Backend should verify with Apple's App Store Server API
			// const response = await fetch('/api/verify-apple-receipt', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({ receipt }),
			// })
			// const data = await response.json()
			// return data.status === 0 // 0 means valid receipt

			// Mock verification for development
			console.log('Verifying Apple receipt...');

			// Simulate server verification delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// In development, always verify as valid
			return true;
		} catch (error) {
			console.error('Receipt verification failed:', error);
			return false;
		}
	}

	/**
	 * Finish transaction (required by Apple)
	 */
	async finishTransaction(transactionId: string): Promise<boolean> {
		try {
			// In production: Finish transaction via StoreKit
			// await window.webkit.messageHandlers.StoreKit.finishTransaction(transactionId)

			console.log('Transaction finished:', transactionId);
			return true;
		} catch (error) {
			console.error('Failed to finish transaction:', error);
			return false;
		}
	}

	/**
	 * Complete full purchase flow with verification
	 */
	async completePurchase(): Promise<AppStorePurchaseResult> {
		// Launch purchase flow
		const purchaseResult = await this.launchPurchaseFlow();

		if (!purchaseResult.success || !purchaseResult.transaction) {
			return purchaseResult;
		}

		// Verify receipt with Apple
		const isValid = await this.verifyReceipt(purchaseResult.transaction.receipt);

		if (!isValid) {
			return {
				success: false,
				error: 'Receipt verification failed',
			};
		}

		// Update transaction status
		purchaseResult.transaction.verificationStatus = 'verified';

		// Finish transaction
		await this.finishTransaction(purchaseResult.transaction.transactionId);

		return purchaseResult;
	}

	/**
	 * Restore previous purchases
	 */
	async restorePurchases(): Promise<AppStoreTransaction[]> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return [];
		}

		try {
			// In production: Restore purchases from StoreKit
			// const transactions = await window.webkit.messageHandlers.StoreKit.restorePurchases()

			// Check local storage for existing purchase
			const hasPurchase = localStorage.getItem('app_purchased') === 'true';
			const platform = localStorage.getItem('purchase_platform');

			if (hasPurchase && platform === 'appstore') {
				const mockTransaction: AppStoreTransaction = {
					transactionId: localStorage.getItem('purchase_transaction_id') || 'RESTORED',
					productId: this.PRODUCT_ID,
					transactionDate: new Date(),
					originalTransactionId: 'RESTORED',
					receipt: 'restored-receipt',
					verificationStatus: 'verified',
				};

				return [mockTransaction];
			}

			return [];
		} catch (error) {
			console.error('Failed to restore purchases:', error);
			return [];
		}
	}

	/**
	 * Check subscription status (for future subscription model)
	 */
	async checkSubscriptionStatus(): Promise<{
		isActive: boolean;
		expirationDate?: Date;
		autoRenewing?: boolean;
	}> {
		try {
			// In production: Check with StoreKit or App Store Server API
			// const status = await window.webkit.messageHandlers.StoreKit.checkSubscription(this.PRODUCT_ID)

			// For lifetime purchase, always active once purchased
			const hasPurchase = localStorage.getItem('app_purchased') === 'true';

			return {
				isActive: hasPurchase,
				expirationDate: undefined, // Lifetime = no expiration
				autoRenewing: false,
			};
		} catch (error) {
			console.error('Failed to check subscription status:', error);
			return { isActive: false };
		}
	}

	// Helper methods for development
	private generateTransactionId(): string {
		return `${Date.now()}${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
	}

	private generateMockReceipt(): string {
		// Mock App Store receipt (base64 encoded)
		const receiptData = {
			receipt_type: 'Production',
			product_id: this.PRODUCT_ID,
			transaction_id: this.generateTransactionId(),
			purchase_date_ms: Date.now(),
			original_purchase_date_ms: Date.now(),
			bundle_id: 'com.aiaccountant.app',
		};

		return btoa(JSON.stringify(receiptData));
	}
}

// Export singleton instance
export const appleStoreIAP = new AppleStoreIAPService();
