import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CloudRain,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Waves,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  alertasApi,
  checklistsApi,
  estabelecimentoApi,
  getStoredSession,
  hasRealAuthToken,
  ocorrenciasApi,
  painelApi,
  riscoApi,
  telemetriaApi,
} from '../../shared/api/client';
import type {
  AlertaResponse,
  ChecklistResumoDTO,
  EstabelecimentoResponse,
  RiscoResponse,
  TelemetriaDashboardResponse,
  TelemetriaPontoGraficoDTO,
} from '../../shared/api/types';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import {
  NEIGHBORHOODS,
  formatDateTime,
  formatMeters,
  formatRain,
  formatTime,
  isAdminRole,
  normalizeRiskLevel,
  riskDotClass,
  riskTextClass,
  simpleFloodVerdictLabel,
} from '../../shared/lib/formatters';
import { useChartTheme } from './chartColors';

const NEIGHBORHOOD_SELECT_OPTIONS: readonly CustomSelectOption[] = NEIGHBORHOODS.map((b) => ({
  value: b.codigo,
  label: b.descricao,
}));

function tideSafetyMeta(
  peakMeters?: number | null,
  cotaLine?: number | null
): { label: string; dotColor: string; textClass: string } {
  const level = peakMeters ?? 0;
  const limit = cotaLine ?? 3.0;
  if (level >= limit + 0.45) {
    return {
      label: 'Acima da cota segura',
      dotColor: 'var(--sys-dot-crit)',
      textClass: 'text-[var(--sys-crit-text)]',
    };
  }
  if (level >= limit) {
    return {
      label: 'Acima da cota segura',
      dotColor: 'var(--sys-dot-high)',
      textClass: 'text-[var(--sys-high-text)]',
    };
  }
  if (level >= limit - 0.3) {
    return {
      label: 'Nível de atenção',
      dotColor: 'var(--sys-dot-warn)',
      textClass: 'text-[var(--sys-ink-2)]',
    };
  }
  return {
    label: 'Nível seguro',
    dotColor: 'var(--sys-dot-ok)',
    textClass: 'text-[var(--sys-ink-2)]',
  };
}

function floodHeadline(risco: RiscoResponse): {
  title: string;
  verdictText: string;
} {
  const level = normalizeRiskLevel(risco.nivelRisco);
  const simple = (risco.riscoAlagamentoSimples || '').toUpperCase();
  const vaiAlagar = Boolean(risco.vaiAlagar) || simple === 'PROVAVEL';

  if (vaiAlagar || level === 'CRITICO') {
    return {
      title: 'Risco provável de alagamento',
      verdictText: 'Risco provável',
    };
  }
  if (level === 'ALTO' || level === 'MEDIO' || simple === 'ATENCAO') {
    return {
      title: risco.chuvaComMareAlta
        ? 'Atenção para chuva com maré alta'
        : 'Acompanhe a subida da maré',
      verdictText: 'Atenção',
    };
  }
  return {
    title: 'Operação segura neste turno',
    verdictText: simpleFloodVerdictLabel(risco.riscoAlagamentoSimples),
  };
}

interface MiniTooltipProps {
  active?: boolean;
  payload?: Array<{ payload?: TelemetriaPontoGraficoDTO }>;
}

function MiniChartTooltip({ active, payload }: MiniTooltipProps) {
  if (!active || !payload?.length || !payload[0]?.payload) return null;
  const pt = payload[0].payload;
  return (
    <div className="rounded-[10px] bg-[var(--sys-card-bg)] shadow-[0_8px_24px_oklch(12%_0.025_245/0.12)] px-3 py-2 text-xs space-y-1">
      <div className="font-mono-data font-semibold text-[var(--sys-ink)]">{pt.time}</div>
      <div className="flex items-center justify-between gap-3 font-mono-data text-[11px]">
        <span className="text-[var(--sys-ink-2)]">Maré</span>
        <strong className="text-[var(--sys-ink)]">{formatMeters(pt.level)}</strong>
      </div>
      <div className="flex items-center justify-between gap-3 font-mono-data text-[11px]">
        <span className="text-[var(--sys-ink-2)]">Chuva</span>
        <strong className="text-[var(--sys-ink)]">
          {formatRain(pt.rain)}
          {pt.rainProbability !== undefined ? ` · ${pt.rainProbability}%` : ''}
        </strong>
      </div>
    </div>
  );
}

