// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7071';
export const API_TIMEOUT = 30000; // 30 seconds

// API error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP client configuration
const createHttpClient = () => {
  const client = {
    async request<T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<T> {
      const url = `${API_BASE_URL}${endpoint}`;
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      try {
        const response = await fetch(url, {
          ...options,
          headers: defaultHeaders,
          signal: AbortSignal.timeout(API_TIMEOUT),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }

        return response.text() as unknown as T;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        if (error instanceof DOMException && error.name === 'TimeoutError') {
          throw new ApiError('Request timeout', 408);
        }

        throw new ApiError(
          error instanceof Error ? error.message : 'Network error',
          0
        );
      }
    },

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
      const searchParams = params 
        ? '?' + new URLSearchParams(params).toString()
        : '';
      
      return this.request<T>(`${endpoint}${searchParams}`, {
        method: 'GET',
      });
    },

    async post<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async put<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async patch<T>(endpoint: string, data?: any): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async delete<T>(endpoint: string): Promise<T> {
      return this.request<T>(endpoint, {
        method: 'DELETE',
      });
    },
  };

  return client;
};

export const httpClient = createHttpClient();

// Request/Response interceptors
export const addRequestInterceptor = (
  interceptor: (config: RequestInit) => RequestInit | Promise<RequestInit>
) => {
  // Implementation would modify the httpClient to use interceptors
  // For now, this is a placeholder
};

export const addResponseInterceptor = (
  onSuccess: (response: Response) => Response | Promise<Response>,
  onError: (error: ApiError) => ApiError | Promise<ApiError>
) => {
  // Implementation would modify the httpClient to use interceptors
  // For now, this is a placeholder
};
