import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ExternalLink from '../components/ExternalLink';
import { links } from '../config';
import { request, jsonBody } from '../api/client';
import { BUSINESS_TYPES, NEIGHBORHOODS, useStore } from '../state/store';

const phases = [
  { id: 'antes', tab: 'Antes da Cheia', title: 'ANTES DA CHEIA', priority: 'Prioridade alta', tasks: [
    ['Elevar produtos do primeiro nível das prateleiras (mínimo 20 cm)', 'Corredores 1, 2 e 3', false],
    ['Desconectar nobreaks e extensões rente ao chão', 'Frente de Caixa', false],
    ['Instalar a chapa/comporta de contenção na entrada principal', 'Porta Principal', false],
    ['Recolher a lixeira externa para não entupir o bueiro', 'Calçada', false],
    ['Proteger motor do freezer de sorvetes com calço de borracha (15 cm)', 'Estoque', false],
  ] },
  { id: 'durante', tab: 'Durante a Maré', title: 'DURANTE A MARÉ ALTA', priority: 'Prioridade média', tasks: [
    ['Manter a comporta fechada e checar a vedação a cada 30 min', 'Porta Principal', false],
    ['Suspender descargas de mercadoria pela calçada', 'Doca de Carga', false],
  ] },
  { id: 'depois', tab: 'Após Baixar', title: 'APÓS A ÁGUA BAIXAR', priority: 'Prioridade normal', tasks: [
    ['Fotografar danos antes de limpar o salão', 'Salão', false],
    ['Higienizar piso e rodapés antes de reabrir', 'Salão', false],
  ] },
];

function TaskGroup({ phase, done, onToggle }) {
  return <section className="task-group" id={`fase-${phase.id}`}>
    <header><b>● {phase.title}</b><span>{phase.priority}</span></header>
    <div>{phase.tasks.map(([task, tag], index) => {
      const complete = done[index];
      return <article key={task} className={complete ? 'complete' : ''}>
        <input type="checkbox" checked={complete} onChange={() => onToggle(index)} aria-label={task} />
        <p><b>{task}</b><small>{complete ? 'Concluído neste dispositivo' : 'Tarefa local'}</small></p>
        <em>{tag}</em>
        {!complete && <button type="button" onClick={() => onToggle(index)}>Concluir</button>}
      </article>;
    })}</div>
  </section>;
}

export function Checklist() {
  const [done, setDone] = useState(() => Object.fromEntries(phases.map((phase) => [phase.id, phase.tasks.map((task) => task[2])])));
  const [tab, setTab] = useState('todas');
  const total = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completed = Object.values(done).flat().filter(Boolean).length;
  const percent = Math.round((completed / total) * 100);
  const toggle = (id) => (index) => setDone((state) => ({ ...state, [id]: state[id].map((value, position) => position === index ? !value : value) }));
  const visible = tab === 'todas' ? phases : phases.filter((phase) => phase.id === tab);

  return <AppShell active="/checklist"><div className="ops-content">
    <div className="page-title">
      <div><h1>Checklist de Prevenção Operacional</h1><p>Checklist local neste dispositivo; as tarefas não são sincronizadas com o servidor.</p></div>
      <ExternalLink href={links.whatsappTeam}>WhatsApp Equipe</ExternalLink>
      <button type="button" className="primary">＋ Nova Tarefa</button>
    </div>
    <div className="readiness">
      <div><b>ÍNDICE DE PRONTIDÃO <em>{completed}/{total} concluídas</em></b><h2>{percent}% <small>{completed} de {total} medidas ativas</small></h2><i style={{ '--fill': `${percent}%` }} aria-hidden="true" /></div>
      <span><small>Escopo</small><b>Local</b><small>Estado mantido nesta tela</small></span>
      <span><small>Sincronização</small><b>Desativada</b><small>API sem endpoint de checklist</small></span>
      <aside><b>ORIENTAÇÕES</b><strong>Revise as tarefas</strong><small>Adapte-as à sua operação</small></aside>
    </div>
    <div className="tabs" role="tablist" aria-label="Fases">
      {[{ id: 'todas', tab: 'Todas' }, ...phases].map((phase) => {
        const count = phase.tasks ? phase.tasks.length : total;
        return <button type="button" role="tab" aria-selected={tab === phase.id} className={tab === phase.id ? 'active' : ''} onClick={() => setTab(phase.id)} key={phase.id}>{phase.tab} ({count})</button>;
      })}
    </div>
    {visible.map((phase) => <TaskGroup key={phase.id} phase={phase} done={done[phase.id]} onToggle={toggle(phase.id)} />)}
  </div></AppShell>;
}

