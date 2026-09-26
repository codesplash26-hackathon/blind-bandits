import { isAxiosError } from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import apiPaths from '@/lib/apiPaths';
import { User } from '@/types/ceylontour';

export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_KEY = 'ceylontour_user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export async function login(credentials: LoginCredentials): Promise<TokenResponse> {
  const response = await axiosInstance.post<TokenResponse>(apiPaths.auth.login, credentials);
  return response.data;
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await axiosInstance.post<User>(apiPaths.auth.register, credentials);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await axiosInstance.get<User>(apiPaths.auth.me);
  return response.data;
}

export function storeAccessToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthErrorMessage(
  error: unknown,
  operation: 'login' | 'register' | 'session',
) {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
  }

  if (!error.response) {
    return 'Unable to reach CeylonTour. Check your connection and try again.';
  }

  const status = error.response.status;
  const detail = error.response.data?.detail;

  if (status === 401) {
    return operation === 'login'
      ? 'The email or password you entered is incorrect.'
      : 'Your session has expired. Please sign in again.';
  }
  if (status === 403) return 'You do not have permission to access this area.';
  if (status === 409 && operation === 'register') {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (status === 422) {
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') {
      return detail[0].msg.replace(/^Value error, /, '');
    }
    return 'Please check the information you entered and try again.';
  }
  if (status >= 500) return 'CeylonTour is temporarily unavailable. Please try again shortly.';

  return typeof detail === 'string' ? detail : 'Request failed. Please try again.';
}
