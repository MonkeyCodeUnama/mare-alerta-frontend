import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { request } from '../api/client';
import { neighborhoodLabel, useStore } from '../state/store';

const actions = [
  ['Elevar sacarias e fardos em 30 cm', 'Priorize paletes mais baixos no estoque seco.'],
  ['Desobstruir trilhos da comporta', 'Conferir se a guia da chapa metálica está limpa.'],
  ['Levantar extensões elétricas de balcão', 'Prender cabos a 40 cm do piso.'],
];
const riskLabels = { BAIXO: 'Baixo', MEDIO: 'Médio', ALTO: 'Alto', CRITICO: 'Crítico' };
const riskSeverity = { BAIXO: 'good', MEDIO: 'warning', ALTO: 'critical', CRITICO: 'critical' };
const riskText = (value) => riskLabels[value] || value || 'Indisponível';
const meters = (value) => value == null || value === '' || !Number.isFinite(Number(value)) ? '—' : `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
const percent = (value) => {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '—';
  const normalized = Number(value);
  const display = normalized <= 1 ? normalized * 100 : normalized;
  return `${display.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`;
};
const dateTime = (value) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Não informado';

export default function Dashboard() {
  const { store } = useStore();
  const [checked, setChecked] = useState([false, false, false]);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const pending = checked.filter((item) => !item).length;
  const greeting = store.owner ? `Olá, ${store.owner}!` : 'Olá!';

  const loadRisk = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = store.neighborhood ? `?localidade=${encodeURIComponent(store.neighborhood)}` : '';
      setRisk(await request(`/risco/atual${query}`));
    } catch (reason) { setError(reason.message); }
    finally { setLoading(false); }
  }, [store.neighborhood]);
  useEffect(() => {
    let active = true;
    const query = store.neighborhood ? `?localidade=${encodeURIComponent(store.neighborhood)}` : '';
    request(`/risco/atual${query}`).then((value) => {
      if (active) { setRisk(value); setError(''); }
    }).catch((reason) => {
      if (active) setError(reason.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [store.neighborhood]);

  return <AppShell active="/dashboard">
    <div className="dashboard-content">
      <section className="salutation">
        <div className="salutation-icon" aria-hidden="true">♢</div>
        <div><h1>Painel de Risco Operacional <em>{neighborhoodLabel(store.neighborhood)}</em></h1><p>{greeting} Dados de risco consultados no serviço Maré Alerta.</p></div>
        <div className="telemetry" aria-live="polite"><small>Consulta de risco</small><b>{loading ? 'Atualizando…' : risk ? `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Sem leitura'}</b></div>
        <button className="refresh" type="button" aria-label="Atualizar leitura" onClick={loadRisk} disabled={loading}>↻</button>
      </section>

      <div className="dashboard-grid">
        <section className="card risk-card">
          <div className="card-heading"><div><small>ÍNDICE HIDROLÓGICO</small><h2>Nível de Alerta Atual</h2></div>{risk && <b className={`status-dot status-dot--${riskSeverity[risk.nivelRisco] || 'warning'}`}>● {riskText(risk.nivelRisco).toUpperCase()}</b>}</div>
          {loading ? <p role="status">Consultando o risco atual…</p> : error ? <p className="form-error" role="alert">{error}</p> : risk ? <>
            <div className="risk-content">
              <div className="gauge"><h2>{riskText(risk.nivelRisco)}</h2><p>Nível previsto: {meters(risk.nivelMarePrevistoMetros)}</p></div>
              <div className="risk-insights">
                <div className="insight"><b>Cenário</b><p>{risk.descricaoCenario || 'Sem descrição de cenário.'}</p></div>
                <div className="window"><span aria-hidden="true">◷</span><p>Horário de pico previsto</p><b>{dateTime(risk.horarioPicoPrevisto)}</b></div>
              </div>
            </div>
            <footer><span>Localidade: {risk.bairro || store.neighborhood}</span><Link to="/historico">Ver alertas →</Link></footer>
          </> : <p>Nenhum dado de risco disponível no momento.</p>}
        </section>

        <section className="card action-card">
          <div className="card-heading"><h2>Ações Preventivas</h2><span><b>{pending}<small>{pending === 1 ? 'Pendente' : 'Pendentes'}</small></b>Checklist neste dispositivo</span></div>
          <div className="action-list">{actions.map(([title, detail], index) => <label key={title} className={checked[index] ? 'done' : ''}><input type="checkbox" checked={checked[index]} onChange={() => setChecked((items) => items.map((item, position) => position === index ? !item : item))} /><span><b>{index + 1}. {title}</b><small>{detail}</small></span></label>)}</div>
          <Link className="checklist-button" to="/checklist">Ver Checklist Operacional Completo →</Link>
        </section>
      </div>

      <section className="metric-row dashboard-metrics">
        <div className="metric"><small>RISCO ATUAL</small><h2>{loading ? '…' : risk ? riskText(risk.nivelRisco) : '—'}</h2><p>{risk?.descricaoCenario || error || 'Informação retornada pela API.'}</p></div>
        <div className="metric"><small>NÍVEL DE MARÉ PREVISTO</small><h2>{meters(risk?.nivelMarePrevistoMetros)}</h2><p>Pico: {risk ? dateTime(risk.horarioPicoPrevisto) : '—'}</p></div>
        <div className="metric"><small>PROBABILIDADE DE CHUVA</small><h2>{percent(risk?.probabilidadeChuva)}</h2><p>Valor informado pelo serviço de risco.</p></div>
        <div className="report-card"><small>COLABORAÇÃO RÁPIDA</small><h3>Viu água acumulando na via?</h3><p>Registre uma ocorrência no seu estabelecimento.</p><Link className="button" to="/ocorrencias">Reportar</Link><a className="button button--ghost" href="tel:199">Ligar 199</a></div>
      </section>
    </div>
  </AppShell>;
}