export function History() {
  const { session } = useStore();
  const token = session?.token;
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shared, setShared] = useState(null);
  const loadAlerts = useCallback(async () => {
    setLoading(true); setError('');
    try { setAlerts(await request('/alertas', { token }) || []); }
    catch (reason) { setError(reason.message); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => {
    let active = true;
    request('/alertas', { token }).then((value) => {
      if (active) { setAlerts(value || []); setError(''); }
    }).catch((reason) => {
      if (active) setError(reason.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);
  const share = async (alert) => {
    try { await navigator.clipboard.writeText(alert.mensagem); setShared(alert.id); } catch { setShared(null); }
  };

  return <AppShell active="/historico"><div className="ops-content">
    <div className="history-title"><b>BOLETINS</b><h1>Histórico de Alertas</h1><p>Alertas retornados pelo serviço Maré Alerta.</p><Link className="button primary" to="/ocorrencias">Registrar Ocorrência</Link></div>
    <p className="sr-only" aria-live="polite">{shared ? `Mensagem do alerta copiada.` : ''}</p>
    {loading && <p role="status">Carregando alertas…</p>}
    {error && <div className="form-error" role="alert">{error} <button type="button" onClick={loadAlerts}>Tentar novamente</button></div>}
    {!loading && !error && alerts.length === 0 && <p>Nenhum alerta foi retornado.</p>}
    {!loading && !error && <div className="alert-list">{alerts.map((alert) => <article key={alert.id}>
      <header><b>{alert.nivelRisco || 'Alerta'}</b><span>{alert.tipoAlerta || ''} {alert.dataEnvio ? `• ${new Date(alert.dataEnvio).toLocaleString('pt-BR')}` : ''}</span></header>
      <h3>{alert.estabelecimentoNome || 'Maré Alerta'}</h3><p>{alert.mensagem}</p>
      <footer><span>Origem: {alert.origemAlerta || 'Não informada'}</span><button type="button" className="link-button" onClick={() => share(alert)}>{shared === alert.id ? 'Copiado ✓' : 'Compartilhar'}</button></footer>
    </article>)}</div>}
    <div className="community"><span><b>Rede Comunitária Maré Alerta</b><small>Converse com a comunidade comercial pelo canal de WhatsApp configurado.</small></span><ExternalLink className="button primary" href={links.whatsappGroup}>Entrar no Grupo WhatsApp</ExternalLink></div>
  </div></AppShell>;
}

const waterOptions = [['Até 5 cm', 'Apenas calçada'], ['5 a 20 cm', 'Entrou no salão'], ['Acima de 20 cm', 'Salão alagado']];
const damageChoices = ['Mercadorias / Estoque', 'Equipamentos elétricos', 'Paredes e rodapés', 'Comércio fechado', 'Caixa / Balança'];

export function Occurrences() {
  const { session, store } = useStore();
  const [selected, setSelected] = useState(['Mercadorias / Estoque', 'Comércio fechado']);
  const [water, setWater] = useState('5 a 20 cm');
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState('');
  const [protocol, setProtocol] = useState('');
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);
  const toggle = (choice) => setSelected((items) => items.includes(choice) ? items.filter((item) => item !== choice) : [...items, choice]);
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const valor = form.get('valor');
    const horas = form.get('horas');
    const equipe = form.get('equipe');
    setBusy(true); setStatus('Enviando ocorrência…'); setProtocol(''); setCreated(false);
    try {
      const response = await request('/ocorrencias', {
        method: 'POST', token: session?.token,
        body: jsonBody({
          estabelecimentoId: store.id || session?.establishmentId,
          titulo: 'Declaração de Impacto e Perdas',
          descricao: form.get('descricao'), status: 'ENVIADA',
          nivelAlagamento: water === 'Até 5 cm' ? 'LEVE' : water === '5 a 20 cm' ? 'MODERADO' : 'GRAVE',
          dataOcorrencia: form.get('data'), horaInicio: form.get('inicio'), horaFim: form.get('fim') || undefined,
          faixaLaminaAgua: water, categoriasDano: selected.join(', '),
          valorEstimadoPrejuizo: valor ? Number(valor) : undefined,
          horasFechado: horas ? Number(horas) : undefined,
          tamanhoEquipe: equipe ? Number(equipe) : undefined,
        }),
      });
      const responseProtocol = response.protocolo || `#${response.id}`;
      setProtocol(responseProtocol);
      setCreated(true);
      let uploaded = 0;
      let photoError = false;
      for (const file of photos) {
        try {
          const data = new FormData(); data.append('arquivo', file);
          await request(`/ocorrencias/${response.id}/fotos`, { method: 'POST', token: session?.token, body: data });
          uploaded += 1;
        } catch { photoError = true; }
      }
      setStatus(photoError
        ? `Ocorrência registrada (${responseProtocol}); houve falha ao enviar uma ou mais fotos (${uploaded}/${photos.length} enviadas).`
        : 'Ocorrência registrada com sucesso.');
    } catch (reason) {
      setStatus(reason.message);
    } finally { setBusy(false); }
  };

  return <AppShell active="/ocorrencias"><form className="ops-content occurrence" onSubmit={submit}>
    <div className="occ-title"><b>REGISTRO DE OCORRÊNCIA</b><h1>Declaração de Impacto e Perdas</h1><p>Registre a ocorrência no Maré Alerta. O servidor retornará o protocolo de acompanhamento.</p>{protocol && <aside>Protocolo<strong>{protocol}</strong></aside>}</div>
    <section className="form-card"><h2>1. Horário e Lâmina de Água</h2>
      <div className="form-grid">
        <label>Data do alagamento<input name="data" type="date" required /></label>
        <label>Início (subida)<input name="inicio" type="time" required /></label>
        <label>Fim (recuo)<input name="fim" type="time" /></label>
        <div className="water-options" role="radiogroup" aria-label="Altura da lâmina de água">{waterOptions.map(([label, detail]) => <button type="button" role="radio" aria-checked={water === label} className={water === label ? 'active' : ''} onClick={() => setWater(label)} key={label}><b>{label}</b><small>{detail}</small></button>)}</div>
      </div>
    </section>
    <section className="form-card"><h2>2. Danos e Prejuízos Estimados</h2><p>Estrutura ou itens atingidos:</p>
      <div className="choice-row">{damageChoices.map((choice) => <button type="button" aria-pressed={selected.includes(choice)} className={selected.includes(choice) ? 'active' : ''} onClick={() => toggle(choice)} key={choice}>{choice}{selected.includes(choice) && ' ✓'}</button>)}</div>
      <div className="form-grid three">
        <label>Prejuízo material estimado (R$)<input name="valor" type="number" min="0" step="0.01" inputMode="decimal" /></label>
        <label>Horas fechado<input name="horas" type="number" min="0" step="1" /></label>
        <label>Equipe mobilizada<input name="equipe" type="number" min="0" step="1" /></label>
      </div>
    </section>
    <section className="form-card"><h2>3. Descrição e Comprovantes</h2>
      <label>Resumo do ocorrido<textarea name="descricao" /></label>
      <label className="photo-picker">Adicionar fotos<input type="file" accept="image/*" multiple onChange={(event) => setPhotos((items) => [...items, ...Array.from(event.target.files || [])])} /></label>
      <div className="photo-files"><b>Fotos selecionadas ({photos.length})</b>{photos.map((photo, index) => <span key={`${photo.name}-${index}`}>{photo.name}<button type="button" aria-label={`Remover ${photo.name}`} onClick={() => setPhotos((items) => items.filter((_, position) => position !== index))}>×</button></span>)}</div>
    </section>
    <div className="send-card"><span>O envio registra a ocorrência na sua conta. A API não oferece envio de cópia para terceiros.</span></div>
    <footer className="form-footer"><span aria-live="polite">{status}</span><button type="button" onClick={() => window.print()}>Exportar PDF</button><button type="submit" className="primary" disabled={busy || created}>{busy ? 'Enviando…' : created ? 'Ocorrência registrada' : 'Enviar Ocorrência'}</button></footer>
  </form></AppShell>;
}

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const criticalItems = ['Freezer no chão', 'Estoque de secos', 'Caixa registradora / CPU', 'Medicamentos', 'Motores e bombas', 'Fiação baixa'];

export function Establishment() {
  const navigate = useNavigate();
  const { store, updateStore } = useStore();
  const [form, setForm] = useState(store);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (key) => (event) => setForm((data) => ({ ...data, [key]: event.target.value }));
  const choose = (key, value) => setForm((data) => ({ ...data, [key]: value }));
  const toggle = (key, value) => setForm((data) => ({ ...data, [key]: data[key].includes(value) ? data[key].filter((item) => item !== value) : [...data[key], value] }));
  const save = async (event) => {
    event.preventDefault();
    setError(''); setSaving(true);
    try { await updateStore({ ...form, name: form.name.trim() }); navigate('/dashboard'); }
    catch (reason) { setError(reason.message); }
    finally { setSaving(false); }
  };

  return <AppShell active="/estabelecimento"><form className="ops-content establishment" onSubmit={save}>
    <div className="setup-progress"><b>Configuração de proteção do ponto</b><i aria-hidden="true" /></div>
    <h1>Conte-nos sobre o seu negócio em Belém</h1>
    <p>Atualize o endereço e os dados operacionais do estabelecimento vinculado à sua conta.</p>
    <section className="form-card"><h2>Identificação do Estabelecimento</h2>
      <label>Nome comercial do ponto<input value={form.name} onChange={set('name')} required /></label>
      <label>Responsável<input value={form.owner} onChange={set('owner')} /></label>
      <b id="tipo-atividade">Tipo de atividade comercial</b>
      <div className="business-types" role="radiogroup" aria-labelledby="tipo-atividade">{BUSINESS_TYPES.map(([value, label]) => <button type="button" role="radio" aria-checked={form.type === value} className={form.type === value ? 'active' : ''} onClick={() => choose('type', value)} key={value}>{label}</button>)}</div>
    </section>
    <section className="form-card map-card"><h2>Endereço do Estabelecimento</h2>
      <div className="map-details">
        <div>
          <label>Rua / Travessa / Avenida<input value={form.street} onChange={set('street')} placeholder="Ex: Travessa Visconde de Souza Franco" required /></label>
          <label>Número<input value={form.number} onChange={set('number')} inputMode="numeric" placeholder="Ex: 742" /></label>
          <label>Bairro em Belém<select value={form.neighborhood} onChange={set('neighborhood')} required>{NEIGHBORHOODS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Complemento<input value={form.complemento || ''} onChange={set('complemento')} /></label>
          <label>CEP<input value={form.cep || ''} onChange={set('cep')} inputMode="numeric" /></label>
        </div>
      </div>
    </section>
    <div className="two-cards">
      <section className="form-card"><h2>Horário de Funcionamento</h2><b id="dias">Dias de atendimento</b>
        <div className="days" role="group" aria-labelledby="dias">{weekDays.map((day) => <button type="button" aria-pressed={form.days.includes(day)} className={form.days.includes(day) ? 'active' : ''} onClick={() => toggle('days', day)} key={day}>{day}</button>)}</div>
        <label>Abertura<input type="time" value={form.opening} onChange={set('opening')} /></label>
        <label>Fechamento<input type="time" value={form.closing} onChange={set('closing')} /></label>
      </section>
      <section className="form-card"><h2>Itens Críticos na Loja</h2>
        <div className="critical-items">{criticalItems.map((item) => <button type="button" aria-pressed={form.criticalItems.includes(item)} className={form.criticalItems.includes(item) ? 'active' : ''} onClick={() => toggle('criticalItems', item)} key={item}>{item}{form.criticalItems.includes(item) && ' ✓'}</button>)}</div>
      </section>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="save-bar"><span><b>Salvar perfil do estabelecimento</b><small>As alterações serão enviadas ao Maré Alerta.</small></span><button type="submit" className="primary" disabled={saving}>{saving ? 'Salvando…' : 'Salvar estabelecimento →'}</button></div>
  </form></AppShell>;
}
