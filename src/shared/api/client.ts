import type {
  AlertaBairroRequest,
  AlertaRequest,
  AlertaResponse,
  BairroCatalogoDTO,
  ChecklistResumoDTO,
  EnvioAlertaWhatsappResponse,
  EstabelecimentoAtualizacaoRequest,
  EstabelecimentoResponse,
  ItemChecklistRequest,
  ItemChecklistResponse,
  ItemCriticoRequest,
  ItemCriticoResponse,
  LeituraTelemetriaResponse,
  LoginRequest,
  OcorrenciaRequest,
  OcorrenciaResponse,
  PainelResumoDTO,
  RegisterRequest,
  RiscoResponse,
  StatusOcorrencia,
  TelemetriaDashboardResponse,
  TelemetriaPontoGraficoDTO,
  TokenResponse,
  WhatsappHistoricoResponse,
  WhatsappStatusResponse,
  WhatsappTestRequest,
} from './types';

export const API_BASE_URL =
  import.meta.env.PUBLIC_API_BASE_URL?.replace(/\/+$/, '') ||
  'https://ma-api.andr3dav1d.dev';

const TOKEN_KEY = 'mare_alerta_token';
const REFRESH_KEY = 'mare_alerta_refresh_token';
const USER_KEY = 'mare_alerta_user';

export interface StoredAuthSession {
  email: string;
  role: string;
  estabelecimentoId: number | null;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function hasRealAuthToken(): boolean {
  return Boolean(getAccessToken());
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function getStoredSession(): StoredAuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

const GET_CACHE_TTL_MS = 15_000;
const inFlightGets = new Map<string, Promise<unknown>>();
const getCache = new Map<string, { data: unknown; expiresAt: number }>();

export function invalidateApiCache(): void {
  getCache.clear();
  inFlightGets.clear();
}

export function saveAuthSession(data: TokenResponse): void {
  if (typeof window === 'undefined') return;
  invalidateApiCache();
  localStorage.setItem(TOKEN_KEY, data.token);
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
  }
  const session: StoredAuthSession = {
    email: data.email,
    role: data.role,
    estabelecimentoId: data.estabelecimentoId,
  };
  localStorage.setItem(USER_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent('auth-session-changed', { detail: session }));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  const hadSession =
    Boolean(localStorage.getItem(TOKEN_KEY)) ||
    Boolean(localStorage.getItem(REFRESH_KEY)) ||
    Boolean(localStorage.getItem(USER_KEY));
  invalidateApiCache();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  if (hadSession) {
    window.dispatchEvent(new CustomEvent('auth-session-changed', { detail: null }));
  }
}

export function humanizeApiError(
  status: number,
  rawMessage?: string,
  path?: string
): string {
  const clean = (rawMessage ?? '').trim();
  const lower = clean.toLowerCase();

  if (status === 429 || lower.includes('limite de requisições') || lower.includes('too many requests')) {
    return 'Muitas ações em sequência. Aguarde alguns instantes e tente novamente.';
  }
  if (status === 409) {
    if (path?.startsWith('/auth/') || lower.includes('e-mail') || lower.includes('email')) {
      return 'Este e-mail já está cadastrado. Faça login ou utilize outro endereço.';
    }
    if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return 'Não foi possível concluir a ação no estado atual.';
  }
  if (lower.includes('já cadastrado')) {
    return 'Este e-mail já está cadastrado. Faça login ou utilize outro endereço.';
  }
  if (status === 401 || lower.includes('credenciais inválidas') || lower.includes('unauthorized')) {
    if (path?.startsWith('/auth/')) {
      return 'E-mail ou senha incorretos. Confira os dados e tente novamente.';
    }
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  if (status === 403 || lower.includes('sem permissão') || lower.includes('forbidden')) {
    return 'Você não tem permissão para realizar esta ação.';
  }
  if (status === 404 || lower.includes('não encontrad') || lower.includes('nao encontrad')) {
    return clean && !lower.startsWith('not found')
      ? clean.charAt(0).toUpperCase() + clean.slice(1)
      : 'Não encontramos o registro solicitado.';
  }
  if (status >= 500) {
    return 'O serviço está temporariamente indisponível. Tente novamente em instantes.';
  }
  if (clean && !lower.startsWith('erro http') && !lower.startsWith('bad request')) {
    const formatted = clean.replace(/^[a-zA-Z0-9_.]+:\s*/, '');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
  return 'Não foi possível concluir a solicitação. Confira os dados e tente novamente.';
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          clearAuthSession();
          return null;
        }
        const data = (await res.json()) as TokenResponse;
        saveAuthSession(data);
        return data.token;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  retryOn401?: boolean;
  timeoutMs?: number;
}

async function executeRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, retryOn401 = true, timeoutMs, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);

