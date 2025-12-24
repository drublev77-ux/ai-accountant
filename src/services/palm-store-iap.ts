/**
 * Palm Store In-App Purchase Integration
 *
 * This service handles in-app purchases through Palm Store (webOS platform)
 * Palm Store is the app marketplace for Palm/HP webOS and LG webOS devices
 *
 * Production setup requires:
 * 1. Palm Developer Account and app registration
 * 2. Product setup in Palm Store Developer Console
 * 3. webOS SDK integration
 * 4. Server-side purchase verification
 */

export interface PalmStoreProduct {
	productId: string;
	title: string;
	description: string;
	price: string;
	currency: string;
	priceInCents: number;
}

export interface PalmStorePurchase {
	purchaseId: string;
	productId: string;
	orderId: string;
	purchaseToken: string;
	purchaseDate: number;
	status: 'pending' | 'completed' | 'refunded' | 'cancelled';
	receipt: string;
}

export interface PalmStorePurchaseResult {
	success: boolean;
	purchase?: PalmStorePurchase;
	error?: string;
}

class PalmStoreIAPService {
	private readonly PRODUCT_ID = 'aiaccountant_lifetime_access';
	private isInitialized = false;
	private palmService: unknown = null;

	/**
	 * Initialize Palm Store Payment Service
	 * In production, this connects to the webOS Payment Service
	 */
	async initialize(): Promise<boolean> {
		try {
			// Check if running in webOS environment
			const isWebOS = this.isWebOSEnvironment();

			if (!isWebOS) {
				console.warn('Palm Store not available in this environment');
				return false;
			}

			// In production: Initialize webOS Payment Service
			// this.palmService = await window.PalmSystem?.initialize()

			this.isInitialized = true;
			console.log('Palm Store Payment Service initialized');
			return true;
		} catch (error) {
			console.error('Failed to initialize Palm Store:', error);
			return false;
		}
	}

	/**
	 * Check if running in webOS environment
	 */
	private isWebOSEnvironment(): boolean {
		// Check for webOS-specific objects
		if (typeof (window as any).PalmSystem !== 'undefined') {
			return true;
		}

		// Check for webOS user agent
		const userAgent = navigator.userAgent.toLowerCase();
		const isWebOS = /webos|web0s|hpwos/.test(userAgent);

		return isWebOS;
	}

