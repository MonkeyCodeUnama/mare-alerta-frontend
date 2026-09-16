import { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { NEIGHBORHOODS, useStore } from '../state/store';
import storeIcon from '../assets/figma/register/store.svg';
import documentIcon from '../assets/figma/register/document.svg';
import locationIcon from '../assets/figma/register/location.svg';
import chevronIcon from '../assets/figma/register/chevron.svg';
import checkIcon from '../assets/figma/register/check.svg';
import summaryIcon from '../assets/figma/register/summary.svg';
import editIcon from '../assets/figma/register/edit.svg';
import mailIcon from '../assets/figma/register/mail.svg';
import lockIcon from '../assets/figma/lock.svg';
import eyeIcon from '../assets/figma/eye.svg';
import arrowIcon from '../assets/figma/arrow-right.svg';
import shieldIcon from '../assets/figma/shield.svg';

const initialBusiness = { name: '', cnpj: '', neighborhood: '' };
const initialCredentials = { email: '', password: '', confirmation: '' };
const CNPJ_DIGITS = 14;
const onlyDigits = (value) => value.replace(/\D/g, '').slice(0, CNPJ_DIGITS);
// Formata progressivamente como 00.000.000/0000-00.
function formatCnpj(value) {
  const digits = onlyDigits(value);
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function BrandHeader({ step }) {
  return <header className="register-intro">
    <div className="mare-mark" aria-hidden="true"><span className="mare-orb" /><span className="mare-wave mare-wave--one" /><span className="mare-wave mare-wave--two" /></div>
    <p className="wordmark">Maré Alerta</p><h1 id="register-title">Criar conta de Comerciante</h1>
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

function InputField({ icon, label, hint, render }) {
  const id = useId();
  return <div className="field"><div className="field-heading"><label htmlFor={id}>{label}</label>{hint && <span className="field-hint">{hint}</span>}</div><div className="input-wrap register-input"><img className="input-icon" src={icon} alt="" />{render(id)}</div></div>;
}

export default function Register() {
  const navigate = useNavigate();
  const { updateStore } = useStore();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState(initialBusiness);
  const [credentials, setCredentials] = useState(initialCredentials);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const updateBusiness = (key) => (event) => setBusiness((data) => ({ ...data, [key]: event.target.value }));
  const [cnpjError, setCnpjError] = useState('');
  const updateCnpj = (event) => { setCnpjError(''); setBusiness((data) => ({ ...data, cnpj: formatCnpj(event.target.value) })); };
  const submitBusiness = (event) => {
    event.preventDefault();
    if (onlyDigits(business.cnpj).length !== CNPJ_DIGITS) return setCnpjError('Informe os 14 dígitos do CNPJ.');
    setStep(2);
  };
  const updateCredentials = (key) => (event) => setCredentials((data) => ({ ...data, [key]: event.target.value }));

  const submitCredentials = (event) => {
    event.preventDefault();
    if (!PASSWORD_RULE.test(credentials.password)) return setError('A senha precisa ter 8 caracteres, com letra maiúscula, número e símbolo.');
    if (credentials.password !== credentials.confirmation) return setError('As senhas não conferem.');
    setError('');
    // Um cadastro novo substitui o estabelecimento de demonstração; o endereço é preenchido na próxima tela.
    updateStore({ name: business.name.trim(), owner: '', cnpj: business.cnpj, neighborhood: business.neighborhood, email: credentials.email, street: '', number: '', criticalItems: [] });
    navigate('/estabelecimento');
  };

  return <main className="login-page register-page"><ThemeToggle /><section className="login-shell" aria-labelledby="register-title">
    <BrandHeader step={step} />
    <section className="login-card register-card"><Stepper step={step} />
      {step === 1 ? <form className="register-form" onSubmit={submitBusiness}>
        <InputField label="Nome do Estabelecimento ou Responsável" icon={storeIcon} render={(id) => <input id={id} value={business.name} onChange={updateBusiness('name')} placeholder="Ex: Mercearia do Ver-o-Peso" autoComplete="organization" required />} />
        <InputField label="CNPJ" icon={documentIcon} render={(id) => <input id={id} value={business.cnpj} onChange={updateCnpj} placeholder="00.000.000/0001-00" inputMode="numeric" maxLength={18} pattern="\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}" title="Informe os 14 dígitos do CNPJ" aria-invalid={Boolean(cnpjError)} aria-describedby={cnpjError ? 'cnpj-error' : undefined} required />} />
        <InputField label="Bairro em Belém" icon={locationIcon} render={(id) => <><select id={id} value={business.neighborhood} onChange={updateBusiness('neighborhood')} required><option value="" disabled>Selecione o bairro</option>{NEIGHBORHOODS.map((name) => <option key={name}>{name}</option>)}</select><img className="select-chevron" src={chevronIcon} alt="" /></>} />
        {cnpjError && <p className="form-error" id="cnpj-error" role="alert">{cnpjError}</p>}
        <button className="submit-button" type="submit">Continuar para Etapa 2 <img src={arrowIcon} alt="" /></button>
      </form> : <form className="register-form" onSubmit={submitCredentials}>
        <div className="business-summary"><div><img src={summaryIcon} alt="" /><span><b>{business.name}</b><small>Bairro: {business.neighborhood} • Comércio</small></span></div><button type="button" className="text-action" onClick={() => setStep(1)}><img src={editIcon} alt="" />Editar</button></div>
        <InputField label="E-mail Comercial" hint="Para alertas e login" icon={mailIcon} render={(id) => <input id={id} value={credentials.email} onChange={updateCredentials('email')} type="email" autoComplete="email" placeholder="contato@seubazar.com.br" required />} />
        <InputField label="Criar Senha" icon={lockIcon} render={(id) => <><input id={id} value={credentials.password} onChange={updateCredentials('password')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" aria-describedby="password-note" required /><button className="password-toggle" type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}><img src={eyeIcon} alt="" /></button></>} />
        <InputField label="Confirmar Senha" icon={lockIcon} render={(id) => <input id={id} value={credentials.confirmation} onChange={updateCredentials('confirmation')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" required />} />
        <p className="password-note" id="password-note">Use pelo menos 8 caracteres, incluindo letra maiúscula, número e símbolo.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="submit-button" type="submit">Criar minha conta <img src={arrowIcon} alt="" /></button>
      </form>}
      <p className="signup-copy">Já tem uma conta? <Link className="signup-link" to="/">Entrar</Link></p>
    </section>
    <footer className="login-footer"><img src={shieldIcon} alt="" /><span>Dados protegidos de acordo com a LGPD • Defesa Civil de Belém</span></footer>
  </section></main>;
}
