const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface ApiError extends Error {
  status?: number;
  code?: string;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = new Error(`API error: ${response.status}`);
    error.status = response.status;
    
    try {
      const data = await response.json();
      error.message = data.message || error.message;
      error.code = data.code;
    } catch {
      // Ignore parse error
    }
    
    throw error;
  }

  return response.json();
}

export function createApiMethod<TParams, TResponse>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  pathBuilder: (params: TParams) => string
) {
  return (params: TParams, body?: unknown): Promise<TResponse> => {
    const url = pathBuilder(params);
    
    const options: RequestInit = {
      method,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return apiClient<TResponse>(url, options);
  };
}