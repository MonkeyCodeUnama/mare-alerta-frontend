import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Checklist, History, Occurrences, OccurrenceHistory, Establishment } from './pages/Operations';
import { useStore } from './state/store';
import WhatsappAdmin from './pages/admin/WhatsappAdmin';

function RequireAdmin() {
  const { session } = useStore();
  if (session?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RequireAuth() {
  const { authenticated, profileLoaded, loadProfile, logout } = useStore();
  const [error, setError] = useState('');
  useEffect(() => {
    if (authenticated && !profileLoaded) {
      loadProfile().catch((reason) => {
        setError(reason.message);
        if (reason.status === 401) logout();
      });
    }
  }, [authenticated, profileLoaded, loadProfile, logout]);

  if (!authenticated) return <Navigate to="/entrar" replace />;
  if (error) return <main className="auth-loading"><p role="alert">{error}</p><button type="button" onClick={() => { setError(''); loadProfile().catch((reason) => setError(reason.message)); }}>Tentar novamente</button></main>;
  if (!profileLoaded) return <main className="auth-loading" role="status">Carregando seu estabelecimento…</main>;
  return <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/entrar" element={<Home />} />
      <Route path="/cadastro" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/historico" element={<History />} />
        <Route path="/ocorrencias" element={<Occurrences />} />
        <Route path="/ocorrencias/lista" element={<OccurrenceHistory />} />
        <Route path="/estabelecimento" element={<Establishment />} />
        <Route element={<RequireAdmin />}>
          <Route path="/admin/whatsapp" element={<WhatsappAdmin />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
