import { useState } from 'react';
import { Link } from 'react-router-dom';
import storeIcon from '../assets/figma/register/store.svg';
import documentIcon from '../assets/figma/register/document.svg';
import locationIcon from '../assets/figma/register/location.svg';
import chevronIcon from '../assets/figma/register/chevron.svg';
import checkIcon from '../assets/figma/register/check.svg';
import summaryIcon from '../assets/figma/register/summary.svg';
import editIcon from '../assets/figma/register/edit.svg';
import mailIcon from '../assets/figma/register/mail.svg';
import lockIcon from '../assets/figma/eye.svg';
import eyeIcon from '../assets/figma/arrow-right.svg';
import arrowIcon from '../assets/figma/shield.svg';
import '../App.css';

const initialBusiness = { name: '', cnpj: '', neighborhood: '' };

function BrandHeader({ step }) {
  return <header className="register-intro">
    <div className="mare-mark" aria-hidden="true"><span className="mare-orb" /><span className="mare-wave mare-wave--one" /><span className="mare-wave mare-wave--two" /></div>
    <p className="wordmark">Maré Alerta</p><h1>Criar conta de Comerciante</h1>
    <p className="intro-copy">{step === 1 ? 'Passo 1 de 2: Identificação do seu negócio em Belém' : 'Passo 2 de 2: Credenciais de acesso e segurança'}</p>
  </header>;
}

function Stepper({ step }) {
  return <div className={`stepper stepper--${step}`} aria-label={`Etapa ${step} de 2`}>
    <span className="stepper-line" />
    <div className="stepper-item"><span className="step-dot">{step === 2 ? <img src={checkIcon} alt="Concluída" /> : '1'}</span><span><b>ETAPA 1 {step === 1 ? '(ATIVA)' : 'CONCLUÍDA'}</b><strong>Dados do Comércio</strong></span></div>
    <div className="stepper-item"><span className="step-dot">2</span><span><b>ETAPA 2 {step === 2 ? '(ATIVA)' : ''}</b><strong>Acesso &amp; Senha</strong></span></div>
  </div>;
}

function InputField({ icon, label, children, hint }) {
  return <div className="field"><div className="field-heading"><label>{label}</label>{hint && <span className="field-hint">{hint}</span>}</div><div className="input-wrap register-input"><img className="input-icon" src={icon} alt="" />{children}</div></div>;
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState(initialBusiness);
  const [credentials, setCredentials] = useState({ email: 'contato@merceriaveropeso.com.br', password: 'Veropeso2024!', confirmation: 'Veropeso2024!' });
  const [showPassword, setShowPassword] = useState(false);
  const updateBusiness = (key) => (event) => setBusiness((data) => ({ ...data, [key]: event.target.value }));
  const updateCredentials = (key) => (event) => setCredentials((data) => ({ ...data, [key]: event.target.value }));
  const summaryName = business.name || 'Mercearia do Ver-o-Peso';
  const summaryNeighborhood = business.neighborhood || 'Campina';

  return <main className="login-page register-page"><section className="login-shell" aria-labelledby="register-title">
    <BrandHeader step={step} />
    <section className="login-card register-card"><Stepper step={step} />
      {step === 1 ? <form className="register-form" onSubmit={(event) => { event.preventDefault(); setStep(2); }}>
        <InputField label="Nome do Estabelecimento ou Responsável" icon={storeIcon}><input aria-label="Nome do Estabelecimento ou Responsável" value={business.name} onChange={updateBusiness('name')} placeholder="Ex: Mercearia do Ver-o-Peso" /></InputField>
        <InputField label="CNPJ" icon={documentIcon}><input aria-label="CNPJ" value={business.cnpj} onChange={updateBusiness('cnpj')} placeholder="00.000.000/0001-00" inputMode="numeric" /></InputField>
        <InputField label="Bairro em Belém" icon={locationIcon}><select aria-label="Bairro em Belém" value={business.neighborhood} onChange={updateBusiness('neighborhood')}><option value="" disabled>Selecione o bairro</option><option>Campina</option><option>Marco</option><option>Nazaré</option><option>Umarizal</option></select><img className="select-chevron" src={chevronIcon} alt="" /></InputField>
        <button className="submit-button" type="submit">Continuar para Etapa 2 <img src={arrowIcon} alt="" /></button>
      </form> : <form className="register-form" onSubmit={(event) => { event.preventDefault(); }}>
        <div className="business-summary"><div><img src={summaryIcon} alt="" /><span><b>{summaryName}</b><small>Bairro: {summaryNeighborhood} • Comércio</small></span></div><button type="button" className="text-action" onClick={() => setStep(1)}><img src={editIcon} alt="" />Editar</button></div>
        <InputField label="E-mail Comercial" hint="Para alertas e login" icon={mailIcon}><input aria-label="E-mail Comercial" value={credentials.email} onChange={updateCredentials('email')} type="email" /></InputField>
        <InputField label="Criar Senha" icon={lockIcon}><input aria-label="Criar Senha" value={credentials.password} onChange={updateCredentials('password')} type={showPassword ? 'text' : 'password'} /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}><img src={eyeIcon} alt="" /></button></InputField>
        <InputField label="Confirmar Senha" icon={lockIcon}><input aria-label="Confirmar Senha" value={credentials.confirmation} onChange={updateCredentials('confirmation')} type={showPassword ? 'text' : 'password'} /></InputField>
        <p className="password-note">Use pelo menos 8 caracteres, incluindo letra maiúscula, número e símbolo.</p>
        <button className="submit-button" type="submit">Criar minha conta <img src={arrowIcon} alt="" /></button>
      </form>}
      <p className="signup-copy">Já tem uma conta? <Link className="signup-link" to="/">Entrar</Link></p>
    </section>
    <footer className="login-footer"><img src={documentIcon} alt="" /><span>Dados protegidos de acordo com a LGPD • Defesa Civil de Belém</span></footer>
  </section></main>;
}
