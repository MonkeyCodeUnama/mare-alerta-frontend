import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Store,
  UserPlus,
} from 'lucide-react';
import { authApi } from '../../shared/api/client';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import {
  BUSINESS_TYPES,
  NEIGHBORHOODS,
  formatPhoneInput,
  isValidPhoneBR,
  normalizeBrPhoneDigits,
} from '../../shared/lib/formatters';
import type { TipoNegocio } from '../../shared/api/types';

interface AuthFormsProps {
  mode: 'login' | 'register';
}

const NEIGHBORHOOD_OPTIONS: readonly CustomSelectOption[] = NEIGHBORHOODS.map((b) => ({
  value: b.codigo,
  label: b.descricao,
}));

const BUSINESS_OPTIONS: readonly CustomSelectOption[] = BUSINESS_TYPES.map((bt) => ({
  value: bt.value,
  label: bt.label,
}));

export default function AuthForms({ mode }: AuthFormsProps) {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>(mode);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bairro, setBairro] = useState('CAMPINA');
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>('MERCADO');
  const [submitting, setSubmitting] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetLoadingState = () => {
      setSubmitting(false);
      setCheckingEmail(false);
    };
    resetLoadingState();
    window.addEventListener('pageshow', resetLoadingState);
    window.addEventListener('focus', resetLoadingState);
    window.addEventListener('popstate', resetLoadingState);
    return () => {
      window.removeEventListener('pageshow', resetLoadingState);
      window.removeEventListener('focus', resetLoadingState);
      window.removeEventListener('popstate', resetLoadingState);
    };
  }, []);

  function switchMode(next: 'login' | 'register') {
    if (next === activeMode) return;
    setActiveMode(next);
    setRegisterStep(1);
    setSubmitting(false);
    setCheckingEmail(false);
    setError(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', next === 'register' ? '/cadastro' : '/entrar');
      document.title =
        next === 'register' ? 'Criar Conta — Maré Alerta' : 'Entrar — Maré Alerta';
      window.dispatchEvent(new CustomEvent('auth-mode-changed', { detail: next }));
    }
  }

  function handleTabClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    next: 'login' | 'register'
  ) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    switchMode(next);
  }

  async function validateAndAdvanceToStep2() {
    setError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }
    if (senha.length < 8) {
      setError('Sua senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    setCheckingEmail(true);
    try {
      const check = await authApi.verificarEmail(trimmedEmail);
      if (!check.disponivel) {
        setError('Este e-mail já está cadastrado. Faça login ou utilize outro endereço.');
        return;
      }
      setRegisterStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível validar o e-mail agora. Tente novamente.'
      );
    } finally {
      setCheckingEmail(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (activeMode === 'register' && registerStep === 1) {
      await validateAndAdvanceToStep2();
      return;
    }

    if (activeMode === 'register') {
      if (!nomeEstabelecimento.trim()) {
        setError('Informe o nome do seu estabelecimento.');
        return;
      }
      if (!isValidPhoneBR(telefone)) {
        setError('Informe um número de WhatsApp válido com DDD (10 ou 11 dígitos).');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (activeMode === 'login') {
        await authApi.login({ email: email.trim(), senha });
      } else {
        const cleanPhone = normalizeBrPhoneDigits(telefone);
        await authApi.register({
          email: email.trim(),
          senha,
          estabelecimento: {
            nome: nomeEstabelecimento.trim(),
            telefone: cleanPhone || undefined,
            bairro,
            tipoNegocio,
            municipio: 'Belém',
            uf: 'PA',
          },
        });
      }
      setSubmitting(false);
      window.location.href = '/dashboard';
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir o acesso. Confira seus dados e tente novamente.'
      );
      setSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-[var(--color-border-editorial)] bg-[var(--color-surface)] pl-10 pr-3.5 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)]/15 transition-colors';

  const fieldIconClass =
    'w-4 h-4 text-[var(--color-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center';

  return (
    <div className="space-y-5">
      <div className="space-y-3.5">
        <a
          href="/"
          className="font-brand-jp text-lg font-bold tracking-[0.06em] whitespace-nowrap select-none inline-flex items-baseline gap-1.5"
        >
          <span className="text-[var(--color-text-primary)]">MARÉ</span>
          <span className="brand-alerta-flow">ALERTA</span>
        </a>

        <h1 className="font-editorial text-[28px] sm:text-[34px] font-medium tracking-tight leading-tight text-[var(--color-text-primary)]">
          {activeMode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h1>

        {/* Alternador segmentado moderno Entrar / Criar conta */}
        <div
          role="tablist"
          aria-label="Alternar entre entrar e criar conta"
          className="grid grid-cols-2 p-1 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-editorial)]"
        >
          <a
            href="/entrar"
            role="tab"
            aria-selected={activeMode === 'login'}
            onClick={(e) => handleTabClick(e, 'login')}
            className={`py-2 px-3 rounded-[9px] text-center text-xs sm:text-[13px] font-medium transition-all duration-150 ${
              activeMode === 'login'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[0_1px_2px_rgba(11,22,38,0.08)] ring-1 ring-[var(--color-border-editorial)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Entrar
          </a>
          <a
            href="/cadastro"
            role="tab"
            aria-selected={activeMode === 'register'}
            onClick={(e) => handleTabClick(e, 'register')}
            className={`py-2 px-3 rounded-[9px] text-center text-xs sm:text-[13px] font-medium transition-all duration-150 ${
              activeMode === 'register'
                ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[0_1px_2px_rgba(11,22,38,0.08)] ring-1 ring-[var(--color-border-editorial)]'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            Criar conta
          </a>
        </div>

        {/* Trilha inline minimalista de 2 etapas */}
        {activeMode === 'register' && (
          <nav aria-label="Etapas do cadastro" className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setRegisterStep(1);
                setError(null);
              }}
              className="group inline-flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-mono-data font-semibold inline-flex items-center justify-center transition-colors ${
                  registerStep === 1
                    ? 'bg-[var(--color-brand-primary)] text-white'
                    : 'bg-[var(--color-brand-primary)]/15 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/30'
                }`}
              >
                {registerStep > 1 ? '✓' : '1'}
              </span>
              <span
                className={`text-xs font-medium transition-colors ${
                  registerStep === 1
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]'
                }`}
              >
                Acesso
              </span>
            </button>

            <div
              aria-hidden="true"
              className={`h-px flex-1 transition-colors ${
                registerStep === 2
                  ? 'bg-[var(--color-brand-primary)]'
                  : 'bg-[var(--color-border-editorial)]'
              }`}
            />

            <button
              type="button"
              disabled={checkingEmail}
              onClick={() => {
                void validateAndAdvanceToStep2();
              }}
              className="group inline-flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <span
                className={`w-5 h-5 rounded-full text-[11px] font-mono-data font-semibold inline-flex items-center justify-center transition-colors ${
                  registerStep === 2
                    ? 'bg-[var(--color-brand-primary)] text-white'
                    : 'border border-[var(--color-border-editorial)] text-[var(--color-text-muted)] group-hover:border-[var(--color-text-secondary)]'
                }`}
              >
                2
              </span>
              <span
                className={`text-xs font-medium transition-colors ${
                  registerStep === 2
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]'
                }`}
              >
                Comércio
              </span>
            </button>
          </nav>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border-l-2 border-[var(--color-risk-critical-text)] pl-3 py-0.5 text-xs sm:text-[13px] font-medium text-[var(--color-risk-critical-text)] leading-relaxed"
        >
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(activeMode === 'login' || registerStep === 1) && (
          <>
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className={fieldIconClass} />
                <input
                  id="auth-email"
                  type="email"
                  required
                  maxLength={120}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@comercio.com.br"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-password"
                className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className={fieldIconClass} />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={activeMode === 'register' ? 8 : undefined}
                  maxLength={72}
                  autoComplete={activeMode === 'register' ? 'new-password' : 'current-password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder={activeMode === 'register' ? 'Mínimo 8 caracteres' : 'Sua senha'}
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}

        {activeMode === 'register' && registerStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="auth-business-name"
                className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
              >
                Estabelecimento
              </label>
              <div className="relative">
                <Store className={fieldIconClass} />
                <input
                  id="auth-business-name"
                  type="text"
                  required
                  maxLength={100}
                  value={nomeEstabelecimento}
                  onChange={(e) => setNomeEstabelecimento(e.target.value)}
                  placeholder="Nome do comércio"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label
                  htmlFor="auth-bairro-select"
                  className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
                >
                  Bairro
                </label>
                <CustomSelect
                  id="auth-bairro-select"
                  ariaLabel="Bairro"
                  value={bairro}
                  onChange={(val) => setBairro(val)}
                  options={NEIGHBORHOOD_OPTIONS}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="auth-segmento-select"
                  className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
                >
                  Segmento
                </label>
                <CustomSelect
                  id="auth-segmento-select"
                  ariaLabel="Segmento"
                  value={tipoNegocio}
                  onChange={(val) => setTipoNegocio(val as TipoNegocio)}
                  options={BUSINESS_OPTIONS}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  alignRight
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="auth-phone"
                className="text-xs sm:text-[13px] font-medium text-[var(--color-text-primary)]"
              >
                WhatsApp
              </label>
              <div className="relative">
                <Phone className={fieldIconClass} />
                <input
                  id="auth-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
                  placeholder="(91) 98412-0099"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 pt-1">
          {activeMode === 'register' && registerStep === 2 && (
            <button
              type="button"
              onClick={() => {
                setRegisterStep(1);
                setError(null);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-border-editorial)] bg-[var(--color-surface)] px-4 py-2.5 sm:py-3 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || checkingEmail}
            className="btn-water-pill flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[oklch(34%_0.125_244)] px-6 py-2.5 sm:py-3 text-sm font-medium text-white shadow-sm hover:opacity-95 transition-opacity disabled:opacity-60 cursor-pointer"
          >
            <span className="relative z-10 inline-flex items-center gap-2">
              {activeMode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  {submitting ? 'Carregando informações...' : 'Entrar'}
                </>
              ) : registerStep === 1 ? (
                <>
                  {checkingEmail ? 'Verificando e-mail...' : 'Continuar'}
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {submitting ? 'Preparando sua conta...' : 'Criar conta'}
                </>
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
