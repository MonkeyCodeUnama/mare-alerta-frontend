import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import avatar from '../assets/figma/dashboard/emporio.jpeg';
import { formatLevel, store, tide } from '../data/tide';

const navigation = [
  ['/dashboard', 'DR', 'Dashboard de Risco'],
  ['/historico', 'HA', 'Histórico de Alertas'],
  ['/checklist', 'CP', 'Checklist de Prevenção'],
  ['/ocorrencias', 'RO', 'Registro de Ocorrências'],
  ['/estabelecimento', 'ME', 'Meu Estabelecimento'],
];

export default function AppShell({ active, children }) {
  const navRef = useRef(null);
  // No mobile o menu vira uma faixa rolável; centraliza o item ativo para ele ficar visível.
  useEffect(() => {
    const nav = navRef.current;
    const selected = nav?.querySelector('.selected');
    if (nav && selected && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = selected.offsetLeft - nav.offsetLeft - (nav.clientWidth - selected.offsetWidth) / 2;
  }, [active]);
  return <div className="ops-page">
    <aside className="ops-sidebar">
      <div className="ops-logo"><b>Maré Alerta</b><span>Comércio seguro · Belém</span></div>
      <div className="ops-tide"><b>{tide.station.toUpperCase()}</b><strong>Baixa-mar {formatLevel(tide.low.level)}</strong><span>Preamar {tide.high.time} · {formatLevel(tide.high.level)}</span></div>
      <nav ref={navRef} aria-label="Navegação principal">
        {navigation.map(([to, code, label]) => <Link className={active === to ? 'selected' : ''} aria-current={active === to ? 'page' : undefined} to={to} key={to}><i aria-hidden="true">{code}</i>{label}</Link>)}
      </nav>
      <div className="ops-help"><b>APOIO IMEDIATO</b><p>Emergências ou alagamentos críticos na via comercial.</p><a className="button primary" href="tel:199">Defesa Civil 199</a><Link className="button" to="/historico">Comitê</Link></div>
      <div className="ops-user"><img src={avatar} alt="" /><span><b>{store.name}</b><small>{store.neighborhood} · Belém</small></span><Link className="ops-logout" to="/">Sair</Link></div>
    </aside>
    <main className="ops-main">
      <header className="ops-top">
        <b><i aria-hidden="true" /><span className="ops-top-long">Monitoramento ativo: </span>maré estável</b>
        <p>Maré alta segura até às {tide.safeUntil}</p>
        <a className="button" href="tel:199">Plantão 199</a>
        <img src={avatar} alt={store.name} />
        <Link className="ops-logout" to="/">Sair</Link>
      </header>
      {children}
    </main>
  </div>;
}
