import { useState } from 'react';
import { ClipboardCheck, FileWarning, Gauge, History, Menu, Store, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { neighborhoodLabel, useStore } from '../state/store';

const navigation = [
  ['/dashboard', Gauge, 'Dashboard de Risco'],
  ['/historico', History, 'Histórico de Alertas'],
  ['/checklist', ClipboardCheck, 'Checklist de Prevenção'],
  ['/ocorrencias', FileWarning, 'Registro de Ocorrências'],
  ['/estabelecimento', Store, 'Meu Estabelecimento'],
];

export default function AppShell({ active, children }) {
  const { store, logout } = useStore();
  const navigate = useNavigate();
  const initials = store.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0].toUpperCase()).join('');
  const avatarFor = (alt) => <span className="avatar-initials" role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>{initials}</span>;
  const signOut = () => { logout(); navigate('/'); };
  const [menuOpen, setMenuOpen] = useState(false);
  return <div className="ops-page">
    <aside className="ops-sidebar">
      <div className="ops-logo"><b>Maré Alerta</b><span>Comércio seguro · Belém</span></div>
      <div className="ops-tide"><b>ESTABELECIMENTO CONECTADO</b><strong>{neighborhoodLabel(store.neighborhood) || 'Localidade não informada'}</strong><span>Perfil vinculado à sua conta</span></div>
      <nav id="mobile-navigation" className={menuOpen ? 'menu-open' : ''} aria-label="Navegação principal">
        {navigation.map(([to, Icon, label]) => <Link onClick={() => setMenuOpen(false)} className={active === to ? 'selected' : ''} aria-current={active === to ? 'page' : undefined} to={to} key={to}><i aria-hidden="true"><Icon size={16} strokeWidth={2} /></i>{label}</Link>)}
      </nav>
      <div className="ops-help"><b>APOIO IMEDIATO</b><p>Emergências ou alagamentos críticos na via comercial.</p><a className="button primary" href="tel:199">Defesa Civil 199</a><Link className="button" to="/historico">Comitê</Link></div>
      <div className="ops-user">{avatarFor('')}<span><b>{store.name}</b><small>{neighborhoodLabel(store.neighborhood)} · Belém</small></span><button className="ops-logout" type="button" onClick={signOut}>Sair</button></div>
    </aside>
    <main className="ops-main">
      <header className="ops-top">
        <button className="ops-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}><span className="sr-only">Abrir opções</span>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
        <b><i aria-hidden="true" /><span className="ops-top-long">Sessão autenticada</span></b>
        <p>Monitoramento Maré Alerta</p>
        <a className="button" href="tel:199">Plantão 199</a>
        <ThemeToggle />
        {avatarFor(store.name)}
        <button className="ops-logout" type="button" onClick={signOut}>Sair</button>
      </header>
      {children}
    </main>
  </div>;
}
