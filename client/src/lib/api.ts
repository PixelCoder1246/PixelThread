const API_URL =
  typeof window === 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    : '';

export { API_ENDPOINTS } from './apiEndpoints';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    let errorData: {
      message?: string;
      code?: string;
      details?: Record<string, string[]>;
    } = {};

    if (isJson) {
      errorData = await response.json().catch(() => ({}));
    } else {
      errorData.message = await response
        .text()
        .catch(() => 'An error occurred');
    }

    throw new ApiError(
      errorData.message || `HTTP error ${response.status}`,
      response.status,
      errorData.code,
      errorData.details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (isJson) {
    return response.json();
  }

  return response.text() as T;
}

// Track ongoing refresh promise so parallel requests don't trigger multiple refresh calls
let refreshPromise: Promise<boolean> | null = null;

async function attemptTokenRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, headers, _retry, ...fetchOptions } = options;

  let urlString = `${API_URL}${endpoint}`;
  if (params) {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');
    if (query) urlString += `?${query}`;
  }

  const isFormData =
    typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;

  const defaultHeaders: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  };

  const response = await fetch(urlString, {
    ...fetchOptions,
    headers: defaultHeaders,
    credentials: 'include',
  });

  // If unauthorized and we haven't retried yet and not already refreshing/logging in/registering
  if (
    response.status === 401 &&
    !_retry &&
    endpoint !== '/api/auth/login' &&
    endpoint !== '/api/auth/register' &&
    endpoint !== '/api/auth/refresh'
  ) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      // Retry the original request once
      return apiRequest<T>(endpoint, {
        ...options,
        _retry: true,
      });
    }
  }

  return handleResponse<T>(response);
}

export interface ApiClient {
  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  post: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  put: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  patch: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  delete: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  postForm: <T>(
    endpoint: string,
    formData: FormData,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
  putForm: <T>(
    endpoint: string,
    formData: FormData,
    params?: Record<string, string | number | boolean | undefined>
  ) => Promise<T>;
}

export const api: ApiClient = {
  get: <T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ) => apiRequest<T>(endpoint, { method: 'GET', params }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),

  delete: <T>(
    endpoint: string,
    body?: unknown,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
      params,
    }),

  postForm: <T>(
    endpoint: string,
    formData: FormData,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      params,
      headers: {},
    }),

  putForm: <T>(
    endpoint: string,
    formData: FormData,
    params?: Record<string, string | number | boolean | undefined>
  ) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: formData,
      params,
      headers: {},
    }),
};
