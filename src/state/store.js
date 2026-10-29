import { createContext, useContext } from 'react';

export const NEIGHBORHOODS = [
  ['CAMPINA', 'Campina'], ['CIDADE_VELHA', 'Cidade Velha'], ['REDUTO', 'Reduto'], ['UMARIZAL', 'Umarizal'],
  ['NAZARE', 'Nazaré'], ['BATISTA_CAMPOS', 'Batista Campos'], ['JURUNAS', 'Jurunas'], ['CONDOR', 'Condor'],
  ['GUAMA', 'Guamá'], ['CREMACAO', 'Cremação'], ['MARCO', 'Marco'], ['PEDREIRA', 'Pedreira'],
  ['TELEGRAFO', 'Telégrafo'], ['SAO_BRAS', 'São Brás'], ['CANUDOS', 'Canudos'], ['FATIMA', 'Fátima'],
  ['SACRAMENTA', 'Sacramenta'], ['BARREIRO', 'Barreiro'], ['MARAMBAIA', 'Marambaia'], ['CASTANHEIRA', 'Castanheira'],
  ['VAL_DE_CAES', 'Val-de-Cães'], ['SOUSA', 'Souza'], ['MANGUEIRAO', 'Mangueirão'], ['COQUEIRO', 'Coqueiro'],
  ['PARQUE_VERDE', 'Parque Verde'], ['BENGUI', 'Bengui'], ['TENONE', 'Tenoné'], ['ICOARACI', 'Icoaraci'],
  ['OUTEIRO', 'Outeiro'], ['MOSQUEIRO', 'Mosqueiro'],
];

export const BUSINESS_TYPES = [
  ['MERCADO', 'Mercado'], ['RESTAURANTE', 'Restaurante'], ['LANCHONETE', 'Lanchonete'], ['PADARIA', 'Padaria'],
  ['FARMACIA', 'Farmácia'], ['SALAO_BELEZA', 'Salão de beleza'], ['OFICINA', 'Oficina'],
  ['ALIMENTACAO', 'Alimentação'], ['BELEZA', 'Beleza'], ['VAREJO', 'Loja / Varejo'], ['OUTROS', 'Outros'],
];

export const neighborhoodLabel = (value) => NEIGHBORHOODS.find(([code]) => code === value)?.[1] || value || '';

export const EMPTY_STORE = {
  name: '', owner: '', cnpj: '', email: '', neighborhood: '', street: '', number: '',
  type: '', days: [], opening: '', closing: '', criticalItems: [],
};

export const StoreContext = createContext(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore precisa estar dentro de <StoreProvider>.');
  return context;
}
