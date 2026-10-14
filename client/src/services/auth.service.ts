import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api';
import type { CurrentUser } from '@/types/user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ResendVerificationData {
  email: string;
}

// The server always wraps responses as { success, message, data: T }
interface ServerResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: CurrentUser;
  message: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await api.post<ServerResponse<{ user: CurrentUser }>>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    return { user: res.data.user, message: res.message };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await api.post<ServerResponse<{ user: CurrentUser }>>(
      API_ENDPOINTS.auth.register,
      data
    );
    return { user: res.data.user, message: res.message };
  },

  async logout(): Promise<void> {
    return api.post<void>(API_ENDPOINTS.auth.logout);
  },

  async refreshToken(): Promise<{ message: string }> {
    const res = await api.post<ServerResponse<unknown>>(
      API_ENDPOINTS.auth.refresh
    );
    return { message: res.message };
  },

  async getMe(): Promise<CurrentUser> {
    const res = await api.get<ServerResponse<{ user: CurrentUser }>>(
      API_ENDPOINTS.auth.me
    );
    return res.data.user;
  },

  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.auth.forgotPassword, data);
  },

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.auth.resetPassword, data);
  },

  async verifyEmail(data: VerifyEmailData): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.auth.verifyEmail, data);
  },

  async resendVerification(
    data: ResendVerificationData
  ): Promise<{ message: string }> {
    return api.post(API_ENDPOINTS.auth.resendVerification, data);
  },
};