export default function DashboardGrid() {
  const palette = useChartTheme();
  const [dashboard, setDashboard] = useState<TelemetriaDashboardResponse | null>(null);
  const [chartPoints, setChartPoints] = useState<TelemetriaPontoGraficoDTO[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<string>('CAMPINA');
  const [homeBairro, setHomeBairro] = useState<string>('CAMPINA');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState<boolean>(false);
  const [risco, setRisco] = useState<RiscoResponse | null>(null);
  const [checklist, setChecklist] = useState<ChecklistResumoDTO | null>(null);
  const [establishment, setEstablishment] = useState<EstabelecimentoResponse | null>(null);
  const [latestAlert, setLatestAlert] = useState<AlertaResponse | null>(null);
  const [occurrencesCount, setOccurrencesCount] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async (targetBairro?: string) => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    let hasError = false;
    let chosenBairro = targetBairro;

    const [resumoRes, graficoRes, occRes] = await Promise.allSettled([
      painelApi.resumo(targetBairro),
      telemetriaApi.grafico(),
      ocorrenciasApi.listar(),
    ]);

    if (resumoRes.status === 'fulfilled') {
      const resumo = resumoRes.value;
      if (resumo.telemetriaDashboard) setDashboard(resumo.telemetriaDashboard);
      if (resumo.risco) setRisco(resumo.risco);
      if (resumo.estabelecimento) {
        setEstablishment(resumo.estabelecimento);
        if (resumo.estabelecimento.bairro) {
          setHomeBairro(resumo.estabelecimento.bairro);
          if (!chosenBairro) {
            chosenBairro = resumo.estabelecimento.bairro;
            setSelectedBairro(chosenBairro);
          }
        }
      }
      if (resumo.checklistResumo) setChecklist(resumo.checklistResumo);
      setLatestAlert(resumo.ultimoAlerta ?? null);
    } else {
      const [dashRes, meuRes, chkRes, alertRes] = await Promise.allSettled([
        telemetriaApi.dashboard(),
        estabelecimentoApi.meu(),
        checklistsApi.resumo(),
        alertasApi.listar(),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashboard(dashRes.value);
      } else {
        hasError = true;
      }

      if (meuRes.status === 'fulfilled') {
        setEstablishment(meuRes.value);
        if (meuRes.value.bairro) {
          setHomeBairro(meuRes.value.bairro);
          if (!chosenBairro) {
            chosenBairro = meuRes.value.bairro;
            setSelectedBairro(chosenBairro);
          }
        }
      }

      if (chkRes.status === 'fulfilled') setChecklist(chkRes.value);
      if (alertRes.status === 'fulfilled' && alertRes.value.length > 0) {
        setLatestAlert(alertRes.value[0]);
      }

      const bairroLookup = chosenBairro || 'CAMPINA';
      try {
        setRisco(await riscoApi.atual(bairroLookup));
      } catch {
        hasError = true;
      }
    }

    if (graficoRes.status === 'fulfilled' && graficoRes.value.length > 0) {
      setChartPoints(graficoRes.value);
    }

    if (occRes.status === 'fulfilled') {
      setOccurrencesCount(occRes.value.length);
    }

    setApiError(
      hasError ? 'Não foi possível carregar todos os dados da API agora.' : null
    );
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    let active = true;
    const syncAndLoad = () => {
      if (!active) return;
      if (!hasRealAuthToken()) {
        setLoading(false);
        return;
      }
      setIsAdmin(isAdminRole(getStoredSession()?.role));
      void loadData();
    };
    void Promise.resolve().then(syncAndLoad);
    window.addEventListener('auth-session-changed', syncAndLoad);
    return () => {
      active = false;
      window.removeEventListener('auth-session-changed', syncAndLoad);
    };
  }, [loadData]);

  async function handleSelectBairro(codigo: string) {
    setSelectedBairro(codigo);
    try {
      const nextRisk = await riscoApi.atual(codigo);
      setRisco(nextRisk);
      setApiError(null);
    } catch {
      setApiError('Falha ao consultar o risco do bairro selecionado.');
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await loadData(selectedBairro);
  }

  const futurePoints = chartPoints.filter(
    (pt) => pt.tipoRegistro === 'PREVISAO' || pt.tipoRegistro === 'PREVISTO'
  );
  const upcomingWindow =
    chartPoints.length <= 12
      ? chartPoints
      : futurePoints.length >= 8
        ? futurePoints.slice(0, 12)
        : chartPoints.slice(Math.max(0, chartPoints.length - 12));

  const rising = dashboard?.tendencia?.toUpperCase().includes('SUB');
  const peakMeters =
    risco?.nivelMarePrevistoMetros ??
    dashboard?.preamarNivelPrevisto ??
    dashboard?.nivelAtual;
  const peakTimeStr =
    formatTime(risco?.horarioPicoPrevisto) !== '—'
      ? formatTime(risco?.horarioPicoPrevisto)
      : dashboard?.preamarHorarioFormatado || formatTime(dashboard?.preamarHorario) || '—';

  const rainPct = useMemo(() => {
    if (risco?.probabilidadePercentual !== undefined && risco.probabilidadePercentual !== null) {
      return Math.round(risco.probabilidadePercentual);
    }
    if (risco?.probabilidadeChuva !== undefined && risco.probabilidadeChuva !== null) {
      return risco.probabilidadeChuva <= 1
        ? Math.round(risco.probabilidadeChuva * 100)
        : Math.round(risco.probabilidadeChuva);
    }
    return dashboard?.probabilidadeChuvaAtual ?? 0;
  }, [risco, dashboard?.probabilidadeChuvaAtual]);

  const willRain =
    risco?.vaiChover !== undefined
      ? risco.vaiChover
      : rainPct >= 50 || (dashboard?.chuvaAtual ?? 0) >= 0.5;

  const verdict = risco
    ? floodHeadline(risco)
    : {
        title: loading
          ? 'Carregando informações do seu ponto comercial...'
          : 'Previsão temporariamente indisponível',
        verdictText: loading ? 'Carregando informações...' : 'Indisponível',
      };
  const currentDistrict = useMemo(
    () =>
      NEIGHBORHOODS.find(
        (b) =>
          b.codigo.toUpperCase() === selectedBairro.toUpperCase() ||
          b.descricao.toUpperCase() === (risco?.bairro || '').toUpperCase()
      ),
    [selectedBairro, risco?.bairro]
  );

  const displayBairroName = currentDistrict?.descricao || risco?.bairro || selectedBairro;
  const homeDistrictName =
    NEIGHBORHOODS.find((b) => b.codigo.toUpperCase() === homeBairro.toUpperCase())?.descricao ||
    homeBairro;
  const isCustomDistrict = selectedBairro.toUpperCase() !== homeBairro.toUpperCase();

  const operationHours =
    establishment?.horarioAbertura && establishment?.horarioFechamento
      ? `${establishment.horarioAbertura.slice(0, 5)} – ${establishment.horarioFechamento.slice(0, 5)}`
      : null;

  const cotaLine =
    risco && risco.cotaTransbordamentoMetros > 0 && risco.cotaTransbordamentoMetros < 4.2
      ? risco.cotaTransbordamentoMetros
      : null;

  const tideSafety = tideSafetyMeta(peakMeters, cotaLine);

  const tideTicks = useMemo(() => {
    if (upcomingWindow.length <= 6) return upcomingWindow.map((p) => p.time);
    const step = Math.max(1, Math.floor(upcomingWindow.length / 5));
    return upcomingWindow.filter((_, idx) => idx % step === 0).map((p) => p.time);
  }, [upcomingWindow]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <div className="min-w-0 flex flex-wrap items-baseline gap-2.5">
          <h1 className="font-editorial text-2xl sm:text-[32px] leading-tight font-normal tracking-tight text-[var(--sys-ink)] break-words">
            {establishment ? establishment.nome : 'Painel'}
          </h1>
          <span className="text-xs font-medium text-[var(--sys-ink-3)]">{displayBairroName}</span>
          {apiError && (
            <span className="sys-indicator text-xs text-[var(--sys-warn-text)]">
              <span className="sys-indicator-dot bg-[var(--sys-dot-warn)]" />
              {apiError}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="sys-btn-secondary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando' : 'Atualizar'}</span>
          </button>

          <a href="/ocorrencias" className="sys-btn-primary">
            <Plus className="w-3.5 h-3.5" />
            <span>Nova ocorrência</span>
          </a>
        </div>
      </header>

      {isAdmin ? (
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full sm:w-64 shrink-0">
            <CustomSelect
              ariaLabel="Bairro monitorado"
              size="sm"
              value={selectedBairro}
              onChange={(val) => void handleSelectBairro(val)}
              options={NEIGHBORHOOD_SELECT_OPTIONS}
              leftIcon={<MapPin className="w-3.5 h-3.5" />}
            />
          </div>
        </section>
      ) : (
        <section className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--sys-ink-2)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--sys-link,var(--sys-brand))] shrink-0" />
            <strong className="font-medium text-[var(--sys-ink)]">{displayBairroName}</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isCustomDistrict && (
              <button
                type="button"
                onClick={() => {
                  setShowDistrictPicker(false);
                  void handleSelectBairro(homeBairro);
                }}
                className="text-xs font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline cursor-pointer"
              >
                Voltar · {homeDistrictName}
              </button>
            )}

            {showDistrictPicker ? (
              <div className="w-full sm:w-56">
                <CustomSelect
                  ariaLabel="Trocar bairro"
                  size="sm"
                  alignRight
                  value={selectedBairro}
                  onChange={(val) => {
                    setShowDistrictPicker(false);
                    void handleSelectBairro(val);
                  }}
                  options={NEIGHBORHOOD_SELECT_OPTIONS}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDistrictPicker(true)}
                className="text-xs font-medium text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)] bg-[var(--sys-card-bg)] hover:bg-[var(--sys-sheet-subtle)] px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer"
              >
                Trocar bairro
              </button>
            )}
          </div>
        </section>
      )}

      {/* Veredito direto sem parágrafos repetitivos */}
      <section className="sys-box p-5 sm:p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="sys-indicator">
            <span className={`sys-indicator-dot ${riskDotClass(risco?.nivelRisco)}`} />
            <span className={`font-medium ${riskTextClass(risco?.nivelRisco)}`}>
              {verdict.verdictText}
            </span>
          </span>
        </div>

        <h2 className="font-editorial text-2xl sm:text-[28px] leading-snug font-normal text-[var(--sys-ink)]">
          {verdict.title}
        </h2>
      </section>

      {/* 3 Métricas Enxutas */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sys-box p-5 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs text-[var(--sys-ink-2)]">
            <span className="font-medium">Chuva</span>
            <CloudRain className="w-4 h-4 text-[var(--sys-link,var(--sys-brand))] shrink-0" />
          </div>
          <div className="space-y-1">
            <strong className="block font-editorial text-[30px] xl:text-4xl font-normal text-[var(--sys-ink)] tabular-nums leading-none whitespace-nowrap">
              {rainPct}%
            </strong>
            <span className="block text-xs font-medium text-[var(--sys-ink-2)]">
              {willRain ? 'Vai chover' : 'Baixa chance'}
            </span>
          </div>
        </div>

        <div className="sys-box p-5 space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-xs text-[var(--sys-ink-2)]">
            <span className="font-medium">Maré</span>
            <Waves className="w-4 h-4 text-[var(--sys-link,var(--sys-brand))] shrink-0" />
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <strong className="font-editorial text-[30px] xl:text-4xl font-normal text-[var(--sys-ink)] tabular-nums leading-none whitespace-nowrap">
                {formatMeters(peakMeters)}
              </strong>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sys-ink-2)] shrink-0 whitespace-nowrap">
                {rising ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {peakTimeStr}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${tideSafety.textClass}`}>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: tideSafety.dotColor }}
              />
              {tideSafety.label}
            </span>
          </div>
        </div>

        <div className="sys-box p-5 space-y-2 min-w-0">
          <div className="flex items-center justify-between text-xs text-[var(--sys-ink-2)]">
            <span className="font-medium">Checklist</span>
            <ShieldCheck className="w-4 h-4 text-[var(--sys-link,var(--sys-brand))] shrink-0" />
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <strong className="font-editorial text-[30px] xl:text-4xl font-normal text-[var(--sys-ink)] tabular-nums leading-none whitespace-nowrap">
              {loading && !checklist ? '—' : checklist ? `${checklist.percentualConcluido}%` : '0%'}
            </strong>
            <a
              href="/checklist"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline shrink-0"
            >
              Abrir <ArrowRight className="w-3 h-3" />
            </a>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[var(--sys-sheet-muted)] overflow-hidden">
            <div
              className="h-full bg-[var(--sys-brand)] transition-all duration-300"
              style={{ width: `${checklist?.percentualConcluido ?? 0}%` }}
            />
          </div>
        </div>
      </section>

      {/* Gráfico com Zonas (Faixa Segura vs Área de Risco) + Operação */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 sys-box p-5 space-y-3.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[15px] font-medium text-[var(--sys-ink)]">
              Próximas horas
            </h2>
            <a
              href="/telemetria"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline shrink-0"
            >
              Ver 24h <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--sys-ink-3)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-[2px] rounded" style={{ backgroundColor: palette.tideStroke }} />
              Maré
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2 rounded-[2px]" style={{ backgroundColor: palette.rainStroke }} />
              Chuva
            </span>
            {cotaLine !== null && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2 rounded-[2px] border border-dashed" style={{ backgroundColor: palette.riskZoneFill, borderColor: palette.refOverflow }} />
                Risco ({formatMeters(cotaLine)})
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="h-[164px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={164} minWidth={0}>
                <AreaChart
                  data={upcomingWindow}
                  syncId="dash-tide"
                  margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="dashTideFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={palette.tideStroke} stopOpacity={0.26} />
                      <stop offset="100%" stopColor={palette.tideStroke} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={palette.gridStroke} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis
                    domain={[0, 4.2]}
                    ticks={[0, 2, 4]}
                    tick={{ fontSize: 11, fill: palette.axisTick }}
                    tickFormatter={(v) => `${v}m`}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  {cotaLine !== null && (
                    <>
                      <ReferenceArea y1={0} y2={cotaLine} fill={palette.safeZoneFill} />
                      <ReferenceArea y1={cotaLine} y2={4.2} fill={palette.riskZoneFill} />
                      <ReferenceLine
                        y={cotaLine}
                        stroke={palette.refOverflow}
                        strokeDasharray="4 4"
                        strokeWidth={1.25}
                        label={{
                          value: `Cota ${formatMeters(cotaLine)}`,
                          position: 'insideTopRight',
                          fill: palette.refOverflow,
                          fontSize: 10,
                        }}
                      />
                    </>
                  )}
                  <Tooltip content={<MiniChartTooltip />} isAnimationActive={false} />
                  <Area
                    type="monotone"
                    dataKey="level"
                    stroke={palette.tideStroke}
                    strokeWidth={2.25}
                    fill="url(#dashTideFill)"
                    isAnimationActive={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--sys-card-bg)', fill: palette.tideStroke }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[72px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={72} minWidth={0}>
                <BarChart
                  data={upcomingWindow}
                  syncId="dash-tide"
                  margin={{ top: 2, right: 8, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="time"
                    ticks={tideTicks}
                    tick={{ fontSize: 11, fill: palette.axisTick }}
                    axisLine={{ stroke: palette.gridStroke }}
                    tickLine={false}
                    minTickGap={18}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    ticks={[0, 10]}
                    tick={{ fontSize: 10, fill: palette.axisTick }}
                    tickFormatter={(v) => `${v}mm`}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip content={() => null} isAnimationActive={false} />
                  <Bar
                    dataKey="rain"
                    fill={palette.rainStroke}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 sys-box p-5 space-y-3 min-w-0">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[var(--sys-border)]">
            <h2 className="text-[15px] font-medium text-[var(--sys-ink)]">Sua operação</h2>
            <a
              href="/estabelecimento"
              className="text-xs font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline"
            >
              Editar →
            </a>
          </div>

          <dl className="divide-y divide-[var(--sys-border)] text-[13px]">
            <div className="py-2.5 flex items-center justify-between gap-4">
              <dt className="text-[var(--sys-ink-2)]">Horário</dt>
              <dd className="font-mono-data font-medium text-[var(--sys-ink)] text-right">
                {operationHours || '—'}
              </dd>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <dt className="text-[var(--sys-ink-2)]">Clima</dt>
              <dd className="inline-flex items-center gap-1.5 font-mono-data font-medium text-[var(--sys-ink)] text-right">
                <Thermometer className="w-3.5 h-3.5 text-[var(--sys-link,var(--sys-brand))]" />
                {dashboard ? `${dashboard.temperatura.toFixed(0)}°C · ${formatRain(dashboard.chuvaAtual)}` : '—'}
              </dd>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <dt className="text-[var(--sys-ink-2)] shrink-0">Último alerta</dt>
              <dd className="text-right min-w-0">
                {latestAlert ? (
                  <a
                    href="/historico"
                    className="inline-flex items-center justify-end gap-2 font-mono-data text-xs text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]"
                  >
                    <span className="sys-indicator">
                      <span className={`sys-indicator-dot ${riskDotClass(latestAlert.nivelRisco)}`} />
                      <span className={riskTextClass(latestAlert.nivelRisco)}>
                        {latestAlert.nivelRisco}
                      </span>
                    </span>
                    <span>{formatDateTime(latestAlert.dataEnvio)}</span>
                  </a>
                ) : (
                  <a href="/historico" className="text-xs text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]">
                    Nenhum →
                  </a>
                )}
              </dd>
            </div>

            <div className="py-2.5 flex items-center justify-between gap-4">
              <dt className="text-[var(--sys-ink-2)]">Registros</dt>
              <dd className="text-right">
                <a
                  href="/ocorrencias/lista"
                  className="inline-flex items-center gap-1.5 font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline"
                >
                  {occurrencesCount} ocorrências
                  <ArrowRight className="w-3 h-3" />
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
