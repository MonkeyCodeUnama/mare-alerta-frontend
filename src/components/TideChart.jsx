import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { clockOf, formatLevel, series, tide } from '../data/tide';

const RANGES = [
  { id: '6h', label: '6 horas', from: -2, to: 4 },
  { id: '12h', label: '12 horas', from: -4, to: 8 },
  { id: '24h', label: '24 horas', from: -Infinity, to: Infinity },
];

const COLORS = { level: '#1d4ed8', rain: '#4f7fe8', grid: '#e6ebf3', axis: '#747686', attention: '#d97706', alert: '#c2410c', now: '#0b1c30' };
const CHART_MARGIN = { top: 12, right: 12, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 44;
const formatRain = (value) => `${value.toFixed(1).replace('.', ',')} mm/h`;

function statusOf(level) {
  if (level >= tide.alertLevel) return { label: 'Alerta', tone: 'critical' };
  if (level >= tide.attentionLevel) return { label: 'Atenção', tone: 'warning' };
  return { label: 'Seguro', tone: 'good' };
}

function Readout({ point }) {
  const status = statusOf(point.level);
  return <>
    <span className="tide-readout-time">{point.time}</span>
    <span className="tide-readout-row"><i className="key key--level" aria-hidden="true" /><b>{formatLevel(point.level)}</b> nível</span>
    <span className="tide-readout-row"><i className="key key--rain" aria-hidden="true" /><b>{formatRain(point.rain)}</b> chuva</span>
    <span className={`tide-status tide-status--${status.tone}`}>{status.label}</span>
  </>;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return <div className="tide-tooltip"><Readout point={payload[0].payload} /></div>;
}

export default function TideChart() {
  const [range, setRange] = useState('12h');
  const [pinned, setPinned] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [cursor, setCursor] = useState(null);

  const data = useMemo(() => {
    const { from, to } = RANGES.find((item) => item.id === range);
    const anchor = Math.floor(tide.readingHour);
    return series.filter((point) => point.hour >= anchor + from && point.hour <= anchor + to);
  }, [range]);

  const now = data.reduce((best, point) => Math.abs(point.hour - tide.readingHour) < Math.abs(best.hour - tide.readingHour) ? point : best, data[0]);
  const peak = data.find((point) => point.time === tide.high.time);
  const pinnedPoint = data.find((point) => point.time === pinned);
  const tickStep = range === '24h' ? 3 : range === '12h' ? 2 : 1;
  const ticks = data.filter((point) => Number.isInteger(point.hour) && point.hour % tickStep === 0).map((point) => point.time);
  const cursorPoint = cursor === null ? null : data[cursor];
  const nowIndex = data.indexOf(now);
  const togglePin = (point) => setPinned((current) => current === point.time ? null : point.time);
  // Navegação por teclado equivalente ao mouse: setas percorrem os horários, Enter/Espaço fixam, Esc limpa.
  const onKeyDown = (event) => {
    const last = data.length - 1;
    const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowUp: 3, ArrowDown: -3 };
    let next = null;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else if (event.key in steps) next = cursor === null ? nowIndex : cursor + steps[event.key];
    if (next !== null) {
      event.preventDefault();
      setCursor(Math.min(last, Math.max(0, next)));
    } else if ((event.key === 'Enter' || event.key === ' ') && cursorPoint) {
      event.preventDefault();
      togglePin(cursorPoint);
    } else if (event.key === 'Escape') {
      setPinned(null);
    }
  };
  const pin = (state) => {
    const point = data[Number(state?.activeTooltipIndex)];
    if (point) togglePin(point);
  };
  const xAxis = <XAxis dataKey="time" scale="band" ticks={ticks} interval="preserveStartEnd" minTickGap={16} tick={{ fontSize: 11, fill: COLORS.axis }} tickLine={false} axisLine={{ stroke: COLORS.grid }} />;

  return <div className="tide-panel">
    <div className="tide-controls">
      <div className="segmented" role="radiogroup" aria-label="Período do gráfico">
        {RANGES.map((item) => <button type="button" role="radio" aria-checked={range === item.id} className={range === item.id ? 'active' : ''} onClick={() => { setRange(item.id); setCursor(null); }} key={item.id}>{item.label}</button>)}
      </div>
      <div className="tide-legend" aria-hidden="true">
        <span><i className="key key--level" /> Nível (m)</span>
        <span><i className="key key--attention" /> Atenção {formatLevel(tide.attentionLevel)}</span>
        <span><i className="key key--alert" /> Alerta {formatLevel(tide.alertLevel)}</span>
      </div>
      <button type="button" className="button" aria-pressed={showTable} onClick={() => setShowTable((value) => !value)}>{showTable ? 'Ver gráfico' : 'Ver tabela'}</button>
    </div>

    {showTable ? <div className="tide-table-wrap">
      <table className="tide-table">
        <caption className="sr-only">Previsão de nível da maré e chuva</caption>
        <thead><tr><th scope="col">Horário</th><th scope="col">Nível</th><th scope="col">Chuva</th><th scope="col">Situação</th></tr></thead>
        <tbody>{data.map((point) => <tr key={point.time} className={point.time === tide.high.time ? 'is-peak' : ''}><th scope="row">{point.time}</th><td>{formatLevel(point.level)}</td><td>{formatRain(point.rain)}</td><td>{statusOf(point.level).label}</td></tr>)}</tbody>
      </table>
    </div> : <>
      <p className="tide-chart-title">Nível da maré (m)</p>
      <div className="tide-chart-area" tabIndex={0} role="group" aria-roledescription="gráfico" aria-label={`Nível da maré de ${data[0].time} a ${data.at(-1).time}. Pico de ${formatLevel(tide.high.level)} às ${tide.high.time}.`} aria-describedby="tide-chart-help" onKeyDown={onKeyDown} onBlur={() => setCursor(null)}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart accessibilityLayer={false} data={data} syncId="tide" margin={CHART_MARGIN} onClick={pin} style={{ cursor: 'pointer' }}>
            <defs>
              <linearGradient id="tide-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.level} stopOpacity={0.22} />
                <stop offset="100%" stopColor={COLORS.level} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            {xAxis}
            <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} width={Y_AXIS_WIDTH} tick={{ fontSize: 11, fill: COLORS.axis }} tickFormatter={(value) => `${value} m`} tickLine={false} axisLine={false} />
            <ReferenceLine className="ref-attention" y={tide.attentionLevel} stroke={COLORS.attention} strokeWidth={1.5} strokeDasharray="5 4" />
            <ReferenceLine className="ref-alert" y={tide.alertLevel} stroke={COLORS.alert} strokeWidth={1.5} strokeDasharray="8 3" />
            {now && <ReferenceLine className="ref-now" x={now.time} stroke={COLORS.now} strokeOpacity={0.5} label={{ value: 'Agora', position: 'insideTopRight', fill: COLORS.now, fontSize: 10 }} />}
            {cursorPoint && <ReferenceLine className="ref-cursor" x={cursorPoint.time} stroke={COLORS.axis} strokeDasharray="3 3" />}
            {pinnedPoint && <ReferenceLine className="ref-pinned" x={pinnedPoint.time} stroke={COLORS.level} strokeWidth={2} />}
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: COLORS.axis, strokeDasharray: '3 3' }} isAnimationActive={false} />
            <Area type="monotone" dataKey="level" name="Nível" stroke={COLORS.level} strokeWidth={2} fill="url(#tide-fill)" activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
            {peak && <ReferenceDot x={peak.time} y={peak.level} r={5} fill={COLORS.level} stroke="#fff" strokeWidth={2} label={{ value: `Pico ${formatLevel(peak.level)}`, position: 'bottom', fill: '#0b1c30', fontSize: 11, fontWeight: 600, offset: 10 }} />}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="tide-chart-title">Chuva prevista (mm/h)</p>
      <div className="tide-chart-area" aria-hidden="true">
        <ResponsiveContainer width="100%" height={90}>
          <BarChart accessibilityLayer={false} data={data} syncId="tide" margin={CHART_MARGIN} onClick={pin} style={{ cursor: 'pointer' }}>
            <CartesianGrid vertical={false} stroke={COLORS.grid} />
            {xAxis}
            <YAxis domain={[0, 10]} ticks={[0, 5, 10]} width={Y_AXIS_WIDTH} tick={{ fontSize: 11, fill: COLORS.axis }} tickLine={false} axisLine={false} />
            <Tooltip content={() => null} cursor={{ fill: 'rgb(29 78 216 / 6%)' }} isAnimationActive={false} />
            <Bar dataKey="rain" name="Chuva" fill={COLORS.rain} radius={[4, 4, 0, 0]} maxBarSize={14} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="tide-pinned" aria-live="polite">
        {cursorPoint
          ? <><span className="tide-pinned-label">{cursorPoint.time === pinned ? 'Horário fixado' : 'Horário em foco'}</span><Readout point={cursorPoint} /></>
          : pinnedPoint
            ? <><span className="tide-pinned-label">Horário fixado</span><Readout point={pinnedPoint} /><button type="button" className="link-button" onClick={() => setPinned(null)}>Limpar</button></>
            : <span className="tide-now">Agora {clockOf(tide.readingHour)} · <b>{formatLevel(tide.current)}</b></span>}
      </div>
      <p className="tide-pinned-hint" id="tide-chart-help">Passe o cursor ou toque para ver os valores e clique para fixar um horário. No teclado, use as setas para percorrer, Enter para fixar e Esc para limpar.</p>
    </>}
  </div>;
}
