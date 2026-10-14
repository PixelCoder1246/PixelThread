import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
    token: z.string().min(1, 'Token is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const postCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be at most 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be at most 500 characters')
    .optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  tags: z.array(z.string()).optional(),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;

export const postUpdateSchema = postCreateSchema.partial();

export type PostUpdateInput = z.infer<typeof postUpdateSchema>;

export const profileUpdateSchema = z.object({
  name: z.string().max(100, 'Name too long').optional(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  location: z
    .string()
    .max(100, 'Location must be at most 100 characters')
    .optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const commentCreateSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment too long'),
  parentId: z.string().optional(),
});

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;

export const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(5000, 'Comment too long'),
});

export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  type: z.enum(['posts', 'users', 'tags']).optional(),
  tag: z.string().optional(),
  authorId: z.string().optional(),
  sort: z
    .enum(['newest', 'oldest', 'mostViewed', 'mostLiked', 'relevance'])
    .optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export type SearchInput = z.infer<typeof searchSchema>;
