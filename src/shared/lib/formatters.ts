import type {
  BairroCatalogoDTO,
  NivelAlagamento,
  NivelRisco,
  StatusOcorrencia,
  TipoNegocio,
} from '../api/types';

export const NEIGHBORHOODS: BairroCatalogoDTO[] = [
  { codigo: 'CAMPINA', descricao: 'Campina', latitude: -1.4531, longitude: -48.4998, cotaTransbordamentoMetros: 2.8, cotaFormatada: '2.80 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'CRITICO' },
  { codigo: 'CIDADE_VELHA', descricao: 'Cidade Velha', latitude: -1.4558, longitude: -48.5044, cotaTransbordamentoMetros: 2.7, cotaFormatada: '2.70 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'CRITICO' },
  { codigo: 'REDUTO', descricao: 'Reduto', latitude: -1.451, longitude: -48.494, cotaTransbordamentoMetros: 2.9, cotaFormatada: '2.90 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'ALTO' },
  { codigo: 'UMARIZAL', descricao: 'Umarizal', latitude: -1.443, longitude: -48.487, cotaTransbordamentoMetros: 3.4, cotaFormatada: '3.40 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'NAZARE', descricao: 'Nazaré', latitude: -1.452, longitude: -48.482, cotaTransbordamentoMetros: 8.5, cotaFormatada: '8.50 m', bacia: 'Tucunduba', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'BATISTA_CAMPOS', descricao: 'Batista Campos', latitude: -1.46, longitude: -48.49, cotaTransbordamentoMetros: 6.0, cotaFormatada: '6.00 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'JURUNAS', descricao: 'Jurunas', latitude: -1.47, longitude: -48.495, cotaTransbordamentoMetros: 2.75, cotaFormatada: '2.75 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'CRITICO' },
  { codigo: 'CONDOR', descricao: 'Condor', latitude: -1.468, longitude: -48.475, cotaTransbordamentoMetros: 2.85, cotaFormatada: '2.85 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'CRITICO' },
  { codigo: 'GUAMA', descricao: 'Guamá', latitude: -1.465, longitude: -48.46, cotaTransbordamentoMetros: 2.9, cotaFormatada: '2.90 m', bacia: 'Tucunduba', nivelVulnerabilidade: 'CRITICO' },
  { codigo: 'CREMACAO', descricao: 'Cremação', latitude: -1.462, longitude: -48.483, cotaTransbordamentoMetros: 3.5, cotaFormatada: '3.50 m', bacia: 'Estrada Nova', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'MARCO', descricao: 'Marco', latitude: -1.433, longitude: -48.465, cotaTransbordamentoMetros: 12.0, cotaFormatada: '12.00 m', bacia: 'Una', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'PEDREIRA', descricao: 'Pedreira', latitude: -1.43, longitude: -48.475, cotaTransbordamentoMetros: 4.5, cotaFormatada: '4.50 m', bacia: 'Una', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'TELEGRAFO', descricao: 'Telégrafo', latitude: -1.435, longitude: -48.49, cotaTransbordamentoMetros: 3.2, cotaFormatada: '3.20 m', bacia: 'Una', nivelVulnerabilidade: 'ALTO' },
  { codigo: 'SAO_BRAS', descricao: 'São Brás', latitude: -1.45, longitude: -48.468, cotaTransbordamentoMetros: 9.0, cotaFormatada: '9.00 m', bacia: 'Tucunduba', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'CANUDOS', descricao: 'Canudos', latitude: -1.453, longitude: -48.457, cotaTransbordamentoMetros: 5.5, cotaFormatada: '5.50 m', bacia: 'Tucunduba', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'FATIMA', descricao: 'Fátima', latitude: -1.445, longitude: -48.477, cotaTransbordamentoMetros: 6.0, cotaFormatada: '6.00 m', bacia: 'Una', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'SACRAMENTA', descricao: 'Sacramenta', latitude: -1.425, longitude: -48.485, cotaTransbordamentoMetros: 3.3, cotaFormatada: '3.30 m', bacia: 'Una', nivelVulnerabilidade: 'ALTO' },
  { codigo: 'BARREIRO', descricao: 'Barreiro', latitude: -1.415, longitude: -48.49, cotaTransbordamentoMetros: 3.1, cotaFormatada: '3.10 m', bacia: 'Una', nivelVulnerabilidade: 'ALTO' },
  { codigo: 'MARAMBAIA', descricao: 'Marambaia', latitude: -1.395, longitude: -48.445, cotaTransbordamentoMetros: 8.0, cotaFormatada: '8.00 m', bacia: 'Una', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'CASTANHEIRA', descricao: 'Castanheira', latitude: -1.39, longitude: -48.435, cotaTransbordamentoMetros: 9.0, cotaFormatada: '9.00 m', bacia: 'Murucutu', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'VAL_DE_CAES', descricao: 'Val-de-Cães', latitude: -1.398, longitude: -48.48, cotaTransbordamentoMetros: 3.5, cotaFormatada: '3.50 m', bacia: 'Una', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'SOUSA', descricao: 'Sousa', latitude: -1.412, longitude: -48.442, cotaTransbordamentoMetros: 7.0, cotaFormatada: '7.00 m', bacia: 'Murucutu', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'MANGUEIRAO', descricao: 'Mangueirão', latitude: -1.375, longitude: -48.44, cotaTransbordamentoMetros: 8.0, cotaFormatada: '8.00 m', bacia: 'Una', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'COQUEIRO', descricao: 'Coqueiro', latitude: -1.345, longitude: -48.43, cotaTransbordamentoMetros: 7.5, cotaFormatada: '7.50 m', bacia: 'Maguari', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'PARQUE_VERDE', descricao: 'Parque Verde', latitude: -1.365, longitude: -48.455, cotaTransbordamentoMetros: 8.0, cotaFormatada: '8.00 m', bacia: 'Una', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'BENGUI', descricao: 'Benguí', latitude: -1.37, longitude: -48.468, cotaTransbordamentoMetros: 6.0, cotaFormatada: '6.00 m', bacia: 'Una', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'TENONE', descricao: 'Tenoné', latitude: -1.315, longitude: -48.46, cotaTransbordamentoMetros: 6.5, cotaFormatada: '6.50 m', bacia: 'Maguari', nivelVulnerabilidade: 'BAIXO' },
  { codigo: 'ICOARACI', descricao: 'Icoaraci', latitude: -1.298, longitude: -48.48, cotaTransbordamentoMetros: 3.1, cotaFormatada: '3.10 m', bacia: 'Maguari', nivelVulnerabilidade: 'ALTO' },
  { codigo: 'OUTEIRO', descricao: 'Outeiro', latitude: -1.24, longitude: -48.445, cotaTransbordamentoMetros: 3.3, cotaFormatada: '3.30 m', bacia: 'Ilhas', nivelVulnerabilidade: 'MEDIO' },
  { codigo: 'MOSQUEIRO', descricao: 'Mosqueiro', latitude: -1.135, longitude: -48.41, cotaTransbordamentoMetros: 3.4, cotaFormatada: '3.40 m', bacia: 'Ilhas', nivelVulnerabilidade: 'MEDIO' },
];

export const BUSINESS_TYPES: { value: TipoNegocio; label: string }[] = [
  { value: 'MERCADO', label: 'Mercado / Mercearia' },
  { value: 'RESTAURANTE', label: 'Restaurante' },
  { value: 'LANCHONETE', label: 'Lanchonete / Tacacazeira' },
  { value: 'PADARIA', label: 'Padaria / Confeitaria' },
  { value: 'FARMACIA', label: 'Farmácia / Drogaria' },
  { value: 'SALAO_BELEZA', label: 'Salão de Beleza / Barbearia' },
  { value: 'OFICINA', label: 'Oficina Mecânica / Autopeças' },
  { value: 'ALIMENTACAO', label: 'Alimentação & Bebidas' },
  { value: 'VAREJO', label: 'Comércio Varejista' },
  { value: 'BELEZA', label: 'Estética & Cuidados' },
  { value: 'OUTROS', label: 'Outros Segmentos' },
];

export function formatMeters(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

export function formatRain(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mm/h`;
}

export function formatCurrency(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Belem',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  if (/^\d{2}:\d{2}/.test(iso)) return iso.slice(0, 5);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Belem',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function normalizeRiskLevel(value?: string | null): NivelRisco {
  const upper = (value ?? '').toUpperCase();
  if (upper.includes('CRIT')) return 'CRITICO';
  if (upper.includes('ALT')) return 'ALTO';
  if (upper.includes('MED')) return 'MEDIO';
  return 'BAIXO';
}

export function riskLabel(value?: string | null): string {
  const nivel = normalizeRiskLevel(value);
  switch (nivel) {
    case 'CRITICO':
      return 'Crítico / Calamidade';
    case 'ALTO':
      return 'Alto / Transbordamento';
    case 'MEDIO':
      return 'Médio / Atenção';
    default:
      return 'Baixo / Seguro';
  }
}

export function occurrenceStatusLabel(status: StatusOcorrencia): string {
  switch (status) {
    case 'ENVIADA':
      return 'Enviada';
    case 'EM_ANALISE':
      return 'Em análise';
    case 'FINALIZADA':
      return 'Finalizada';
    default:
      return 'Rascunho';
  }
}

export function floodLevelLabel(nivel?: NivelAlagamento | string | null): string {
  switch ((nivel ?? '').toUpperCase()) {
    case 'CRITICO':
      return 'Crítico';
    case 'GRAVE':
      return 'Grave';
    case 'MODERADO':
      return 'Moderado';
    case 'LEVE':
      return 'Leve';
    default:
      return nivel || '—';
  }
}

export function riskDotClass(value?: string | null): string {
  switch (normalizeRiskLevel(value)) {
    case 'CRITICO':
      return 'bg-[var(--sys-dot-crit)] is-alert';
    case 'ALTO':
      return 'bg-[var(--sys-dot-high)] is-alert';
    case 'MEDIO':
      return 'bg-[var(--sys-dot-warn)]';
    default:
      return 'bg-[var(--sys-dot-ok)]';
  }
}

export function riskTextClass(value?: string | null): string {
  switch (normalizeRiskLevel(value)) {
    case 'CRITICO':
      return 'text-[var(--sys-crit-text)]';
    case 'ALTO':
      return 'text-[var(--sys-high-text)]';
    case 'MEDIO':
      return 'text-[var(--sys-warn-text)]';
    default:
      return 'text-[var(--sys-ok-text)]';
  }
}

export function simpleFloodVerdictLabel(verdict?: string | null): string {
  switch ((verdict ?? '').toUpperCase()) {
    case 'PROVAVEL':
      return 'Provável';
    case 'ATENCAO':
      return 'Atenção';
    default:
      return 'Improvável';
  }
}

export function isAdminRole(role?: string | null): boolean {
  const upper = (role ?? '').trim().toUpperCase();
  return upper === 'ADMIN' || upper === 'SUPERADMIN' || upper === 'ROLE_ADMIN';
}

export function formatDateBR(isoDate?: string | null): string {
  if (!isoDate) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim());
  if (match) return `${match[3]}/${match[2]}/${match[1]}`;
  const dt = new Date(isoDate);
  if (Number.isNaN(dt.getTime())) return isoDate;
  return dt.toLocaleDateString('pt-BR', { timeZone: 'America/Belem' });
}

export function onlyDigits(raw?: string | null, maxLen?: number): string {
  const digits = (raw ?? '').replace(/\D/g, '');
  return maxLen ? digits.slice(0, maxLen) : digits;
}

export function normalizeBrPhoneDigits(raw?: string | null): string {
  let digits = onlyDigits(raw);
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 11);
}

export function formatPhoneInput(raw?: string | null): string {
  const d = normalizeBrPhoneDigits(raw);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
}

export function isValidPhoneBR(raw?: string | null): boolean {
  const d = normalizeBrPhoneDigits(raw);
  return d.length === 0 || d.length === 10 || d.length === 11;
}

export function formatCepInput(raw?: string | null): string {
  const d = onlyDigits(raw, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}

export function isValidCep(raw?: string | null): boolean {
  const d = onlyDigits(raw);
  return d.length === 0 || d.length === 8;
}

export function formatCpfCnpjInput(raw?: string | null): string {
  const d = onlyDigits(raw, 14);
  if (!d) return '';
  if (d.length <= 11) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  }
  if (d.length <= 12) {
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}`;
  }
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

export function isValidCpfCnpj(raw?: string | null): boolean {
  const d = onlyDigits(raw);
  return d.length === 0 || d.length === 11 || d.length === 14;
}

export const STANDARD_TITLES_BY_SEGMENT: Record<TipoNegocio, readonly string[]> = {
  MERCADO: [
    'Elevar freezers e refrigeradores',
    'Remover mercadorias das prateleiras baixas',
    'Desligar disjuntores de circuitos baixos',
    'Instalar comportas de contenção nas portas',
    'Realizar backup do PDV e arquivar documentos',
  ],
  VAREJO: [
    'Elevar freezers e refrigeradores',
    'Remover mercadorias das prateleiras baixas',
    'Desligar disjuntores de circuitos baixos',
    'Instalar comportas de contenção nas portas',
    'Realizar backup do PDV e arquivar documentos',
  ],
  PADARIA: [
    'Elevar sacarias de farinha e insumos secos',
    'Desconectar fornos e masseiras industriais',
    'Bloquear registro central de gás GLP',
    'Proteger vitrines e balcões de atendimento',
  ],
  FARMACIA: [
    'Realocar medicamentos das gavetas e prateleiras baixas',
    'Proteger refrigerador de vacinas e termolábeis',
    'Proteger livros de registro e receitas retidas',
    'Desconectar computadores e nobreaks de solo',
  ],
  RESTAURANTE: [
    'Trancar câmaras frias e proteger motores de solo',
    'Vedar ralos de chão e caixas de gordura',
    'Suspender mesas, cadeiras e estoque seco',
    'Fechar válvula principal de gás industrial',
  ],
  LANCHONETE: [
    'Trancar câmaras frias e proteger motores de solo',
    'Vedar ralos de chão e caixas de gordura',
    'Suspender mesas, cadeiras e estoque seco',
    'Fechar válvula principal de gás industrial',
  ],
  ALIMENTACAO: [
    'Trancar câmaras frias e proteger motores de solo',
    'Vedar ralos de chão e caixas de gordura',
    'Suspender mesas, cadeiras e estoque seco',
    'Fechar válvula principal de gás industrial',
  ],
  OFICINA: [
    'Elevar veículos e peças nos elevadores',
    'Lacrar e elevar tambores de óleo e solventes',
    'Recolher ferramentas pneumáticas e elétricas',
  ],
  SALAO_BELEZA: [
    'Desconectar secadores, pranchas e autoclaves',
    'Elevar cosméticos e produtos químicos',
    'Proteger bases de cadeiras hidráulicas e lavatórios',
  ],
  BELEZA: [
    'Desconectar secadores, pranchas e autoclaves',
    'Elevar cosméticos e produtos químicos',
    'Proteger bases de cadeiras hidráulicas e lavatórios',
  ],
  OUTROS: [
    'Instalar barreiras de contenção nas entradas',
    'Elevar equipamentos eletrônicos e computadores',
    'Desligar disjuntor de energia geral',
    'Acondicionar documentos e valores em local estanque',
  ],
};
