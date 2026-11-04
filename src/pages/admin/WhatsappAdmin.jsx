import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, LoaderCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { request, jsonBody } from '../../api/client';
import AppShell from '../../components/AppShell';
import '../../styles/whatsapp-admin.css';
import { useStore } from '../../state/store';

const base = '/admin/whatsapp';
const value = (data, ...keys) => keys.reduce((result, key) => result ?? data?.[key], undefined);
const formatPhone = (phone) => phone ? String(phone).replace(/^(\d{2})(\d{2})(\d+)(\d{4})$/, '+$1 ($2) $3-$4') : '—';

export default function WhatsappAdmin() {
  const { session } = useStore();
  const [status, setStatus] = useState(null);
  const [config, setConfig] = useState({});
  const [history, setHistory] = useState([]);
  const [qr, setQr] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [test, setTest] = useState({ telefone: '', mensagem: 'Mensagem de teste — Maré Alerta.' });

  const refresh = useCallback(async () => {
    setBusy('refresh'); setError('');
    try {
      const [current, _settings, sent] = await Promise.all([
        request(`${base}/status`, { token: session.token }),
        Promise.resolve({}),
        request(`${base}/history`, { token: session.token }),
      ]);
      setStatus(current?.data || current); setConfig(current?.data || current || {});
      setHistory(sent?.data || sent?.envios || sent || []);
    } catch (reason) { setError(reason.message); } finally { setBusy(''); }
  }, [session.token]);

  useEffect(() => { refresh(); }, [refresh]);

  const action = async (name, path, options = {}) => {
    setBusy(name); setError(''); setNotice('');
    try {
      const result = await request(`${base}/${path}`, { method: 'POST', token: session.token, ...options });
      const data = result?.data || result;
      if (name === 'qr') setQr(value(data, 'qrcode', 'qrCode', 'codigo'));
      setNotice(name === 'test' ? 'Mensagem de teste enviada.' : 'Ação realizada com sucesso.');
      await refresh();
    } catch (reason) { setError(reason.message); } finally { setBusy(''); }
  };

  const updateConfig = async (event) => {
    event.preventDefault(); setBusy('config'); setError('');
    try {
      const params = new URLSearchParams({ ativo: String(Boolean(config.ativo)), enviarAlertasAutomaticos: String(Boolean(config.enviarAlertasAutomaticos)) });
      await request(`${base}/settings?${params}`, { method: 'PATCH', token: session.token });
      setNotice('Configuração salva.');
      await refresh();
    } catch (reason) { setError(reason.message); } finally { setBusy(''); }
  };

  const requestQr = async () => {
    setBusy('qr'); setError(''); setNotice('');
    try {
      const result = await request(`${base}/qr`, { token: session.token });
      const data = result?.data || result;
      const image = value(data, 'qrcode', 'qrCode', 'base64', 'codigo');
      setQr(image?.startsWith('data:') ? image : image ? `data:image/png;base64,${image}` : null);
      setNotice('QR Code atualizado.');
    } catch (reason) { setError(reason.message); } finally { setBusy(''); }
  };

  const sendTest = (event) => { event.preventDefault(); action('test', 'test', { body: jsonBody(test) }); };
  const state = value(status, 'status', 'estado', 'state') || 'DESCONHECIDO';
  const connected = ['CONECTADO', 'CONNECTED', 'OPEN'].includes(String(state).toUpperCase());
  const list = Array.isArray(history) ? history : history?.content || history?.items || [];

  return <AppShell active="/admin/whatsapp"><main className="whatsapp-admin">
    <header className="wa-heading"><div><span className="eyebrow">ADMINISTRAÇÃO</span><h1>WhatsApp</h1><p>Gerencie o número que envia alertas aos estabelecimentos.</p></div><button className="wa-button secondary" type="button" onClick={refresh} disabled={busy === 'refresh'}><RefreshCw size={16} /> Atualizar</button></header>
    {error && <p className="wa-alert error" role="alert">{error}</p>}{notice && <p className="wa-alert success" role="status"><CheckCircle size={16} /> {notice}</p>}
    <section className="wa-grid">
      <article className="wa-card wa-status"><h2>Status da conexão</h2><div className={`wa-state ${connected ? 'on' : 'off'}`}>{connected ? <Wifi /> : <WifiOff />}<strong>{state}</strong></div><dl><div><dt>Instância</dt><dd>{value(status, 'instancia', 'instanceName') || '—'}</dd></div><div><dt>Número conectado</dt><dd>{formatPhone(value(status, 'telefone', 'phone', 'number'))}</dd></div><div><dt>Atualizado em</dt><dd>{value(status, 'atualizadoEm', 'updatedAt') ? new Date(value(status, 'atualizadoEm', 'updatedAt')).toLocaleString('pt-BR') : '—'}</dd></div></dl>{value(status, 'nome', 'profileName') && <div className="wa-connected-profile">{value(status, 'foto', 'profilePictureUrl') ? <img src={value(status, 'foto', 'profilePictureUrl')} alt="Foto do WhatsApp conectado" /> : <span aria-hidden="true">WA</span>}<div><strong>{value(status, 'nome', 'profileName')}</strong><small>{formatPhone(value(status, 'telefone', 'phone', 'number'))}</small></div></div>}<div className="wa-actions"><button className="wa-button" onClick={() => action('connect', 'connect')} disabled={!!busy}>Conectar</button><button className="wa-button secondary" onClick={() => action('reconnect', 'reconnect')} disabled={!!busy}>Reconectar</button><button className="wa-button danger" onClick={() => window.confirm('Desconectar o WhatsApp agora?') && action('disconnect', 'disconnect')} disabled={!!busy}>Desconectar</button></div></article>
      <article className="wa-card"><h2>Conectar WhatsApp</h2><p>Abra o WhatsApp no celular, acesse <b>Dispositivos conectados</b>, escolha <b>Conectar dispositivo</b> e leia o QR Code.</p>{qr && <img className="wa-qr" src={qr} alt="QR Code para conectar o WhatsApp" />}<button className="wa-button" onClick={requestQr} disabled={!!busy}>{busy === 'qr' ? <LoaderCircle className="spin" /> : null} Gerar QR Code</button></article>
    </section>
    <section className="wa-grid"><form className="wa-card" onSubmit={sendTest}><h2>Teste de envio</h2><label>Número de destino<input required value={test.telefone} onChange={(e) => setTest({ ...test, telefone: e.target.value })} placeholder="(91) 99999-9999" /></label><label>Mensagem<textarea required value={test.mensagem} onChange={(e) => setTest({ ...test, mensagem: e.target.value })} /></label><button className="wa-button" disabled={!!busy}>Enviar teste</button></form><form className="wa-card" onSubmit={updateConfig}><h2>Configuração automática</h2><label className="wa-check"><input type="checkbox" checked={Boolean(config.ativo ?? config.automatico)} onChange={(e) => setConfig({ ...config, ativo: e.target.checked })} /> Ativar envio automático</label><label className="wa-check"><input type="checkbox" checked={Boolean(config.somenteComTelefone)} onChange={(e) => setConfig({ ...config, somenteComTelefone: e.target.checked })} /> Enviar somente para estabelecimentos com telefone</label><label>Intervalo mínimo (minutos)<input type="number" min="0" value={config.intervaloMinimo ?? ''} onChange={(e) => setConfig({ ...config, intervaloMinimo: Number(e.target.value) })} /></label><button className="wa-button" disabled={busy === 'config'}>Salvar configuração</button></form></section>
    <section className="wa-card wa-history"><h2>Histórico de envios</h2><div className="wa-table-wrap"><table><thead><tr><th>Empresa</th><th>Telefone</th><th>Tipo</th><th>Data</th><th>Status</th></tr></thead><tbody>{list.length ? list.map((item, index) => <tr key={item.id || index}><td>{value(item, 'empresa', 'estabelecimento') || '—'}</td><td>{value(item, 'telefone', 'phone') || '—'}</td><td>{value(item, 'tipoAlerta', 'tipo') || '—'}</td><td>{value(item, 'enviadoEm', 'data', 'createdAt') ? new Date(value(item, 'enviadoEm', 'data', 'createdAt')).toLocaleString('pt-BR') : '—'}</td><td>{value(item, 'status', 'estado') || '—'}</td></tr>) : <tr><td colSpan="5">Nenhum envio registrado.</td></tr>}</tbody></table></div></section>
  </main></AppShell>;
}
