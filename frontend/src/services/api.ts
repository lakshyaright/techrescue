/**
 * TechRescue Production API Client Service
 * Configured for Azure Application Gateway path routing and Azure VM backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = localStorage.getItem('techrescue_auth_token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network connection failed to backend service',
    };
  }
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),

  // Health and connectivity test between Frontend and Backend VM
  testConnection: async (): Promise<{ isConnected: boolean; message: string; details?: any }> => {
    try {
      // Try root health or /api/health
      const healthUrl = API_BASE_URL.replace(/\/v1$/, '').replace(/\/api$/, '') + '/health';
      const res = await fetch(healthUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return {
          isConnected: true,
          message: 'Successfully connected to TechRescue Backend API',
          details: data,
        };
      }
      return {
        isConnected: false,
        message: `Backend returned status ${res.status}: ${res.statusText}`,
      };
    } catch (err: any) {
      return {
        isConnected: false,
        message: `Cannot reach Backend API at ${API_BASE_URL}: ${err.message}`,
      };
    }
  },
};
