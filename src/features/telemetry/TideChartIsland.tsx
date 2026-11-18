import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, CloudRain, RefreshCw, Table2, Waves } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { telemetriaApi } from '../../shared/api/client';
import type {
  LeituraTelemetriaResponse,
  TelemetriaPontoGraficoDTO,
} from '../../shared/api/types';
import {
  formatDateTime,
  formatMeters,
  formatRain,
} from '../../shared/lib/formatters';
import { useChartTheme } from './chartColors';

function tidePointVerdict(level: number): { label: string; dotClass: string; textClass: string } {
  if (level >= 3.2) {
    return { label: 'Risco', dotClass: 'bg-[var(--sys-dot-crit)] is-alert', textClass: 'text-[var(--sys-crit-text)]' };
  }
  if (level >= 2.8) {
    return { label: 'Atenção', dotClass: 'bg-[var(--sys-dot-warn)]', textClass: 'text-[var(--sys-warn-text)]' };
  }
  return { label: 'Seguro', dotClass: 'bg-[var(--sys-dot-ok)]', textClass: 'text-[var(--sys-ok-text)]' };
}

interface CustomTooltipPayload {
  payload?: TelemetriaPontoGraficoDTO;
}

interface CustomTideTooltipProps {
  active?: boolean;
  payload?: CustomTooltipPayload[];
}

