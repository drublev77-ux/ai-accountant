import { useQuery, useMutation, type UseQueryResult, type UseMutationResult } from '@tanstack/react-query';
import { getAuthToken } from '@/sdk/core/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_PATH || '';

// Helper function to make authenticated API calls
async function fetchWithAuth<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// Plaid Link Token Hook
// ============================================================================

export interface PlaidLinkTokenResponse {
  link_token: string;
  expiration: string;
}

/**
 * Hook to generate a Plaid Link token for connecting bank accounts
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = usePlaidLinkToken();
 *
 * if (data) {
 *   // Use data.link_token to initialize Plaid Link
 *   const config = {
 *     token: data.link_token,
 *     onSuccess: (public_token) => { ... }
 *   };
 * }
 * ```
 */
export function usePlaidLinkToken(): UseQueryResult<PlaidLinkTokenResponse, Error> {
  return useQuery({
    queryKey: ['plaid', 'link-token'],
    queryFn: async (): Promise<PlaidLinkTokenResponse> => {
      const response = await fetchWithAuth<PlaidLinkTokenResponse>('/api/plaid/create-link-token');

      if (!response.link_token) {
        throw new Error('No link token returned from server');
      }

      return response;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (link tokens expire)
    retry: 2,
  });
}

// ============================================================================
// Exchange Plaid Token Hook
// ============================================================================

export interface ExchangePlaidTokenInput {
  public_token: string;
}

export interface ExchangePlaidTokenResponse {
  access_token: string;
  item_id: string;
}

/**
 * Hook to exchange a Plaid public token for an access token
 *
 * @example
 * ```tsx
 * const exchangeToken = useExchangePlaidToken();
 *
 * const handlePlaidSuccess = async (public_token: string) => {
 *   try {
 *     const result = await exchangeToken.mutateAsync({ public_token });
 *     console.log('Access token:', result.access_token);
 *     console.log('Item ID:', result.item_id);
 *   } catch (error) {
 *     console.error('Failed to exchange token:', error);
 *   }
 * };
 * ```
 */
export function useExchangePlaidToken(): UseMutationResult<
  ExchangePlaidTokenResponse,
  Error,
  ExchangePlaidTokenInput
> {
  return useMutation({
    mutationFn: async (input: ExchangePlaidTokenInput): Promise<ExchangePlaidTokenResponse> => {
      if (!input.public_token) {
        throw new Error('Public token is required');
      }

      const response = await fetchWithAuth<ExchangePlaidTokenResponse>('/api/plaid/exchange-token', {
        method: 'POST',
        body: JSON.stringify({ public_token: input.public_token }),
      });

      if (!response.access_token || !response.item_id) {
        throw new Error('Invalid response from token exchange');
      }

      return response;
    },
    retry: 1,
  });
}

// ============================================================================
// Plaid Accounts Hook
// ============================================================================

export interface PlaidAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface PlaidAccountsInput {
  access_token: string;
}

export interface PlaidAccountsResponse {
  accounts: PlaidAccount[];
}

/**
 * Hook to fetch user's bank accounts from Plaid
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = usePlaidAccounts({
 *   access_token: savedAccessToken
 * });
 *
 * if (data) {
 *   data.accounts.forEach(account => {
 *     console.log(`${account.name}: ${account.balance} ${account.currency}`);
 *   });
 * }
 * ```
 */
export function usePlaidAccounts(
  input: PlaidAccountsInput
): UseQueryResult<PlaidAccountsResponse, Error> {
  return useQuery({
    queryKey: ['plaid', 'accounts', input.access_token],
    queryFn: async (): Promise<PlaidAccountsResponse> => {
      if (!input.access_token) {
        throw new Error('Access token is required');
      }

      const params = new URLSearchParams({ access_token: input.access_token });
      const response = await fetchWithAuth<PlaidAccountsResponse>(
        `/api/plaid/accounts?${params.toString()}`
      );

      return {
        accounts: response.accounts || [],
      };
    },
    enabled: Boolean(input.access_token),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// ============================================================================
// Plaid Transactions Hook
// ============================================================================

export interface PlaidTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string[];
}

export interface PlaidTransactionsInput {
  access_token: string;
  start_date: string;
  end_date: string;
}

export interface PlaidTransactionsResponse {
  transactions: PlaidTransaction[];
}

/**
 * Hook to fetch bank transactions from Plaid
 *
 * @example
 * ```tsx
 * const { data, isLoading } = usePlaidTransactions({
 *   access_token: savedAccessToken,
 *   start_date: '2025-01-01',
 *   end_date: '2025-12-31',
 * });
 *
 * if (data) {
 *   data.transactions.forEach(tx => {
 *     console.log(`${tx.date}: ${tx.description} - $${tx.amount}`);
 *   });
 * }
 * ```
 */
export function usePlaidTransactions(
  input: PlaidTransactionsInput
): UseQueryResult<PlaidTransactionsResponse, Error> {
  return useQuery({
    queryKey: ['plaid', 'transactions', input.access_token, input.start_date, input.end_date],
    queryFn: async (): Promise<PlaidTransactionsResponse> => {
      if (!input.access_token) {
        throw new Error('Access token is required');
      }
      if (!input.start_date || !input.end_date) {
        throw new Error('Start date and end date are required');
      }

      const params = new URLSearchParams({
        access_token: input.access_token,
        start_date: input.start_date,
        end_date: input.end_date,
      });

      const response = await fetchWithAuth<PlaidTransactionsResponse>(
        `/api/plaid/transactions?${params.toString()}`
      );

      return {
        transactions: response.transactions || [],
      };
    },
    enabled: Boolean(input.access_token && input.start_date && input.end_date),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
