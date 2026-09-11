import { useState } from 'react';
import AppShell from '../components/AppShell';
import gauge from '../assets/figma/dashboard/gauge.svg';
import '../App.css';

const actions = [
  ['Elevar sacarias e fardos em 30cm', 'Priorize paletes mais baixos no estoque seco.'],
  ['Desobstruir trilhos da comporta', 'Conferir se a guia da chapa metálica está limpa.'],
  ['Levantar extensões elétricas de balcão', 'Prender cabos a 40cm do piso.'],
];

export default function Dashboard() {
  const [checked, setChecked] = useState([false, false, false]);
  return <AppShell active="/dashboard">
    <div className="dashboard-content" id="painel">
      <section className="salutation"><div className="salutation-icon">♢</div><div><h1>Painel de Risco Operacional <em>Umarizal</em></h1><p>Olá, Maria! Cenário sob controle. Margem preventiva recomendada para o final da tarde.</p></div><div className="telemetry"><small>Leitura telemétrica</small><b>14:15 • Há 3 min</b></div><button className="refresh" type="button">↻</button></section>
      <div className="dashboard-grid">
        <section className="card risk-card"><div className="card-heading"><div><small>ÍNDICE HIDROLÓGICO</small><h2>Nível de Alerta Atual</h2></div><b className="status-dot">● NÍVEL 2 • ATENÇÃO CALMA</b></div><div className="risk-content"><div className="gauge"><img src={gauge} alt="Indicador de risco moderado" /><h2>Risco Moderado</h2><p>Pico previsto: 3.45m</p></div><div className="risk-insights"><div className="insight"><b>Convergência do Dia</b><p>Preamar às 16:40 acompanhada de chuva pontual. O escoamento do canal permanece desobstruído.</p></div><div className="window"><span>◷</span><p>Janela recomendada<br />para agir</p><b>Até 15:45 (mais 1h30 livres)</b></div></div></div><footer>Fonte: SIM-PA &amp; Defesa Civil <a href="#detalhes">Detalhes técnicos →</a></footer></section>
        <section className="card action-card" id="checklist"><div className="card-heading"><h2>Ações<br />Preventivas</h2><span><b>3<br /><small>Prioridades</small></b>Sem interromper o<br />atendimento</span></div><div className="action-list">{actions.map(([title, detail], index) => <label key={title} className={checked[index] ? 'done' : ''}><input type="checkbox" checked={checked[index]} onChange={() => setChecked((items) => items.map((item, position) => position === index ? !item : item))} /><span><b>{index + 1}. {title}</b><small>{detail}</small></span></label>)}</div><button className="checklist-button" type="button">Ver Checklist Operacional Completo &nbsp; →</button></section>
      </div>
      <section className="card chart-card"><div className="chart-heading"><div><h2>Curva de Nível da Maré e Chuva (12 Horas)</h2><p>Previsão hidrológica para planejamento de descargas e logística comercial.</p></div><span>━ &nbsp; Nível (m) &nbsp;&nbsp; ▪ &nbsp; Chuva (mm/h) &nbsp;&nbsp; <b>Pico 16:40</b></span></div><div className="rain-bars"><i /><i /><i /><i /></div><div className="chart-area"><span className="alert-line">3.5m (Cota Alerta)</span><div className="curve curve-one" /><div className="curve curve-two" /><div className="curve curve-three" /><b className="peak">3.45m • 16:40</b></div><div className="times"><b>12:00<small>1.20m</small></b><b>14:00<small>1.80m</small></b><b className="selected">16:40<small>3.45m</small></b><b>18:00<small>2.60m</small></b><b>20:00<small>1.75m</small></b><b>22:00<small>1.10m</small></b></div></section>
      <section className="metric-row"><div className="metric"><small>NÍVEL ATUAL</small><h2>1.80m</h2><b>+12cm na última hora</b><i /></div><div className="metric"><small>PREVISÃO CHUVA</small><h2>28°C</h2><p>Pancada entre 16h15 e 17h10</p><span>Vento 12 nós WNW</span></div><div className="metric"><small>REDE UMARIZAL</small><h2>3 Lojas</h2><p>Comportas já posicionadas</p><b className="green">Canal fluindo normalmente</b></div><div className="report-card"><small>COLABORAÇÃO RÁPIDA</small><h3>Viu água acumulando na via?</h3><p>Informe a situação da sua calçada em poucos segundos.</p><button type="button">Reportar</button><button type="button">199</button></div></section>
    </div>
  </AppShell>;
}