  if (!(rest.body instanceof FormData) && !mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      mergedHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const effectiveTimeout =
    timeoutMs ?? ((rest.method ?? 'GET').toUpperCase() === 'GET' ? 7500 : 12000);
  const controller = new AbortController();
  const timeoutId =
    typeof window !== 'undefined'
      ? window.setTimeout(() => controller.abort(), effectiveTimeout)
      : undefined;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: mergedHeaders,
      signal: rest.signal ?? controller.signal,
    });
  } catch (err) {
    const isAbort = err instanceof DOMException && err.name === 'AbortError';
    throw new ApiError(
      0,
      isAbort
        ? 'O servidor demorou para responder. Tente novamente em instantes.'
        : 'Não foi possível conectar ao servidor. Verifique sua conexão.'
    );
  } finally {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  }

  if (response.status === 401 && retryOn401 && !skipAuth) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      return executeRequest<T>(path, { ...options, retryOn401: false });
    }
    clearAuthSession();
  }

  if (!response.ok) {
    let rawMessage = '';
    let details: unknown;
    try {
      const text = await response.text();
      if (text) {
        details = JSON.parse(text);
        if (typeof details === 'object' && details !== null && 'message' in details) {
          rawMessage = String((details as { message: unknown }).message);
        } else if (typeof details === 'object' && details !== null && 'error' in details) {
          rawMessage = String((details as { error: unknown }).error);
        }
      }
    } catch {
      // ignora parse de erro não-JSON
    }
    throw new ApiError(
      response.status,
      humanizeApiError(response.status, rawMessage, path),
      details
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }
  return (await response.text()) as unknown as T;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? 'GET').toUpperCase();

  if (method !== 'GET') {
    const result = await executeRequest<T>(path, options);
    getCache.clear();
    return result;
  }

  const tokenScope = options.skipAuth ? '' : (getAccessToken() ?? '');
  const cacheKey = `${tokenScope}:${path}`;
  const cached = getCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }

  const pending = inFlightGets.get(cacheKey);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = executeRequest<T>(path, options)
    .then((data) => {
      getCache.set(cacheKey, { data, expiresAt: Date.now() + GET_CACHE_TTL_MS });
      return data;
    })
    .finally(() => {
      inFlightGets.delete(cacheKey);
    });

  inFlightGets.set(cacheKey, promise);
  return promise;
}

/* ============================================================================
 * MÓDULOS DA API
 * ========================================================================== */

export const authApi = {
  async login(payload: LoginRequest): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    saveAuthSession(res);
    return res;
  },

  async register(payload: RegisterRequest): Promise<TokenResponse> {
    const res = await request<TokenResponse>('/auth/registro', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true,
    });
    saveAuthSession(res);
    return res;
  },

  async verificarEmail(email: string): Promise<{ disponivel: boolean }> {
    const query = `?email=${encodeURIComponent(email.trim().toLowerCase())}`;
    return executeRequest<{ disponivel: boolean }>(`/auth/verificar-email${query}`, {
      method: 'GET',
      skipAuth: true,
    });
  },

  async me(): Promise<EstabelecimentoResponse> {
    return request<EstabelecimentoResponse>('/auth/me');
  },

  logout(): void {
    clearAuthSession();
  },
};

