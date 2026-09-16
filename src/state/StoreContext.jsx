import { useCallback, useMemo, useState } from 'react';
import { DEMO_STORE, StoreContext } from './store';

const STORAGE_KEY = 'mare-alerta-store';

function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? { ...DEMO_STORE, ...saved } : DEMO_STORE;
  } catch {
    return DEMO_STORE;
  }
}

// Sem backend, o estabelecimento vive no navegador: cadastro e "Meu Estabelecimento" gravam aqui
// e as demais telas leem daqui.
export function StoreProvider({ children }) {
  const [store, setStore] = useState(readStored);

  const updateStore = useCallback((changes) => {
    setStore((current) => {
      const next = { ...current, ...changes };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* sem armazenamento: vale só nesta sessão */ }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ store, updateStore, isDemo: store.name === DEMO_STORE.name }), [store, updateStore]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
