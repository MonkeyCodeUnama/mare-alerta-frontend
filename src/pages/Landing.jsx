import { ArrowDown, ArrowRight, BellRing, ClipboardList, MapPin, Waves } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { useStore } from '../state/store';
import './Landing.css';

function RiverGraphic() {
  return <div className="landing-river-art" aria-hidden="true">
    <div className="river-art-label"><span /> BAÍA DO GUAJARÁ <small>· BELÉM, PA</small></div>
    <svg viewBox="0 0 620 520" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className="river-contour river-contour--outer" d="M-38 376C63 323 77 212 183 205c83-6 89 71 172 57 85-14 96-119 206-137 59-10 102 18 119 32" />
      <path className="river-contour river-contour--mid" d="M-40 409C72 354 94 247 190 240c81-6 97 68 169 54 77-15 105-110 198-129 60-12 103 14 135 39" />
      <path className="river-contour river-contour--inner" d="M-38 443C78 389 109 283 199 276c73-6 103 62 164 49 70-15 114-99 188-119 57-15 105 8 144 43" />
      <path className="river-flow" d="M-26 343C76 289 74 177 179 171c89-5 87 78 178 63 90-15 93-132 210-151 58-9 103 21 128 45" />
      <path className="river-flow river-flow--fine" d="M-36 474C89 424 127 320 209 312c68-7 108 56 159 45 62-14 121-88 180-108 55-19 108 1 150 43" />
      <path className="river-bank" d="M59 520C114 445 171 400 235 390c65-10 95 19 156 8 67-12 103-68 166-76" />
      <circle className="river-point" cx="357" cy="226" r="8" />
      <circle className="river-point-halo" cx="357" cy="226" r="19" />
      <path className="river-marker" d="M357 218v-80h76" />
    </svg>
    <div className="river-art-note"><Waves size={15} /> Risco e alertas em um só lugar</div>
    <span className="river-art-coordinate">MARÉ · CHUVA · RUA</span>
  </div>;
}

const features = [
  { icon: Waves, title: 'Acompanhe o risco atual', text: 'Consulte o cenário de risco e o pico previsto para a localidade do seu estabelecimento.' },
  { icon: BellRing, title: 'Veja os alertas', text: 'Acesse os avisos disponíveis e compartilhe a mensagem com sua equipe.' },
  { icon: ClipboardList, title: 'Registre o que aconteceu', text: 'Envie os dados de uma ocorrência, anexe fotos e guarde o protocolo retornado.' },
];

export default function Landing() {
  const { authenticated } = useStore();
  const dashboardPath = authenticated ? '/dashboard' : '/entrar';
  return <main className="landing-page">
    <header className="landing-header">
      <Link to="/" className="landing-brand" aria-label="Maré Alerta, início"><span className="landing-brand-icon"><Waves size={20} strokeWidth={2.2} /></span><span>maré<span> alerta</span></span></Link>
      <nav className="landing-nav" aria-label="Navegação da página"><a href="#recursos">O que você encontra</a><a href="#comecar">Como começar</a></nav>
      <div className="landing-header-actions"><ThemeToggle /><Link className="landing-login" to={dashboardPath}>{authenticated ? 'Meu painel' : 'Entrar'}</Link><Link className="landing-header-cta" to={authenticated ? '/dashboard' : '/cadastro'}>{authenticated ? 'Abrir painel' : 'Criar conta'} <ArrowRight size={15} /></Link></div>
    </header>

    <section className="landing-hero">
      <div className="landing-hero-copy">
        <p className="landing-eyebrow"><MapPin size={14} /> PARA QUEM EMPREENDE EM BELÉM</p>
        <h1>A água muda.<br /><em>Seu comércio</em><br />pode se preparar.</h1>
        <p className="landing-lede">Acompanhe o risco atual, consulte alertas e registre impactos no seu estabelecimento. Informação prática para decidir os próximos passos.</p>
        <div className="landing-hero-actions"><Link className="landing-primary" to={authenticated ? '/dashboard' : '/cadastro'}>{authenticated ? 'Abrir meu painel' : 'Criar conta'} <ArrowRight size={17} /></Link><Link className="landing-secondary" to={dashboardPath}>{authenticated ? 'Ver painel' : 'Já tenho uma conta'}</Link></div>
        <div className="landing-footnote"><span className="landing-pulse" /> Ferramentas para a rotina do comércio local</div>
      </div>
      <RiverGraphic />
      <a className="landing-scroll" href="#recursos" aria-label="Conheça os recursos"><ArrowDown size={16} /></a>
    </section>

    <section className="landing-intro" id="recursos">
      <div className="landing-section-heading"><p className="landing-eyebrow">UM APOIO PARA O DIA A DIA</p><h2>Da informação à ação,<br /><span>no mesmo lugar.</span></h2><p>O Maré Alerta reúne ferramentas para você acompanhar o cenário e documentar o que acontece no seu ponto.</p></div>
      <div className="landing-features">{features.map(({ icon: Icon, title, text }) => <article className="landing-feature" key={title}><span className="landing-feature-icon"><Icon size={20} strokeWidth={1.8} /></span><h3>{title}</h3><p>{text}</p><Link to={authenticated ? '/dashboard' : '/cadastro'} aria-label={`${title}: ${authenticated ? 'abrir painel' : 'criar conta'}`}><ArrowRight size={17} /></Link></article>)}</div>
    </section>

    <section className="landing-start" id="comecar">
      <div><p className="landing-eyebrow">COMECE PELO SEU PONTO</p><h2>Uma conta para<br />acompanhar sua operação.</h2><p>Cadastre seu estabelecimento, complete o perfil e use o painel para consultar o risco e registrar ocorrências.</p><Link className="landing-primary" to={authenticated ? '/dashboard' : '/cadastro'}>{authenticated ? 'Ir para o painel' : 'Cadastrar meu comércio'} <ArrowRight size={17} /></Link></div>
      <div className="landing-start-list"><div><span><MapPin size={17} /></span><p><b>Cadastre seu comércio</b><small>Informe nome, documento e bairro.</small></p></div><div><span><Waves size={17} /></span><p><b>Complete seu perfil</b><small>Adicione endereço e dados da operação.</small></p></div><div><span><ClipboardList size={17} /></span><p><b>Consulte e registre</b><small>Acesse o risco, os alertas e o registro de ocorrência.</small></p></div></div>
    </section>

    <footer className="landing-footer"><Link to="/" className="landing-brand"><span className="landing-brand-icon"><Waves size={18} /></span><span>maré<span> alerta</span></span></Link><p>Informação para quem movimenta Belém.</p><Link to="/entrar">Acessar plataforma <ArrowRight size={14} /></Link></footer>
  </main>;
}
