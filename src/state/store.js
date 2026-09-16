import { createContext, useContext } from 'react';

export const NEIGHBORHOODS = ['Campina', 'Marco', 'Nazaré', 'Umarizal'];

// Estabelecimento de demonstração, usado até alguém se cadastrar ou salvar o próprio ponto.
export const DEMO_STORE = {
  name: 'Empório da Maria',
  owner: 'Maria',
  cnpj: '',
  email: '',
  neighborhood: 'Umarizal',
  street: 'Travessa Visconde de Souza Franco (Doca)',
  number: '742',
  type: 'Mercado',
  days: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  opening: '07:30',
  closing: '19:00',
  criticalItems: ['Freezer no chão', 'Estoque de secos', 'Caixa registradora / CPU', 'Fiação baixa'],
};

export const StoreContext = createContext(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore precisa estar dentro de <StoreProvider>.');
  return context;
}
