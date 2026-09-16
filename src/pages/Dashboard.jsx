import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import gauge from '../assets/figma/dashboard/gauge.svg';
import { formatDuration, formatLevel, tide } from '../data/tide';
import { useStore } from '../state/store';

// O Recharts é pesado; carrega o gráfico em um chunk separado.
const TideChart = lazy(() => import('../components/TideChart'));

const actions = [
  ['Elevar sacarias e fardos em 30 cm', 'Priorize paletes mais baixos no estoque seco.'],
  ['Desobstruir trilhos da comporta', 'Conferir se a guia da chapa metálica está limpa.'],
  ['Levantar extensões elétricas de balcão', 'Prender cabos a 40 cm do piso.'],
];

export default function Dashboard() {
  const { store } = useStore();
  const greeting = store.owner ? `Olá, ${store.owner}!` : 'Olá!';
  const [checked, setChecked] = useState([false, false, false]);
  const [reading, setReading] = useState('Há 3 min');
  const pending = checked.filter((item) => !item).length;
  const levelPercent = Math.round((tide.current / tide.alertLevel) * 100);

  return <AppShell active="/dashboard">
    <div className="dashboard-content">
      <section className="salutation">
        <div className="salutation-icon" aria-hidden="true">♢</div>
        <div><h1>Painel de Risco Operacional <em>{store.neighborhood}</em></h1><p>{greeting} Cenário sob controle. Margem preventiva recomendada para o final da tarde.</p></div>
        <div className="telemetry" aria-live="polite"><small>Leitura telemétrica</small><b>{tide.reading} • {reading}</b></div>
        <button className="refresh" type="button" aria-label="Atualizar leitura" onClick={() => setReading('Agora')}>↻</button>
      </section>
      <div className="dashboard-grid">
        <section className="card risk-card">
          <div className="card-heading"><div><small>ÍNDICE HIDROLÓGICO</small><h2>Nível de Alerta Atual</h2></div><b className="status-dot">● NÍVEL 2 • ATENÇÃO</b></div>
          <div className="risk-content">
            <div className="gauge"><img src={gauge} alt="Indicador de risco moderado" /><h2>Risco Moderado</h2><p>Pico previsto: {formatLevel(tide.high.level)}</p></div>
            <div className="risk-insights">
              <div className="insight"><b>Convergência do Dia</b><p>Preamar às {tide.high.time} acompanhada de chuva pontual. O escoamento do canal permanece desobstruído.</p></div>
              <div className="window"><span aria-hidden="true">◷</span><p>Janela recomendada para agir</p><b>Até {tide.safeUntil} (mais {formatDuration(tide.reading, tide.safeUntil)} livres)</b></div>
            </div>
          </div>
          <footer>Fonte: SIM-PA &amp; Defesa Civil <Link to="/historico">Detalhes técnicos →</Link></footer>
        </section>
        <section className="card action-card">
          <div className="card-heading"><h2>Ações Preventivas</h2><span><b>{pending}<small>{pending === 1 ? 'Pendente' : 'Pendentes'}</small></b>Sem interromper o atendimento</span></div>
          <div className="action-list">{actions.map(([title, detail], index) => <label key={title} className={checked[index] ? 'done' : ''}><input type="checkbox" checked={checked[index]} onChange={() => setChecked((items) => items.map((item, position) => position === index ? !item : item))} /><span><b>{index + 1}. {title}</b><small>{detail}</small></span></label>)}</div>
          <Link className="checklist-button" to="/checklist">Ver Checklist Operacional Completo →</Link>
        </section>
      </div>
      <section className="card chart-card">
        <div className="chart-heading"><div><h2>Curva de Nível da Maré e Chuva</h2><p>Previsão hidrológica para planejamento de descargas e logística comercial.</p></div><span><b>Pico {tide.high.time} · {formatLevel(tide.high.level)}</b></span></div>
        <Suspense fallback={<div className="tide-loading">Carregando gráfico…</div>}><TideChart /></Suspense>
      </section>
      <section className="metric-row">
        <div className="metric"><small>NÍVEL ATUAL</small><h2>{formatLevel(tide.current)}</h2><b>{tide.trend}</b><i style={{ '--fill': `${levelPercent}%` }} aria-label={`${levelPercent}% da cota de alerta`} /></div>
        <div className="metric"><small>PREVISÃO DE CHUVA</small><h2>{tide.rain.peak} mm/h</h2><p>Pancada entre {tide.rain.from} e {tide.rain.to}</p><span>{tide.temperature} °C · Vento {tide.wind}</span></div>
        <div className="metric"><small>REDE {store.neighborhood.toUpperCase()}</small><h2>3 lojas</h2><p>Comportas já posicionadas</p><b className="green">Canal fluindo normalmente</b></div>
        <div className="report-card"><small>COLABORAÇÃO RÁPIDA</small><h3>Viu água acumulando na via?</h3><p>Informe a situação da sua calçada em poucos segundos.</p><Link className="button" to="/ocorrencias">Reportar</Link><a className="button button--ghost" href="tel:199">Ligar 199</a></div>
      </section>
    </div>
  </AppShell>;
}
