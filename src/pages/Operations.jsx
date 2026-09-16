import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import map from '../assets/figma/operations/map.png';
import { formatDuration, formatLevel, store, tide } from '../data/tide';

const phases = [
  { id: 'antes', tab: 'Antes da Cheia', title: `ANTES DA CHEIA (JANELA CRÍTICA: ATÉ ${tide.safeUntil})`, priority: 'Prioridade alta', tasks: [
    ['Elevar produtos do primeiro nível das prateleiras (mínimo 20 cm)', 'Corredores 1, 2 e 3', true],
    ['Desconectar nobreaks e extensões rente ao chão', 'Frente de Caixa', true],
    ['Instalar a chapa/comporta de contenção na entrada principal', 'Porta Principal', true],
    ['Recolher a lixeira externa para não entupir o bueiro', 'Calçada', false],
    ['Proteger motor do freezer de sorvetes com calço de borracha (15 cm)', 'Estoque', false],
  ] },
  { id: 'durante', tab: 'Durante a Maré', title: 'DURANTE A MARÉ ALTA (PREVISÃO: 16:00 ÀS 18:30)', priority: 'Prioridade média', tasks: [
    ['Manter a comporta fechada e checar a vedação a cada 30 min', 'Porta Principal', false],
    ['Suspender descargas de mercadoria pela calçada', 'Doca de Carga', false],
  ] },
  { id: 'depois', tab: 'Após Baixar', title: 'APÓS A ÁGUA BAIXAR (A PARTIR DAS 19:00)', priority: 'Prioridade normal', tasks: [
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
        <p><b>{task}</b><small>{complete ? 'Feito por Maria Souza • 10:45' : 'Designado: Equipe de Piso • Até 14:00'}</small></p>
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
      <div><h1>Checklist de Prevenção Operacional</h1><p>Protocolo direto para proteção contra avaria em piso e contenção rápida.</p></div>
      <a className="button" href="https://wa.me/" target="_blank" rel="noreferrer">WhatsApp Equipe</a>
      <button type="button" className="primary">＋ Nova Tarefa</button>
    </div>
    <div className="readiness">
      <div><b>ÍNDICE DE PRONTIDÃO <em>{completed}/{total} concluídas</em></b><h2>{percent}% <small>{completed} de {total} medidas ativas</small></h2><i style={{ '--fill': `${percent}%` }} aria-hidden="true" /></div>
      <span><small>Tempo Restante</small><b>{formatDuration(tide.reading, tide.high.time)}</b><small>Até o pico das {tide.high.time}</small></span>
      <span><small>Cota Prevista</small><b>{formatLevel(tide.high.level)}</b><small>Alerta Moderado</small></span>
      <aside><b>PLANTÃO ATIVO</b><strong>Maria, João e Carlos</strong><small>Responsáveis no piso</small></aside>
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

const alerts = [
  { status: 'VIGENTE AGORA', category: 'Maré Alta', when: 'Hoje às 11:15', source: 'Defesa Civil Municipal', title: `Maré de sizígia (${formatLevel(tide.high.level)}) e chuva convectiva às ${tide.high.time}`, text: 'A incidência de chuva deve se intensificar no fim da tarde. Regiões da Doca, Reduto e Ver-o-Peso têm risco de retenção nas galerias pluviais.', peak: tide.high.level, rain: tide.rain.peak },
  { status: 'FINALIZADO • NORMALIZADO', category: 'Maré Alta', when: '28 de março, 15:30', source: 'Defesa Civil Municipal', title: 'Pico de maré de 3,10 m superado sem transbordamento na Visconde de Souza Franco', text: 'As comportas da Doca escoaram sem refluxo nas calçadas comerciais vizinhas. Comércio manteve operação segura.', peak: 3.1, rain: 12 },
  { status: 'REGISTRO HISTÓRICO • CHUVA SEVERA', category: 'Chuva Torrencial', when: '14 de março, 17:05', source: 'Defesa Civil Municipal', title: 'Chuva severa de 65 mm com maré de 3,62 m — barreiras acionadas', text: 'Transbordamento pontual na Rua Gaspar Vianna e Av. Portugal. A antecipação permitiu zero perdas de estoque nas 31 lojas cadastradas.', peak: 3.62, rain: 65 },
  { status: 'REDE COMUNITÁRIA', category: 'Comunidade', when: '9 de março, 08:40', source: 'Lojista do Mercado da Carne', title: 'Lâmina de 10 cm no acostamento do Mercado da Carne', text: 'Água restrita à via de veículos. Sem invasão a boxes fechados, mas exigiu cautela no fluxo de descargas de pescado.', peak: 2.95, rain: 18 },
];
const filters = ['Todos', 'Maré Alta', 'Chuva Torrencial', 'Comunidade'];

export function History() {
  const [filter, setFilter] = useState('Todos');
  const [shared, setShared] = useState(null);
  const visible = filter === 'Todos' ? alerts : alerts.filter((alert) => alert.category === filter);
  const maxPeak = Math.max(...alerts.map((alert) => alert.peak));
  const share = async (alert) => {
    const text = `${alert.title} — ${alert.when}`;
    try { await navigator.clipboard.writeText(text); setShared(alert.title); } catch { setShared(null); }
  };

  return <AppShell active="/historico"><div className="ops-content">
    <div className="history-title"><b>BOLETINS & REDE DE LOJISTAS</b><h1>Histórico de Alertas</h1><p>Acompanhe os avisos fluviométricos da {tide.station} e registros de campo da comunidade comercial.</p><Link className="button primary" to="/ocorrencias">Emitir Alerta da Minha Rua</Link></div>
    <div className="history-stats"><b><small>Em andamento</small>1 alerta ativo</b><b><small>Pico de maré (março)</small>{formatLevel(maxPeak)}</b><b><small>Prevenção</small>94% de eficácia</b><b><small>Lojistas conectados</small>42 estabelecimentos</b></div>
    <div className="tabs history-tabs">
      <div role="tablist" aria-label="Filtrar alertas">{filters.map((item) => {
        const count = item === 'Todos' ? alerts.length : alerts.filter((alert) => alert.category === item).length;
        return <button type="button" role="tab" aria-selected={filter === item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item} ({count})</button>;
      })}</div>
      <select aria-label="Mês"><option>Março 2025</option></select>
    </div>
    <p className="sr-only" aria-live="polite">{shared ? `Copiado: ${shared}` : ''}</p>
    <div className="alert-list">{visible.map((alert) => <article className={alert.status === 'VIGENTE AGORA' ? 'current' : ''} key={alert.title}>
      <header><b>{alert.status}</b><span>{alert.when} • {alert.source}</span></header>
      <h3>{alert.title}</h3><p>{alert.text}</p>
      <footer><span>Pico: <b>{formatLevel(alert.peak)}</b> • Chuva: {alert.rain} mm</span><button type="button" className="link-button" onClick={() => share(alert)}>{shared === alert.title ? 'Copiado ✓' : 'Compartilhar'}</button></footer>
    </article>)}</div>
    <div className="community"><span><b>Rede Comunitária Maré Alerta</b><small>Lojistas do seu quarteirão avisando com antecedência para erguer estoques e fixar comportas.</small></span><a className="button primary" href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer">Entrar no Grupo WhatsApp</a></div>
  </div></AppShell>;
}

const waterOptions = [['Até 5 cm', 'Apenas calçada'], ['5 a 20 cm', 'Entrou no salão'], ['Acima de 20 cm', 'Salão alagado']];
const damageChoices = ['Mercadorias / Estoque', 'Equipamentos elétricos', 'Paredes e rodapés', 'Comércio fechado', 'Caixa / Balança'];

export function Occurrences() {
  const [selected, setSelected] = useState(['Mercadorias / Estoque', 'Comércio fechado']);
  const [water, setWater] = useState('5 a 20 cm');
  const [photos, setPhotos] = useState(['piso_salao.jpg', 'comporta_rua.jpg', 'calcada_via.jpg']);
  const [status, setStatus] = useState('Rascunho salvo automaticamente');
  const toggle = (choice) => setSelected((items) => items.includes(choice) ? items.filter((item) => item !== choice) : [...items, choice]);

  return <AppShell active="/ocorrencias"><form className="ops-content occurrence" onSubmit={(event) => { event.preventDefault(); setStatus('Registro finalizado e enviado ✓'); }}>
    <div className="occ-title"><b>REGISTRO OFICIAL DE OCORRÊNCIA</b><h1>Declaração de Impacto e Perdas</h1><p>Gere o relatório estruturado com validade para Defesa Civil, pleito de isenções e seguradoras.</p><aside>Protocolo atual<strong>MA-2025/0388</strong></aside></div>
    <section className="form-card"><h2>1. Horário e Lâmina de Água</h2>
      <div className="form-grid">
        <label>Data do alagamento<input type="date" defaultValue="2025-03-29" required /></label>
        <label>Início (subida)<input type="time" defaultValue="16:20" required /></label>
        <label>Fim (recuo)<input type="time" defaultValue="18:45" /></label>
        <div className="water-options" role="radiogroup" aria-label="Altura da lâmina de água">{waterOptions.map(([label, detail]) => <button type="button" role="radio" aria-checked={water === label} className={water === label ? 'active' : ''} onClick={() => setWater(label)} key={label}><b>{label}</b><small>{detail}</small></button>)}</div>
      </div>
      <p className="form-note">Preamar oficial na baía: {formatLevel(tide.high.level)} às {tide.high.time}</p>
    </section>
    <section className="form-card"><h2>2. Danos e Prejuízos Estimados</h2><p>Estrutura ou itens atingidos:</p>
      <div className="choice-row">{damageChoices.map((choice) => <button type="button" aria-pressed={selected.includes(choice)} className={selected.includes(choice) ? 'active' : ''} onClick={() => toggle(choice)} key={choice}>{choice}{selected.includes(choice) && ' ✓'}</button>)}</div>
      <div className="form-grid three">
        <label>Prejuízo material estimado<input defaultValue="R$ 1.850,00" inputMode="decimal" /></label>
        <label>Horas fechado<input type="number" min="0" defaultValue="6" /></label>
        <label>Equipe mobilizada<input type="number" min="0" defaultValue="3" /></label>
      </div>
    </section>
    <section className="form-card"><h2>3. Descrição e Comprovantes</h2>
      <label>Resumo do ocorrido<textarea defaultValue="Por volta das 16h20 a maré retornou pelo bueiro da via e atingiu o piso do salão comercial. A comporta de alumínio reduziu a entrada, retendo perdas maiores." /></label>
      <div className="photo-files"><b>Fotos e registros visuais ({photos.length} anexados)</b>{photos.map((photo) => <span key={photo}>{photo}<button type="button" aria-label={`Remover ${photo}`} onClick={() => setPhotos((items) => items.filter((item) => item !== photo))}>×</button></span>)}</div>
    </section>
    <div className="send-card"><label><input type="checkbox" defaultChecked /> Enviar cópia para a Defesa Civil de Belém e a Associação</label></div>
    <footer className="form-footer"><span aria-live="polite">{status}</span><button type="button" onClick={() => window.print()}>Exportar PDF</button><button type="submit" className="primary">Finalizar Registro</button></footer>
  </form></AppShell>;
}

const businessTypes = ['Mercado', 'Alimentação', 'Farmácia', 'Beleza', 'Oficina', 'Loja / Varejo'];
const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const criticalItems = ['Freezer no chão', 'Estoque de secos', 'Caixa registradora / CPU', 'Medicamentos', 'Motores e bombas', 'Fiação baixa'];

export function Establishment() {
  const navigate = useNavigate();
  const [type, setType] = useState('Mercado');
  const [days, setDays] = useState(['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']);
  const [items, setItems] = useState(['Freezer no chão', 'Estoque de secos', 'Caixa registradora / CPU', 'Fiação baixa']);
  const toggle = (value, set) => set((state) => state.includes(value) ? state.filter((item) => item !== value) : [...state, value]);

  return <AppShell active="/estabelecimento"><form className="ops-content establishment" onSubmit={(event) => { event.preventDefault(); navigate('/dashboard'); }}>
    <div className="setup-progress"><b>Configuração de proteção do ponto</b><i aria-hidden="true" /></div>
    <h1>Conte-nos sobre o seu negócio em Belém</h1>
    <p>Personalizamos alertas de preamar e pontos críticos de alagamento exatamente para a cota da sua rua.</p>
    <section className="form-card"><h2>Identificação do Estabelecimento</h2><p>Seu comércio entra na rede de vizinhos que já reconhecem você.</p>
      <label>Nome comercial do ponto<input defaultValue={store.name} required /></label>
      <b id="tipo-atividade">Tipo de atividade comercial</b>
      <div className="business-types" role="radiogroup" aria-labelledby="tipo-atividade">{businessTypes.map((item) => <button type="button" role="radio" aria-checked={type === item} className={type === item ? 'active' : ''} onClick={() => setType(item)} key={item}>{item}</button>)}</div>
    </section>
    <section className="form-card map-card"><h2>Localização no Mapa Hidrológico de Belém</h2>
      <div className="map-details">
        <div>
          <label>Rua / Travessa / Avenida<input defaultValue="Travessa Visconde de Souza Franco (Doca)" /></label>
          <label>Número<input defaultValue="742" inputMode="numeric" /></label>
          <label>Bairro em Belém<input defaultValue={`${store.neighborhood} (Bacia do Reduto)`} /></label>
          <aside><b>Análise: Calha da Doca</b><p>Fluxo de águas pluviais durante marés na {tide.station} acima de 3,20 m combinado com chuvas vespertinas.</p></aside>
        </div>
        <img src={map} alt="Mapa hidrológico de Belém com a localização do ponto" />
      </div>
    </section>
    <div className="two-cards">
      <section className="form-card"><h2>Horário de Funcionamento</h2><b id="dias">Dias de atendimento</b>
        <div className="days" role="group" aria-labelledby="dias">{weekDays.map((day) => <button type="button" aria-pressed={days.includes(day)} className={days.includes(day) ? 'active' : ''} onClick={() => toggle(day, setDays)} key={day}>{day}</button>)}</div>
        <label>Abertura<input type="time" defaultValue="07:30" /></label>
        <label>Fechamento<input type="time" defaultValue="19:00" /></label>
      </section>
      <section className="form-card"><h2>Itens Críticos na Loja</h2>
        <div className="critical-items">{criticalItems.map((item) => <button type="button" aria-pressed={items.includes(item)} className={items.includes(item) ? 'active' : ''} onClick={() => toggle(item, setItems)} key={item}>{item}{items.includes(item) && ' ✓'}</button>)}</div>
      </section>
    </div>
    <div className="save-bar"><span><b>Pronto para conectar seu ponto</b><small>Você poderá adicionar fotos e atualizar contatos a qualquer momento.</small></span><button type="submit" className="primary">Salvar e ver o nível de risco do meu ponto →</button></div>
  </form></AppShell>;
}
