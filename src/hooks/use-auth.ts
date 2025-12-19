import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { getAuthToken } from '@/sdk/core/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_PATH || '';

// Helper function to make API calls (auth endpoints don't always require existing token)
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
// User Object Type
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ============================================================================
// Login Hook
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  refresh_token: string;
}

/**
 * Hook for user login
 *
 * @example
 * ```tsx
 * const login = useLogin();
 *
 * const handleLogin = async (email: string, password: string) => {
 *   try {
 *     const result = await login.mutateAsync({ email, password });
 *
 *     // Store tokens
 *     localStorage.setItem('auth_token', result.token);
 *     localStorage.setItem('refresh_token', result.refresh_token);
 *     localStorage.setItem('user', JSON.stringify(result.user));
 *
 *     // Redirect to dashboard
 *     navigate('/dashboard');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * ```
 */
export function useLogin(): UseMutationResult<
  LoginResponse,
  Error,
  LoginInput
> {
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResponse> => {
      // Validate input
      if (!input.email || input.email.trim() === '') {
        throw new Error('Email is required');
      }
      if (!input.password || input.password.trim() === '') {
        throw new Error('Password is required');
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new Error('Invalid email format');
      }

      const response = await fetchAPI<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
      });

      if (!response.token || !response.user || !response.refresh_token) {
        throw new Error('Invalid login response from server');
      }

      return response;
    },
    retry: 1,
  });
}

// ============================================================================
// Register Hook
// ============================================================================

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

/**
 * Hook for user registration
 *
 * @example
 * ```tsx
 * const register = useRegister();
 *
 * const handleRegister = async (email: string, password: string, name: string) => {
 *   try {
 *     const result = await register.mutateAsync({ email, password, name });
 *
 *     // Store token and user data
 *     localStorage.setItem('auth_token', result.token);
 *     localStorage.setItem('user', JSON.stringify(result.user));
 *
 *     // Redirect to onboarding or dashboard
 *     navigate('/onboarding');
 *   } catch (error) {
 *     console.error('Registration failed:', error);
 *   }
 * };
 * ```
 */
export function useRegister(): UseMutationResult<
  RegisterResponse,
  Error,
  RegisterInput
> {
  return useMutation({
    mutationFn: async (input: RegisterInput): Promise<RegisterResponse> => {
      // Validate input
      if (!input.email || input.email.trim() === '') {
        throw new Error('Email is required');
      }
      if (!input.password || input.password.trim() === '') {
        throw new Error('Password is required');
      }
      if (!input.name || input.name.trim() === '') {
        throw new Error('Name is required');
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new Error('Invalid email format');
      }

      // Password strength validation
      if (input.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await fetchAPI<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: input.email,
          password: input.password,
          name: input.name,
        }),
      });

      if (!response.token || !response.user) {
        throw new Error('Invalid registration response from server');
      }

      return response;
    },
    retry: 1,
  });
}

// ============================================================================
// Refresh Token Hook
// ============================================================================

export interface RefreshTokenInput {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  token: string;
  refresh_token: string;
}

/**
 * Hook to refresh JWT token
 *
 * @example
 * ```tsx
 * const refreshToken = useRefreshToken();
 *
 * const handleTokenRefresh = async () => {
 *   const storedRefreshToken = localStorage.getItem('refresh_token');
 *
 *   if (!storedRefreshToken) {
 *     // Redirect to login
 *     navigate('/login');
 *     return;
 *   }
 *
 *   try {
 *     const result = await refreshToken.mutateAsync({
 *       refresh_token: storedRefreshToken
 *     });
 *
 *     // Update stored tokens
 *     localStorage.setItem('auth_token', result.token);
 *     localStorage.setItem('refresh_token', result.refresh_token);
 *   } catch (error) {
 *     console.error('Token refresh failed:', error);
 *     // Redirect to login
 *     navigate('/login');
 *   }
 * };
 *
 * // Automatically refresh token before it expires
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     handleTokenRefresh();
 *   }, 14 * 60 * 1000); // Refresh every 14 minutes (if token expires in 15 min)
 *
 *   return () => clearInterval(interval);
 * }, []);
 * ```
 */
export function useRefreshToken(): UseMutationResult<
  RefreshTokenResponse,
  Error,
  RefreshTokenInput
> {
  return useMutation({
    mutationFn: async (input: RefreshTokenInput): Promise<RefreshTokenResponse> => {
      if (!input.refresh_token || input.refresh_token.trim() === '') {
        throw new Error('Refresh token is required');
      }

      const response = await fetchAPI<RefreshTokenResponse>('/api/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
          refresh_token: input.refresh_token,
        }),
      });

      if (!response.token || !response.refresh_token) {
        throw new Error('Invalid token refresh response from server');
      }

      return response;
    },
    retry: 2,
  });
}
