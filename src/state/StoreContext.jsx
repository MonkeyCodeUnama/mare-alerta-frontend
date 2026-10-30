import { useCallback, useEffect, useMemo, useState } from 'react';
import { request, jsonBody } from '../api/client';
import { storeFromApi } from '../api/adapters';
import { EMPTY_STORE, StoreContext } from './store';

const SESSION_KEY = 'mare-alerta-session';

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}

export function StoreProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [store, setStore] = useState(EMPTY_STORE);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const saveSession = useCallback((result) => {
    const next = { token: result.token, establishmentId: result.estabelecimentoId, email: result.email };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setSession(next);
    setStore(EMPTY_STORE);
    setProfileLoaded(false);
    return next;
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await request('/auth/login', { method: 'POST', body: jsonBody({ email, senha: password }) });
    saveSession({ ...result, email: result.email || email });
  }, [saveSession]);

  const register = useCallback(async (credentials, business) => {
    const result = await request('/auth/registro', {
      method: 'POST',
      body: jsonBody({
        email: credentials.email,
        senha: credentials.password,
        estabelecimento: {
          nome: business.name.trim(), documento: business.cnpj.replace(/\D/g, ''),
          bairro: business.neighborhood, tipoNegocio: business.type || 'OUTROS',
        },
      }),
    });
    saveSession({ ...result, email: result.email || credentials.email });
  }, [saveSession]);

  const loadProfile = useCallback(async () => {
    if (!session?.token) return null;
    const establishmentId = session?.establishmentId;
    if (!establishmentId) throw new Error('Sessão inválida: estabelecimento não identificado.');
    const profile = await request(`/estabelecimento/${establishmentId}`, { token: session.token });
    const next = storeFromApi(profile, session.email);
    setStore(next);
    setProfileLoaded(true);
    return next;
  }, [session]);

  const updateStore = useCallback(async (changes) => {
    if (!session?.token || !store.id) throw new Error('Sua sessão não está pronta para salvar o estabelecimento.');
    const updated = await request(`/estabelecimento/${store.id}`, {
      method: 'PUT', token: session.token,
      body: jsonBody({
        nome: changes.name.trim(), documento: changes.cnpj.replace(/\D/g, ''), responsavel: changes.owner,
        bairro: changes.neighborhood, logradouro: changes.street, numero: changes.number,
        complemento: changes.complemento, cep: changes.cep, municipio: changes.municipio || 'Belém',
        uf: changes.uf || 'PA', telefone: changes.telefone, tipoNegocio: changes.type,
        dias: changes.days, horarioAbertura: changes.opening, horarioFechamento: changes.closing,
        itensCriticos: changes.criticalItems,
      }),
    });
    const next = storeFromApi(updated, session.email);
    setStore(next);
    return next;
  }, [session, store.id]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setStore(EMPTY_STORE);
    setProfileLoaded(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mare-alerta-unauthorized', logout);
    return () => window.removeEventListener('mare-alerta-unauthorized', logout);
  }, [logout]);

  const value = useMemo(() => ({
    session, authenticated: Boolean(session?.token), store, profileLoaded,
    login, register, loadProfile, updateStore, logout,
  }), [session, store, profileLoaded, login, register, loadProfile, updateStore, logout]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
