import { useState } from 'react';
import { Link } from 'react-router-dom';
import mailIcon from '../assets/figma/mail.svg';
import lockIcon from '../assets/figma/eye.svg';
import eyeIcon from '../assets/figma/arrow-right.svg';
import arrowIcon from '../assets/figma/shield.svg';
import badgeIcon from '../assets/figma/lock.svg';
import '../App.css';

function Home() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <header className="brand-intro">
          <div className="mare-mark" aria-hidden="true"><span className="mare-orb" /><span className="mare-wave mare-wave--one" /><span className="mare-wave mare-wave--two" /></div>
          <p className="wordmark">Maré Alerta</p>
          <h1 id="login-title">Acesse sua Conta</h1>
          <p className="intro-copy">Monitore riscos de maré e proteja seu comércio em Belém</p>
        </header>
        <section className="login-card" aria-label="Formulário de acesso">
          <form className="login-form" onSubmit={(event) => event.preventDefault()}>
            <div className="field"><label htmlFor="email">E-mail Comercial</label><div className="input-wrap"><img src={mailIcon} alt="" className="input-icon mail-icon" /><input id="email" name="email" type="email" placeholder="contato@seubazar.com.br" autoComplete="email" /></div></div>
            <div className="field"><div className="field-heading"><label htmlFor="password">Senha</label><button className="text-action recovery" type="button">Esqueceu sua senha?</button></div><div className="input-wrap"><img src={lockIcon} alt="" className="input-icon lock-icon" /><input id="password" name="password" type={passwordVisible ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" /><button className="password-toggle" type="button" aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setPasswordVisible((visible) => !visible)}><img src={eyeIcon} alt="" /></button></div></div>
            <Link className="submit-button" to="/dashboard">Entrar na Plataforma <img src={arrowIcon} alt="" /></Link>
          </form>
          <p className="signup-copy">Ainda não tem conta? <Link className="signup-link" to="/cadastro">Cadastre seu comércio</Link></p>
        </section>
        <footer className="login-footer"><img src={badgeIcon} alt="" /><span>Sistema de Alerta Preventivo de Alagamentos • Belém/PA</span></footer>
      </section>
    </main>
  );
}

export default Home;