	/**
	 * Query product details from Palm Store
	 */
	async getProductDetails(): Promise<PalmStoreProduct | null> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return null;
		}

		try {
			// In production: Query product info from Palm Store
			// const product = await window.PalmSystem.getProductInfo(this.PRODUCT_ID)

			// Mock product for development
			const mockProduct: PalmStoreProduct = {
				productId: this.PRODUCT_ID,
				title: 'AI Accountant - Lifetime Access',
				description: 'Full access to all AI Accountant features with lifetime updates',
				price: '$50.00',
				currency: 'USD',
				priceInCents: 5000,
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
	async launchPurchaseFlow(): Promise<PalmStorePurchaseResult> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return {
				success: false,
				error: 'Palm Store not available. Please use webOS device or emulator.',
			};
		}

		try {
			// In production: Launch webOS purchase dialog
			// const result = await window.PalmSystem.purchaseProduct({
			//   productId: this.PRODUCT_ID,
			//   quantity: 1,
			// })

			// For non-webOS environments: Show error
			if (!this.isWebOSEnvironment()) {
				return {
					success: false,
					error: 'Palm Store only available on webOS devices',
				};
			}

			// Mock successful purchase for development
			const mockPurchase: PalmStorePurchase = {
				purchaseId: this.generatePurchaseId(),
				productId: this.PRODUCT_ID,
				orderId: `PALM-${Date.now()}`,
				purchaseToken: this.generatePurchaseToken(),
				purchaseDate: Date.now(),
				status: 'completed',
				receipt: this.generateMockReceipt(),
			};

			return {
				success: true,
				purchase: mockPurchase,
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
	 * Verify purchase with Palm Store backend
	 */
	async verifyPurchase(purchase: PalmStorePurchase): Promise<boolean> {
		try {
			// In production: Verify with Palm Store servers via backend
			// const response = await fetch('/api/verify-palm-purchase', {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     purchaseId: purchase.purchaseId,
			//     purchaseToken: purchase.purchaseToken,
			//     receipt: purchase.receipt,
			//   }),
			// })
			// const data = await response.json()
			// return data.valid === true

			// Mock verification for development
			console.log('Verifying Palm Store purchase:', purchase.purchaseId);

			// Simulate server verification delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// In development, always verify as valid
			return true;
		} catch (error) {
			console.error('Purchase verification failed:', error);
			return false;
		}
	}

	/**
	 * Consume purchase (mark as consumed in Palm Store)
	 */
	async consumePurchase(purchaseToken: string): Promise<boolean> {
		try {
			// In production: Consume purchase via webOS API
			// await window.PalmSystem.consumePurchase(purchaseToken)

			console.log('Purchase consumed:', purchaseToken);
			return true;
		} catch (error) {
			console.error('Failed to consume purchase:', error);
			return false;
		}
	}

	/**
	 * Complete full purchase flow with verification
	 */
	async completePurchase(): Promise<PalmStorePurchaseResult> {
		// Launch purchase flow
		const purchaseResult = await this.launchPurchaseFlow();

		if (!purchaseResult.success || !purchaseResult.purchase) {
			return purchaseResult;
		}

		// Verify purchase with backend
		const isValid = await this.verifyPurchase(purchaseResult.purchase);

		if (!isValid) {
			return {
				success: false,
				error: 'Purchase verification failed',
			};
		}

		// Consume purchase (for consumable items, not needed for lifetime access)
		// await this.consumePurchase(purchaseResult.purchase.purchaseToken);

		return purchaseResult;
	}

	/**
	 * Restore previous purchases
	 */
	async restorePurchases(): Promise<PalmStorePurchase[]> {
		if (!this.isInitialized) {
			await this.initialize();
		}

		if (!this.isInitialized) {
			return [];
		}

		try {
			// In production: Query purchase history from Palm Store
			// const purchases = await window.PalmSystem.getPurchaseHistory()

			// Check local storage for existing purchase
			const hasPurchase = localStorage.getItem('app_purchased') === 'true';
			const platform = localStorage.getItem('purchase_platform');

			if (hasPurchase && platform === 'palmstore') {
				const mockPurchase: PalmStorePurchase = {
					purchaseId: localStorage.getItem('purchase_id') || 'RESTORED',
					productId: this.PRODUCT_ID,
					orderId: 'RESTORED-ORDER',
					purchaseToken: 'restored-token',
					purchaseDate: Date.now(),
					status: 'completed',
					receipt: 'restored-receipt',
				};

				return [mockPurchase];
			}

			return [];
		} catch (error) {
			console.error('Failed to restore purchases:', error);
			return [];
		}
	}

	/**
	 * Check if user owns the product
	 */
	async checkOwnership(): Promise<boolean> {
		try {
			// In production: Check ownership via webOS API
			// const owned = await window.PalmSystem.checkOwnership(this.PRODUCT_ID)

			// Check local storage
			const hasPurchase = localStorage.getItem('app_purchased') === 'true';
			const platform = localStorage.getItem('purchase_platform');

			return hasPurchase && platform === 'palmstore';
		} catch (error) {
			console.error('Failed to check ownership:', error);
			return false;
		}
	}

	/**
	 * Get purchase history
	 */
	async getPurchaseHistory(): Promise<PalmStorePurchase[]> {
		return this.restorePurchases();
	}

	// Helper methods for development
	private generatePurchaseId(): string {
		return `PALM_${Date.now()}_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
	}

	private generatePurchaseToken(): string {
		return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
	}

	private generateMockReceipt(): string {
		const receiptData = {
			purchaseId: this.generatePurchaseId(),
			productId: this.PRODUCT_ID,
			orderId: `PALM-${Date.now()}`,
			purchaseDate: new Date().toISOString(),
			appId: 'com.aiaccountant.app',
			platform: 'webos',
			status: 'completed',
		};

		return btoa(JSON.stringify(receiptData));
	}
}

// Export singleton instance
export const palmStoreIAP = new PalmStoreIAPService();
