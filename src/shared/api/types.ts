export type NivelRisco = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';

export type TipoNegocio =
  | 'MERCADO'
  | 'RESTAURANTE'
  | 'LANCHONETE'
  | 'PADARIA'
  | 'FARMACIA'
  | 'SALAO_BELEZA'
  | 'OFICINA'
  | 'ALIMENTACAO'
  | 'BELEZA'
  | 'VAREJO'
  | 'OUTROS';

export type StatusChecklist = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'NAO_APLICAVEL';
export type PrioridadeChecklist = 'BAIXA' | 'MEDIA' | 'ALTA';

export type StatusOcorrencia =
  | 'RASCUNHO'
  | 'ENVIADA'
  | 'EM_ANALISE'
  | 'FINALIZADA';

export type NivelAlagamento = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO';

export type TipoAlerta =
  | 'ALAGAMENTO'
  | 'MARE_ALTA'
  | 'TEMPESTADE'
  | 'INUNDACAO'
  | 'PREVENTIVO';
export type OrigemAlerta = 'AUTOMATICO' | 'MANUAL';

export type StatusEnvioWhatsapp = 'PENDENTE' | 'PROCESSANDO' | 'ENVIADO' | 'FALHA';

export interface TokenResponse {
  token: string;
  refreshToken: string;
  tipo: string;
  expiraEm: number;
  estabelecimentoId: number | null;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface EstabelecimentoRequest {
  nome: string;
  documento?: string;
  bairro: string;
  responsavel?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  tipoNegocio?: TipoNegocio;
}

export interface RegisterRequest {
  email: string;
  senha: string;
  estabelecimento: EstabelecimentoRequest;
}

export interface EstabelecimentoResponse {
  id: number;
  nome: string;
  documento?: string;
  tipoNegocio?: TipoNegocio;
  responsavel?: string;
  bairro?: string;
  bairroDescricao?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  ativo?: boolean;
  dias?: string[];
  horarioAbertura?: string;
  horarioFechamento?: string;
  itensCriticos?: string[];
}

export interface EstabelecimentoAtualizacaoRequest {
  nome?: string;
  documento?: string;
  responsavel?: string;
  bairro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  tipoNegocio?: TipoNegocio;
  dias?: string[];
  horarioAbertura?: string;
  horarioFechamento?: string;
  itensCriticos?: string[];
}

export interface ItemCriticoResponse {
  id: number;
  nome: string;
  descricao?: string;
  estabelecimentoId?: number;
}

export interface ItemCriticoRequest {
  nome: string;
  descricao?: string;
  estabelecimentoId?: number;
}

export interface TelemetriaDashboardResponse {
  estacaoCodigo: string;
  estacaoNome: string;
  nivelAtual: number;
  nivelFormatado?: string;
  tendencia: string;
  preamarHorario?: string;
  preamarHorarioFormatado?: string;
  preamarNivelPrevisto?: number;
  probabilidadeChuvaAtual?: number;
  chuvaAtual: number;
  chuvaFormatada?: string;
  temperatura: number;
  temperaturaFormatada?: string;
  ventoVelocidade: number;
  ventoFormatado?: string;
  ventoDirecao?: number;
  nivelRisco: NivelRisco | string;
  dataHora?: string;
  unidadeNivel?: string;
  unidadeChuva?: string;
  unidadeTemperatura?: string;
  unidadeVento?: string;
}

export interface TelemetriaPontoGraficoDTO {
  time: string;
  hour?: number;
  dataHora?: string;
  level: number;
  rain: number;
  temperature?: number;
  wind?: number;
  rainProbability?: number;
  tipoRegistro?: 'OBSERVADO' | 'PREVISTO' | 'PREVISAO' | string;
}

export interface LeituraTelemetriaResponse {
  id?: number;
  estacaoCodigo?: string;
  estacaoNome?: string;
  tipoRegistro?: 'OBSERVADO' | 'PREVISAO' | string;
  nivelMare: number;
  precipitacao: number;
  nivelRio?: number;
  chuvaMm?: number;
  temperatura?: number;
  ventoVelocidade?: number;
  ventoDirecao?: number;
  probabilidadeChuva?: number;
  dataHora?: string;
  createdAt?: string;
}

export interface RiscoResponse {
  bairro: string;
  nivelRisco: NivelRisco;
  probabilidadeChuva: number;
  probabilidadePercentual?: number;
  probabilidadeFormatada?: string;
  nivelMarePrevistoMetros: number;
  nivelMareAtualMetros?: number;
  cotaFormatada?: string;
  cotaTransbordamentoMetros: number;
  statusCota?: string;
  descricaoCenario: string;
  horarioPicoPrevisto?: string;
  alertaEmitido?: boolean;
  vaiAlagar?: boolean;
  riscoAlagamentoSimples?: 'IMPROVAVEL' | 'ATENCAO' | 'PROVAVEL' | string;
  vaiChover?: boolean;
  intensidadeChuvaPrevista?: 'SEM_CHUVA' | 'FRACA' | 'MODERADA' | 'FORTE' | string;
  horarioChuvaInicio?: string;
  horarioChuvaFim?: string;
  chuvaComMareAlta?: boolean;
  janelaCriticaInicio?: string;
  janelaCriticaFim?: string;
  mensagemCurta?: string;
}

export interface PainelResumoDTO {
  estabelecimento?: EstabelecimentoResponse | null;
  risco: RiscoResponse;
  telemetriaDashboard: TelemetriaDashboardResponse;
  checklistResumo?: ChecklistResumoDTO | null;
  ultimoAlerta?: AlertaResponse | null;
}

export interface BairroCatalogoDTO {
  codigo: string;
  descricao: string;
  latitude: number;
  longitude: number;
  cotaTransbordamentoMetros: number;
  cotaFormatada?: string;
  bacia: string;
  nivelVulnerabilidade: NivelRisco | string;
}

export interface ItemChecklistResponse {
  id: number;
  estabelecimentoId: number;
  titulo: string;
  descricao?: string;
  categoria?: string;
  status: StatusChecklist;
  prioridade: PrioridadeChecklist;
  ordem?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemChecklistRequest {
  estabelecimentoId: number;
  titulo: string;
  descricao?: string;
  categoria?: string;
  status?: StatusChecklist;
  prioridade?: PrioridadeChecklist;
  ordem?: number;
}

export interface ChecklistResumoDTO {
  totalItens: number;
  concluidos: number;
  pendentes: number;
  percentualConcluido: number;
  progressoFormatado: string;
  prontoParaInundacao: boolean;
}

export interface OcorrenciaFotoResponse {
  id: number;
  ocorrenciaId?: number;
  nomeArquivo?: string;
  contentType?: string;
  tamanhoBytes?: number;
  urlFoto?: string;
  urlDownload?: string;
  createdAt?: string;
}

export interface OcorrenciaResponse {
  id: number;
  protocolo: string;
  estabelecimentoId?: number;
  estabelecimentoNome?: string;
  titulo?: string;
  descricao?: string;
  status: StatusOcorrencia;
  nivelAlagamento?: NivelAlagamento;
  dataOcorrencia: string;
  horaInicio: string;
  horaFim?: string;
  faixaLaminaAgua?: string;
  categoriasDano?: string;
  valorEstimadoPrejuizo?: number;
  horasFechado?: number;
  tamanhoEquipe?: number;
  createdAt?: string;
  updatedAt?: string;
  fotos?: OcorrenciaFotoResponse[];
}

export interface OcorrenciaRequest {
  estabelecimentoId?: number;
  titulo?: string;
  descricao?: string;
  status?: StatusOcorrencia;
  nivelAlagamento?: NivelAlagamento;
  dataOcorrencia: string;
  horaInicio: string;
  horaFim?: string;
  faixaLaminaAgua?: string;
  categoriasDano?: string;
  valorEstimadoPrejuizo?: number;
  horasFechado?: number;
  tamanhoEquipe?: number;
}

export interface AlertaResponse {
  id: number;
  estabelecimentoId?: number;
  estabelecimentoNome?: string;
  nivelRisco: NivelRisco;
  mensagem: string;
  tipoAlerta: TipoAlerta;
  origemAlerta: OrigemAlerta;
  dataEnvio: string;
}

export interface AlertaRequest {
  estabelecimentoId?: number;
  nivelRisco: NivelRisco;
  mensagem: string;
  tipoAlerta?: TipoAlerta;
  origemAlerta?: OrigemAlerta;
}

export interface AlertaBairroRequest {
  bairro: string;
  nivelRisco: NivelRisco;
  mensagem: string;
  tipoAlerta?: TipoAlerta;
  origemAlerta?: OrigemAlerta;
}

export interface WhatsappStatusResponse {
  instancia: string;
  estado: string;
  telefone?: string;
  nome?: string;
  foto?: string;
  ativo: boolean;
  enviarAlertasAutomaticos: boolean;
}

export interface WhatsappHistoricoResponse {
  id: number;
  telefone: string;
  status: string;
  erro?: string;
  criadoEm: string;
  enviadoEm?: string;
  estabelecimentoNome?: string | null;
  responsavel?: string | null;
}

export interface WhatsappTestRequest {
  telefone: string;
  mensagem?: string;
}

export interface EnvioAlertaWhatsappResponse {
  id: number;
  telefoneDestinatario: string;
  statusEnvio: StatusEnvioWhatsapp;
  whatsappMessageId?: string;
  tentativas?: number;
  erroMensagem?: string;
  criadoEm?: string;
  enviadoEm?: string;
}