export const telemetriaApi = {
  async dashboard(): Promise<TelemetriaDashboardResponse> {
    return request<TelemetriaDashboardResponse>('/telemetria/dashboard');
  },
  async grafico(): Promise<TelemetriaPontoGraficoDTO[]> {
    return request<TelemetriaPontoGraficoDTO[]>('/telemetria/grafico');
  },
  async sincronizar(): Promise<LeituraTelemetriaResponse> {
    return request<LeituraTelemetriaResponse>('/telemetria/sincronizar', {
      method: 'POST',
    });
  },
  async historico(estacaoCodigo?: string): Promise<LeituraTelemetriaResponse[]> {
    const query = estacaoCodigo
      ? `?estacaoCodigo=${encodeURIComponent(estacaoCodigo)}`
      : '';
    return request<LeituraTelemetriaResponse[]>(`/telemetria/historico${query}`);
  },
};

export const riscoApi = {
  async atual(localidade?: string): Promise<RiscoResponse> {
    const query = localidade
      ? `?localidade=${encodeURIComponent(localidade)}`
      : '';
    return request<RiscoResponse>(`/risco/atual${query}`);
  },
  async bairros(): Promise<BairroCatalogoDTO[]> {
    return request<BairroCatalogoDTO[]>('/risco/bairros');
  },
};

export const painelApi = {
  async resumo(localidade?: string): Promise<PainelResumoDTO> {
    const query = localidade
      ? `?localidade=${encodeURIComponent(localidade)}`
      : '';
    return request<PainelResumoDTO>(`/painel/resumo${query}`);
  },
};

