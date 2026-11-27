import api from '@/lib/api';
import type {
  User,
  LoginFormData,
  RegisterFormData,
  ApiResponse,
} from '@/types';

export const authService = {
  async login(data: LoginFormData): Promise<User> {
    const res = await api.post<ApiResponse<{ user: User }>>(
      '/auth/login',
      data
    );
    return res.data.data.user;
  },

  async register(data: RegisterFormData): Promise<{ user: User }> {
    const res = await api.post<ApiResponse<{ user: User }>>(
      '/auth/register',
      data
    );
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  },
};