function CustomTideTooltip({ active, payload }: CustomTideTooltipProps) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;
  const status = tidePointVerdict(point.level);
  const isForecast =
    point.tipoRegistro === 'PREVISAO' || point.tipoRegistro === 'PREVISTO';

  return (
    <div className="rounded-[10px] bg-[var(--sys-card-bg)] shadow-[0_8px_24px_oklch(12%_0.025_245/0.12)] p-3 min-w-[170px] space-y-2">
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[var(--sys-border)]">
        <span className="font-mono-data text-xs font-semibold text-[var(--sys-ink)]">
          {point.time}
        </span>
        <span className="text-[11px] font-medium text-[var(--sys-ink-3)]">
          {isForecast ? 'Previsão' : 'Observado'}
        </span>
      </div>

      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--sys-ink-2)]">Maré</span>
          <strong className="font-mono-data text-[var(--sys-ink)]">{formatMeters(point.level)}</strong>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[var(--sys-ink-2)]">Chuva</span>
          <strong className="font-mono-data text-[var(--sys-ink)]">{formatRain(point.rain)}</strong>
        </div>
        {point.rainProbability !== undefined && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--sys-ink-2)]">Chance chuva</span>
            <strong className="font-mono-data text-[var(--sys-ink)]">{point.rainProbability}%</strong>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--sys-border)]">
          <span className="text-[var(--sys-ink-2)]">Situação</span>
          <span className="sys-indicator text-[11px]">
            <span className={`sys-indicator-dot ${status.dotClass}`} />
            <span className={status.textClass}>{status.label}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TideChartIsland() {
  const palette = useChartTheme();
  const [hours, setHours] = useState<6 | 12 | 24>(24);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [pinnedTime, setPinnedTime] = useState<string | null>(null);
  const [rawPoints, setRawPoints] = useState<TelemetriaPontoGraficoDTO[]>([]);
  const [history, setHistory] = useState<LeituraTelemetriaResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);

  const loadSeries = useCallback(async () => {
    const [chartRes, histRes] = await Promise.allSettled([
      telemetriaApi.grafico(),
      telemetriaApi.historico(),
    ]);

    let unavailable = false;
    if (chartRes.status === 'fulfilled') {
      setRawPoints(chartRes.value);
    } else {
      unavailable = true;
    }

    if (histRes.status === 'fulfilled') {
      setHistory(histRes.value);
    }

    setIsUnavailable(unavailable);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadSeries();
    });
    return () => {
      active = false;
    };
  }, [loadSeries]);

  async function handleSync() {
    setSyncing(true);
    setSyncNotice(null);
    try {
      await telemetriaApi.sincronizar();
      await loadSeries();
      setSyncNotice('Leitura atualizada.');
    } catch {
      setSyncNotice('Falha ao sincronizar com a API.');
    } finally {
      setSyncing(false);
    }
  }

  const slicedPoints = useMemo(() => {
    if (hours >= rawPoints.length || hours === 24) return rawPoints;
    return rawPoints.slice(Math.max(0, rawPoints.length - hours));
  }, [rawPoints, hours]);

  const peakPoint = useMemo(() => {
    if (slicedPoints.length === 0) return null;
    return slicedPoints.reduce((acc, p) => (p.level > acc.level ? p : acc), slicedPoints[0]);
  }, [slicedPoints]);

  const nowPoint = useMemo(() => {
    const obs = slicedPoints.filter(
      (p) => p.tipoRegistro !== 'PREVISAO' && p.tipoRegistro !== 'PREVISTO'
    );
    return obs[obs.length - 1] ?? slicedPoints[0] ?? null;
  }, [slicedPoints]);

  const maxRainChance = useMemo(() => {
    let maxProb: number | null = null;
    let maxMm = 0;
    for (const p of slicedPoints) {
      if (p.rainProbability !== undefined && p.rainProbability !== null) {
        maxProb = maxProb === null ? p.rainProbability : Math.max(maxProb, p.rainProbability);
      }
      if (p.rain > maxMm) maxMm = p.rain;
    }
    return { maxProb, maxMm };
  }, [slicedPoints]);

  const pinnedPoint = useMemo(
    () => slicedPoints.find((p) => p.time === pinnedTime) ?? null,
    [slicedPoints, pinnedTime]
  );

  const ticks = useMemo(() => {
    if (slicedPoints.length <= 8) return slicedPoints.map((p) => p.time);
    const step = hours === 24 ? 3 : 2;
    return slicedPoints.filter((_, idx) => idx % step === 0).map((p) => p.time);
  }, [slicedPoints, hours]);

  const handleChartClick = (state: { activeLabel?: string | number } | null) => {
    const clicked = state?.activeLabel ? String(state.activeLabel) : null;
    if (!clicked) return;
    setPinnedTime((prev) => (prev === clicked ? null : clicked));
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
            Telemetria 24h
          </h1>
          {isUnavailable && (
            <span className="sys-indicator text-xs text-[var(--sys-warn-text)]">
              <span className="sys-indicator-dot bg-[var(--sys-dot-warn)]" />
              API indisponível
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="sys-btn-primary shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Sincronizando' : 'Sincronizar'}</span>
        </button>
      </header>

      {syncNotice && (
        <div className="border-b border-[var(--sys-border)] pb-3 text-xs font-medium text-[var(--sys-ink-2)]">
          {syncNotice}
        </div>
      )}

      {/* 3 Métricas Diretas Enxutas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sys-box p-5 space-y-1">
          <span className="flex items-center justify-between text-xs font-medium text-[var(--sys-ink-2)]">
            Maré agora
            <Waves className="w-4 h-4 text-[var(--sys-link,var(--sys-brand))]" />
          </span>
          <strong className="block font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
            {nowPoint ? formatMeters(nowPoint.level) : '—'}
          </strong>
        </div>

        <div className="sys-box p-5 space-y-1">
          <span className="block text-xs font-medium text-[var(--sys-ink-2)]">
            Pico ({hours}h)
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong className="font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
              {peakPoint ? formatMeters(peakPoint.level) : '—'}
            </strong>
            <span className="font-mono-data text-xs text-[var(--sys-ink-2)]">
              {peakPoint?.time ?? '—'}
            </span>
          </div>
        </div>

        <div className="sys-box p-5 space-y-1">
          <span className="flex items-center justify-between text-xs font-medium text-[var(--sys-ink-2)]">
            Chuva ({hours}h)
            <CloudRain className="w-4 h-4 text-[var(--sys-link,var(--sys-brand))]" />
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong className="font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
              {maxRainChance.maxProb !== null
                ? `${maxRainChance.maxProb}%`
                : formatRain(maxRainChance.maxMm)}
            </strong>
            <span className="font-mono-data text-xs text-[var(--sys-ink-3)]">
              {formatRain(maxRainChance.maxMm)}
            </span>
          </div>
        </div>
      </div>

      {/* Controles + Gráfico Empilhado com Zonas Visuais */}
      <section className="sys-box p-4 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 rounded-[9px] bg-[var(--sys-sheet-subtle)] p-1">
            {([6, 12, 24] as const).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setHours(h)}
                className={`px-3 py-1.5 rounded-[7px] text-xs font-medium transition-colors cursor-pointer ${
                  hours === h
                    ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                    : 'text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-[9px] bg-[var(--sys-sheet-subtle)] p-1">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'chart'
                  ? 'bg-[var(--sys-card-bg)] text-[var(--sys-ink)]'
                  : 'text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Gráfico
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[var(--sys-card-bg)] text-[var(--sys-ink)]'
                  : 'text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              Tabela
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[var(--sys-ink-2)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-[2px] rounded" style={{ backgroundColor: palette.tideStroke }} />
            Maré (m)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-[2px]" style={{ backgroundColor: palette.rainStroke }} />
            Chuva (mm/h)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-[2px]" style={{ backgroundColor: palette.safeZoneFill, border: `1px solid ${palette.tideStroke}` }} />
            Faixa segura
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-[2px] border border-dashed" style={{ backgroundColor: palette.riskZoneFill, borderColor: palette.refOverflow }} />
            Área de risco
          </span>
        </div>

        {loading && slicedPoints.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center gap-2.5 text-xs text-[var(--sys-ink-2)]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
            <span>Carregando informações de telemetria...</span>
          </div>
        ) : viewMode === 'chart' ? (
          <div className="space-y-3">
            <div className="h-[236px] w-full min-w-0">
                <ResponsiveContainer width="100%" height={236} minWidth={0}>
                  <AreaChart
                    data={slicedPoints}
                    syncId="mare-chuva-24h"
                    margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
                    onClick={handleChartClick}
                    style={{ cursor: 'pointer' }}
                  >
                    <defs>
                      <linearGradient id="tideGradSlate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={palette.tideStroke} stopOpacity={0.30} />
                        <stop offset="95%" stopColor={palette.tideStroke} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid stroke={palette.gridStroke} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis
                      domain={[0, 4.2]}
                      ticks={[0, 1, 2, 3, 4]}
                      tick={{ fill: palette.axisTick, fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}m`}
                      width={44}
                    />
                    <Tooltip content={<CustomTideTooltip />} isAnimationActive={false} />

                    <ReferenceArea y1={0} y2={2.8} fill={palette.safeZoneFill} />
                    <ReferenceArea y1={3.2} y2={4.2} fill={palette.riskZoneFill} />
                    <ReferenceLine
                      y={2.8}
                      stroke={palette.refAttention}
                      strokeDasharray="4 4"
                      strokeWidth={1.25}
                      label={{
                        value: 'Atenção 2,80 m',
                        position: 'insideBottomLeft',
                        dx: 6,
                        dy: 2,
                        fill: palette.refAttention,
                        fontSize: 10,
                      }}
                    />
                    <ReferenceLine
                      y={3.2}
                      stroke={palette.refOverflow}
                      strokeDasharray="4 4"
                      strokeWidth={1.25}
                      label={{
                        value: 'Risco 3,20 m',
                        position: 'insideTopRight',
                        dx: -6,
                        dy: -4,
                        fill: palette.refOverflow,
                        fontSize: 10,
                      }}
                    />
                    {nowPoint && (
                      <ReferenceLine
                        x={nowPoint.time}
                        stroke={palette.axisTick}
                        strokeOpacity={0.55}
                        label={{ value: 'Agora', position: 'insideTopLeft', fill: palette.axisTick, fontSize: 10 }}
                      />
                    )}
                    {pinnedPoint && (
                      <ReferenceLine x={pinnedPoint.time} stroke={palette.tideStroke} strokeWidth={2} />
                    )}

                    <Area
                      type="monotone"
                      dataKey="level"
                      name="Maré (m)"
                      stroke={palette.tideStroke}
                      strokeWidth={2.25}
                      isAnimationActive={false}
                      fillOpacity={1}
                      fill="url(#tideGradSlate)"
                      activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--sys-card-bg)', fill: palette.tideStroke }}
                    />
                    {peakPoint && (
                      <ReferenceDot
                        x={peakPoint.time}
                        y={peakPoint.level}
                        r={4.5}
                        fill={palette.tideStroke}
                        stroke="var(--sys-card-bg)"
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            <div className="h-[108px] w-full min-w-0">
              <ResponsiveContainer width="100%" height={108} minWidth={0}>
                <BarChart
                  data={slicedPoints}
                  syncId="mare-chuva-24h"
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                  onClick={handleChartClick}
                  style={{ cursor: 'pointer' }}
                >
                  <CartesianGrid stroke={palette.gridStroke} vertical={false} />
                  <XAxis
                    dataKey="time"
                    ticks={ticks}
                    tick={{ fill: palette.axisTick, fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: palette.gridStroke }}
                    minTickGap={18}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fill: palette.axisTick, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}mm`}
                    width={44}
                  />
                  <Tooltip content={() => null} isAnimationActive={false} />
                  <Bar
                    dataKey="rain"
                    name="Chuva (mm/h)"
                    fill={palette.rainStroke}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Barra de leitura fixa ao clicar/tocar */}
            <div className="rounded-[9px] bg-[var(--sys-sheet-subtle)] px-3.5 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
              {pinnedPoint ? (
                <>
                  <div className="flex flex-wrap items-center gap-4">
                    <strong className="font-mono-data text-[var(--sys-ink)]">
                      {pinnedPoint.time}
                    </strong>
                    <span className="font-mono-data text-[var(--sys-ink-2)]">
                      Maré <strong className="text-[var(--sys-ink)]">{formatMeters(pinnedPoint.level)}</strong>
                    </span>
                    <span className="font-mono-data text-[var(--sys-ink-2)]">
                      Chuva <strong className="text-[var(--sys-ink)]">{formatRain(pinnedPoint.rain)}</strong>
                      {pinnedPoint.rainProbability !== undefined ? ` (${pinnedPoint.rainProbability}%)` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPinnedTime(null)}
                    className="font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline cursor-pointer"
                  >
                    Limpar
                  </button>
                </>
              ) : (
                <span className="text-[var(--sys-ink-3)]">
                  Clique num horário para fixar.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile cards empilhados (sem scroll horizontal forçado) */}
            <div className="sm:hidden divide-y divide-[var(--sys-border)]">
              {slicedPoints.map((pt) => {
                const status = tidePointVerdict(pt.level);
                return (
                  <div key={pt.time} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <strong className="font-mono-data text-[var(--sys-ink)]">{pt.time}</strong>
                      <span className="sys-indicator">
                        <span className={`sys-indicator-dot ${status.dotClass}`} />
                        <span className={status.textClass}>{status.label}</span>
                      </span>
                    </div>
                    <div className="text-right font-mono-data space-y-0.5">
                      <div className="font-medium text-[var(--sys-ink)]">{formatMeters(pt.level)}</div>
                      <div className="text-[var(--sys-ink-2)]">
                        {formatRain(pt.rain)}
                        {pt.rainProbability !== undefined ? ` · ${pt.rainProbability}%` : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop tabela aberta por filetes */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--sys-border)] text-[var(--sys-ink-3)] font-medium">
                    <th className="py-2.5 pr-4">Hora</th>
                    <th className="py-2.5 px-3">Maré</th>
                    <th className="py-2.5 px-3">Chuva</th>
                    <th className="py-2.5 px-3">Chance chuva</th>
                    <th className="py-2.5 pl-3">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sys-border)] font-mono-data">
                  {slicedPoints.map((pt) => {
                    const status = tidePointVerdict(pt.level);
                    return (
                      <tr key={pt.time}>
                        <td className="py-2.5 pr-4 font-medium text-[var(--sys-ink)]">{pt.time}</td>
                        <td className="py-2.5 px-3 text-[var(--sys-ink)] tabular-nums">{formatMeters(pt.level)}</td>
                        <td className="py-2.5 px-3 text-[var(--sys-ink-2)] tabular-nums">{formatRain(pt.rain)}</td>
                        <td className="py-2.5 px-3 text-[var(--sys-ink-2)] tabular-nums">
                          {pt.rainProbability !== undefined ? `${pt.rainProbability}%` : '—'}
                        </td>
                        <td className="py-2.5 pl-3 font-sans">
                          <span className="sys-indicator">
                            <span className={`sys-indicator-dot ${status.dotClass}`} />
                            <span className={status.textClass}>{status.label}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--sys-border)]">
            <h2 className="text-[15px] font-medium text-[var(--sys-ink)]">Leituras recentes</h2>
          </div>
          <div className="divide-y divide-[var(--sys-border)]">
            {history.slice(0, 6).map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-[13px] font-mono-data"
              >
                <span className="text-[var(--sys-ink-2)]">{formatDateTime(item.dataHora)}</span>
                <div className="flex items-center gap-5">
                  <span className="text-[var(--sys-ink)] font-medium tabular-nums">
                    {formatMeters(item.nivelMare ?? item.nivelRio)}
                  </span>
                  <span className="text-[var(--sys-ink-2)] tabular-nums text-right">
                    {formatRain(item.precipitacao ?? item.chuvaMm)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