export const checklistsApi = {
  async listar(estabelecimentoId?: number): Promise<ItemChecklistResponse[]> {
    const query = estabelecimentoId ? `?estabelecimentoId=${estabelecimentoId}` : '';
    return request<ItemChecklistResponse[]>(`/checklists${query}`);
  },
  async buscarPorId(id: number): Promise<ItemChecklistResponse> {
    return request<ItemChecklistResponse>(`/checklists/${id}`);
  },
  async resumo(estabelecimentoId?: number): Promise<ChecklistResumoDTO> {
    const query = estabelecimentoId ? `?estabelecimentoId=${estabelecimentoId}` : '';
    return request<ChecklistResumoDTO>(`/checklists/resumo${query}`);
  },
  async criar(payload: ItemChecklistRequest): Promise<ItemChecklistResponse> {
    return request<ItemChecklistResponse>('/checklists', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async atualizar(
    id: number,
    payload: ItemChecklistRequest
  ): Promise<ItemChecklistResponse> {
    return request<ItemChecklistResponse>(`/checklists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async toggle(id: number): Promise<ItemChecklistResponse> {
    return request<ItemChecklistResponse>(`/checklists/${id}/toggle`, {
      method: 'PATCH',
    });
  },
  async concluir(id: number): Promise<ItemChecklistResponse> {
    return request<ItemChecklistResponse>(`/checklists/${id}/concluir`, {
      method: 'PATCH',
    });
  },
  async gerarPadrao(estabelecimentoId?: number): Promise<ItemChecklistResponse[]> {
    const query = estabelecimentoId ? `?estabelecimentoId=${estabelecimentoId}` : '';
    return request<ItemChecklistResponse[]>(`/checklists/gerar-padrao${query}`, {
      method: 'POST',
    });
  },
  async deletar(id: number): Promise<void> {
    return request<void>(`/checklists/${id}`, { method: 'DELETE' });
  },
};

export const ocorrenciasApi = {
  async listar(status?: StatusOcorrencia): Promise<OcorrenciaResponse[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return request<OcorrenciaResponse[]>(`/ocorrencias${query}`);
  },
  async registrar(payload: OcorrenciaRequest): Promise<OcorrenciaResponse> {
    return request<OcorrenciaResponse>('/ocorrencias', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async buscarPorId(id: number): Promise<OcorrenciaResponse> {
    return request<OcorrenciaResponse>(`/ocorrencias/${id}`);
  },
  async buscarPorProtocolo(protocolo: string): Promise<OcorrenciaResponse> {
    return request<OcorrenciaResponse>(
      `/ocorrencias/protocolo/${encodeURIComponent(protocolo)}`
    );
  },
  async uploadFoto(ocorrenciaId: number, file: File): Promise<unknown> {
    const formData = new FormData();
    formData.append('arquivo', file);
    return request<unknown>(`/ocorrencias/${ocorrenciaId}/fotos`, {
      method: 'POST',
      body: formData,
    });
  },
  fotoUrl(ocorrenciaId: number, fotoId: number, urlFoto?: string): string {
    if (urlFoto) {
      if (urlFoto.startsWith('http://') || urlFoto.startsWith('https://')) {
        return urlFoto;
      }
      return `${API_BASE_URL}/${urlFoto.replace(/^\/+/, '')}`;
    }
    return `${API_BASE_URL}/ocorrencias/${ocorrenciaId}/fotos/${fotoId}`;
  },
};

export const alertasApi = {
  async listar(estabelecimentoId?: number): Promise<AlertaResponse[]> {
    const query = estabelecimentoId ? `?estabelecimentoId=${estabelecimentoId}` : '';
    return request<AlertaResponse[]>(`/alertas${query}`);
  },
  async buscarPorId(id: number): Promise<AlertaResponse> {
    return request<AlertaResponse>(`/alertas/${id}`);
  },
  async enviosWhatsapp(id: number): Promise<EnvioAlertaWhatsappResponse[]> {
    return request<EnvioAlertaWhatsappResponse[]>(`/alertas/${id}/envios-whatsapp`);
  },
  async criar(payload: AlertaRequest): Promise<AlertaResponse> {
    return request<AlertaResponse>('/alertas', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async dispararBairro(payload: AlertaBairroRequest): Promise<AlertaResponse[]> {
    return request<AlertaResponse[]>('/alertas/bairro', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const estabelecimentoApi = {
  async meu(): Promise<EstabelecimentoResponse> {
    return request<EstabelecimentoResponse>('/estabelecimento/me');
  },
  async atualizar(
    id: number,
    payload: EstabelecimentoAtualizacaoRequest
  ): Promise<EstabelecimentoResponse> {
    return request<EstabelecimentoResponse>(`/estabelecimento/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export const itensCriticosApi = {
  async listar(estabelecimentoId?: number): Promise<ItemCriticoResponse[]> {
    const query = estabelecimentoId ? `?estabelecimentoId=${estabelecimentoId}` : '';
    return request<ItemCriticoResponse[]>(`/itens-criticos${query}`);
  },
  async buscarPorId(id: number): Promise<ItemCriticoResponse> {
    return request<ItemCriticoResponse>(`/itens-criticos/${id}`);
  },
  async criar(payload: ItemCriticoRequest): Promise<ItemCriticoResponse> {
    return request<ItemCriticoResponse>('/itens-criticos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async atualizar(
    id: number,
    payload: ItemCriticoRequest
  ): Promise<ItemCriticoResponse> {
    return request<ItemCriticoResponse>(`/itens-criticos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async deletar(id: number): Promise<void> {
    return request<void>(`/itens-criticos/${id}`, { method: 'DELETE' });
  },
};

export const whatsappAdminApi = {
  async status(): Promise<WhatsappStatusResponse> {
    return request<WhatsappStatusResponse>('/admin/whatsapp/status');
  },
  async configuracao(): Promise<WhatsappStatusResponse> {
    return request<WhatsappStatusResponse>('/admin/whatsapp/configuracao');
  },
  async historico(limit = 50): Promise<WhatsappHistoricoResponse[]> {
    return request<WhatsappHistoricoResponse[]>(
      `/admin/whatsapp/history?limit=${limit}`
    );
  },
  async envios(limit = 50): Promise<WhatsappHistoricoResponse[]> {
    return request<WhatsappHistoricoResponse[]>(
      `/admin/whatsapp/envios?limit=${limit}`
    );
  },
  async qr(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/admin/whatsapp/qr');
  },
  async connect(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/admin/whatsapp/connect', {
      method: 'POST',
    });
  },
  async reconnect(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/admin/whatsapp/reconnect', {
      method: 'POST',
    });
  },
  async disconnect(): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>('/admin/whatsapp/disconnect', {
      method: 'POST',
    });
  },
  async test(payload: WhatsappTestRequest): Promise<void> {
    return request<void>('/admin/whatsapp/test', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async settings(ativo: boolean, enviarAlertasAutomaticos: boolean): Promise<WhatsappStatusResponse> {
    return request<WhatsappStatusResponse>(
      `/admin/whatsapp/settings?ativo=${ativo}&enviarAlertasAutomaticos=${enviarAlertasAutomaticos}`,
      { method: 'PATCH' }
    );
  },
};
