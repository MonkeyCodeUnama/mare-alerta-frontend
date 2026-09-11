import { Link } from 'react-router-dom';
import avatar from '../assets/figma/dashboard/emporio.jpeg';

const navigation = [
  ['/dashboard', 'DR', 'Dashboard de Risco'],
  ['/historico', 'HA', 'Histórico de Alertas'],
  ['/checklist', 'CP', 'Checklist de Prevenção'],
  ['/ocorrencias', 'RO', 'Registro de Ocorrências'],
  ['/estabelecimento', 'ME', 'Meu Estabelecimento'],
];

export default function AppShell({ active, children }) {
  return <div className="ops-page">
    <aside className="ops-sidebar">
      <div className="ops-logo"><b>Maré Alerta</b><span>Comércio seguro · Belém</span></div>
      <div className="ops-tide"><b>BAÍA DO GUAJARÁ</b><strong>Baixamar 1.1m</strong><span>Preamar 16:40 · 3.3m</span></div>
      <nav aria-label="Navegação principal">
        {navigation.map(([to, code, label]) => <Link className={active === to ? 'selected' : ''} to={to} key={to}><i aria-hidden="true">{code}</i>{label}</Link>)}
        <Link to="/"><i aria-hidden="true">SA</i>Entrar / Trocar conta</Link>
      </nav>
      <div className="ops-help"><b>APOIO IMEDIATO</b><p>Emergências ou alagamentos críticos na via comercial.</p><button type="button">Defesa Civil 199</button><button type="button">Comitê</button></div>
      <div className="ops-user"><img src={avatar} alt="Empório da Maria"/><span><b>Empório da Maria</b><small>Umarizal · Belém</small></span></div>
    </aside>
    <main className="ops-main">
      <header className="ops-top"><b><i/> Monitoramento ativo: maré estável</b><span>·</span><p>Previsão de maré alta segura até às 15:30</p><button type="button">Plantão 199</button><img src={avatar} alt=""/><strong>Empório da Maria<small>Umarizal</small></strong></header>
      {children}
    </main>
  </div>;
}
