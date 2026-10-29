import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import mailIcon from '../assets/figma/mail.svg';
import lockIcon from '../assets/figma/lock.svg';
import eyeIcon from '../assets/figma/eye.svg';
import arrowIcon from '../assets/figma/arrow-right.svg';
import shieldIcon from '../assets/figma/shield.svg';
import { useStore } from '../state/store';

function Home() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try { await login(form.get('email'), form.get('password')); navigate('/dashboard'); }
    catch (reason) { setError(reason.message); }
    finally { setBusy(false); }
  };
  return (
    <main className="login-page">
      <ThemeToggle />
      <section className="login-shell" aria-labelledby="login-title">
        <header className="brand-intro">
          <div className="mare-mark" aria-hidden="true"><span className="mare-orb" /><span className="mare-wave mare-wave--one" /><span className="mare-wave mare-wave--two" /></div>
          <Link className="wordmark login-home-link" to="/">Maré Alerta</Link>
          <h1 id="login-title">Acesse sua Conta</h1>
          <p className="intro-copy">Monitore riscos de maré e proteja seu comércio em Belém</p>
        </header>
        <section className="login-card" aria-label="Formulário de acesso">
          <form className="login-form" onSubmit={submit}>
            <div className="field"><label htmlFor="email">E-mail Comercial</label><div className="input-wrap"><img src={mailIcon} alt="" className="input-icon mail-icon" /><input id="email" name="email" type="email" placeholder="contato@seubazar.com.br" autoComplete="email" required /></div></div>
            <div className="field"><div className="field-heading"><label htmlFor="password">Senha</label><button className="text-action recovery" type="button" onClick={() => setNotice('A recuperação de senha ainda não está disponível. Entre em contato com o suporte.')}>Esqueceu sua senha?</button></div><div className="input-wrap"><img src={lockIcon} alt="" className="input-icon lock-icon" /><input id="password" name="password" type={passwordVisible ? 'text' : 'password'} placeholder="Digite sua senha" autoComplete="current-password" required /><button className="password-toggle" type="button" aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={passwordVisible} onClick={() => setPasswordVisible((visible) => !visible)}><img src={eyeIcon} alt="" /></button></div></div>
            <p className="form-notice" aria-live="polite">{error || notice}</p>
            <button className="submit-button" type="submit" disabled={busy}>{busy ? 'Entrando…' : 'Entrar na Plataforma'} {!busy && <img src={arrowIcon} alt="" />}</button>
          </form>
          <p className="signup-copy">Ainda não tem conta? <Link className="signup-link" to="/cadastro">Cadastre seu comércio</Link></p>
        </section>
        <footer className="login-footer"><img src={shieldIcon} alt="" /><span>Sistema de Alerta Preventivo de Alagamentos • Belém/PA</span></footer>
      </section>
    </main>
  );
}

export default Home;
