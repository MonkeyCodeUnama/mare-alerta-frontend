import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function request(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }

  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    if (response.status === 401 && token) window.dispatchEvent(new Event('mare-alerta-unauthorized'));
    const message = typeof data === 'string' && data.trim()
      ? data
      : data?.message || data?.mensagem || `A solicitação falhou (${response.status}).`;
    throw new ApiError(message, response.status);
  }
  return data;
}

export const jsonBody = (value) => JSON.stringify(value);
