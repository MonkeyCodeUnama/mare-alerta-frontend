import { useCallback, useEffect, useState } from 'react';
import {
  MapPin,
  PlugZap,
  Power,
  QrCode,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import {
  alertasApi,
  getStoredSession,
  hasRealAuthToken,
  whatsappAdminApi,
} from '../../shared/api/client';
import type {
  NivelRisco,
  TipoAlerta,
  WhatsappHistoricoResponse,
  WhatsappStatusResponse,
} from '../../shared/api/types';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import {
  NEIGHBORHOODS,
  formatDateTime,
  isAdminRole,
  onlyDigits,
} from '../../shared/lib/formatters';

const NEIGHBORHOOD_OPTIONS: readonly CustomSelectOption[] = NEIGHBORHOODS.map((b) => ({
  value: b.codigo,
  label: b.descricao,
}));

const RISK_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'ALTO', label: 'Alto' },
  { value: 'CRITICO', label: 'Crítico' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'BAIXO', label: 'Baixo' },
];

const ALERT_TYPE_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'MARE_ALTA', label: 'Maré Alta' },
  { value: 'TEMPESTADE', label: 'Tempestade' },
  { value: 'ALAGAMENTO', label: 'Alagamento' },
  { value: 'INUNDACAO', label: 'Inundação' },
];

interface QrPayload {
  base64: string | null;
  pairingCode: string | null;
}

function extractQrPayload(raw: Record<string, unknown>): QrPayload {
  const nested =
    raw.qrcode && typeof raw.qrcode === 'object'
      ? (raw.qrcode as Record<string, unknown>)
      : raw;

  const base64Raw =
    typeof nested.base64 === 'string' && nested.base64.trim()
      ? nested.base64.trim()
      : typeof raw.base64 === 'string' && raw.base64.trim()
        ? raw.base64.trim()
        : null;

  const normalizedBase64 = base64Raw
    ? base64Raw.startsWith('data:image/')
      ? base64Raw
      : `data:image/png;base64,${base64Raw}`
    : null;

  const pairingRaw =
    typeof nested.pairingCode === 'string' && nested.pairingCode.trim()
      ? nested.pairingCode.trim()
      : typeof raw.pairingCode === 'string' && raw.pairingCode.trim()
        ? raw.pairingCode.trim()
        : null;

  return {
    base64: normalizedBase64,
    pairingCode: pairingRaw,
  };
}

function connectionStateMeta(
  estado?: string | null,
  hasQrOnScreen = false
): {
  label: string;
  dotClass: string;
  textClass: string;
  isConnected: boolean;
  isConnecting: boolean;
} {
  const norm = (estado ?? '').trim().toLowerCase();
  if (norm === 'open') {
    return {
      label: 'Conectado',
      dotClass: 'bg-[var(--sys-dot-ok)]',
      textClass: 'text-[var(--sys-ok-text)]',
      isConnected: true,
      isConnecting: false,
    };
  }
  if (hasQrOnScreen) {
    return {
      label: 'Aguardando leitura do QR',
      dotClass: 'bg-[var(--sys-dot-warn)]',
      textClass: 'text-[var(--sys-warn-text)]',
      isConnected: false,
      isConnecting: true,
    };
  }
  return {
    label: norm === 'offline' ? 'Evolution offline' : 'Desconectado',
    dotClass: 'bg-[var(--sys-dot-crit)]',
    textClass: 'text-[var(--sys-crit-text)]',
    isConnected: false,
    isConnecting: false,
  };
}

export default function WhatsappAdminPanel() {
  const [status, setStatus] = useState<WhatsappStatusResponse | null>(null);
  const [history, setHistory] = useState<WhatsappHistoricoResponse[]>([]);
  const [qrData, setQrData] = useState<QrPayload | null>(null);

  const [testPhone, setTestPhone] = useState('5591984120099');
  const [testMsg, setTestMsg] = useState('Maré em elevação. Proteja itens sensíveis.');

  const [broadcastBairro, setBroadcastBairro] = useState('CAMPINA');
  const [broadcastRisk, setBroadcastRisk] = useState<NivelRisco>('ALTO');
  const [broadcastType, setBroadcastType] = useState<TipoAlerta>('PREVENTIVO');
  const [broadcastMsg, setBroadcastMsg] = useState(
    'Campina: atenção para maré alta e chuva nas próximas horas.'
  );

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [roleResolved, setRoleResolved] = useState<boolean>(false);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const loadPanel = useCallback(async (silent = false) => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      return null;
    }
    try {
      const [st, hist] = await Promise.all([
        whatsappAdminApi.status(),
        whatsappAdminApi.historico(30),
      ]);
      setStatus(st);
      setHistory(hist);
      if (st.estado?.toLowerCase() === 'open') {
        setQrData(null);
      }
      return st;
    } catch (err) {
      if (!silent) {
        setNotice({
          kind: 'err',
          text:
            err instanceof Error
              ? err.message
              : 'Não foi possível consultar o status da Evolution API.',
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const syncRoleAndLoad = () => {
      if (!active) return;
      if (!hasRealAuthToken()) {
        setLoading(false);
        return;
      }
      const admin = isAdminRole(getStoredSession()?.role);
      setIsAdmin(admin);
      setRoleResolved(true);
      if (admin) {
        void loadPanel();
      } else {
        setLoading(false);
      }
    };
    void Promise.resolve().then(syncRoleAndLoad);
    window.addEventListener('auth-session-changed', syncRoleAndLoad);
    return () => {
      active = false;
      window.removeEventListener('auth-session-changed', syncRoleAndLoad);
    };
  }, [loadPanel]);

  const stateMeta = connectionStateMeta(status?.estado, Boolean(qrData?.base64));
  const isConnected = stateMeta.isConnected;

  // Atualiza automaticamente: rápido enquanto QR está na tela (5s), leve em segundo plano (8s)
  useEffect(() => {
    if (!isAdmin) return;
    const delayMs = !isConnected && qrData?.base64 ? 5000 : 8000;
    const wasConnected = isConnected;
    const intervalId = window.setInterval(async () => {
      if (document.hidden) return;
      const st = await loadPanel(true);
      if (!st) return;
      const nowConnected = st.estado?.toLowerCase() === 'open';
      if (!wasConnected && nowConnected) {
        setQrData(null);
        setNotice({
          kind: 'ok',
          text: 'WhatsApp conectado com sucesso.',
        });
      } else if (wasConnected && !nowConnected) {
        setNotice({
          kind: 'err',
          text: 'O aparelho foi desconectado no WhatsApp.',
        });
      }
    }, delayMs);
    return () => window.clearInterval(intervalId);
  }, [isAdmin, isConnected, qrData?.base64, loadPanel]);

  async function handleGenerateQr() {
    setActionBusy('qr');
    setNotice(null);
    try {
      const res = await whatsappAdminApi.qr();
      const extracted = extractQrPayload(res);
      const st = await loadPanel(true);
      if (st?.estado?.toLowerCase() === 'open') {
        setQrData(null);
        setNotice({ kind: 'ok', text: 'O aparelho já está conectado.' });
      } else if (extracted.base64) {
        setQrData(extracted);
        setNotice({
          kind: 'ok',
          text: 'QR Code atualizado. Escaneie no WhatsApp do celular.',
        });
      } else {
        setQrData(null);
        setNotice({
          kind: 'err',
          text: 'A Evolution API não retornou um QR Code agora. Tente reiniciar a instância.',
        });
      }
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível gerar o QR Code.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  async function handleRefreshStatus() {
    setActionBusy('refresh');
    setNotice(null);
    const st = await loadPanel(false);
    if (st) {
      const meta = connectionStateMeta(st.estado);
      setNotice({
        kind: 'ok',
        text: meta.isConnected
          ? 'Conexão verificada: aparelho conectado.'
          : 'Status atualizado. Gere e escaneie o QR Code para conectar.',
      });
    }
    setActionBusy(null);
  }

  async function handleReconnect() {
    setActionBusy('reconnect');
    setNotice(null);
    try {
      const res = await whatsappAdminApi.reconnect();
      const extracted = extractQrPayload(res);
      await loadPanel(true);
      if (extracted.base64) {
        setQrData(extracted);
        setNotice({
          kind: 'ok',
          text: 'Instância reiniciada. Escaneie o novo QR Code abaixo.',
        });
      } else {
        setNotice({
          kind: 'ok',
          text: 'Instância reiniciada com sucesso.',
        });
      }
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível reiniciar a instância.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  async function handleDisconnect() {
    setActionBusy('disconnect');
    setNotice(null);
    try {
      await whatsappAdminApi.disconnect();
      setQrData(null);
      await loadPanel(true);
      setNotice({ kind: 'ok', text: 'Sessão do WhatsApp desconectada.' });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível desconectar a sessão.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  async function toggleSetting(field: 'ativo' | 'enviarAlertasAutomaticos') {
    if (!status) return;
    setActionBusy(field);
    setNotice(null);
    try {
      const nextAtivo = field === 'ativo' ? !status.ativo : status.ativo;
      const nextAuto =
        field === 'enviarAlertasAutomaticos'
          ? !status.enviarAlertasAutomaticos
          : status.enviarAlertasAutomaticos;
      const updated = await whatsappAdminApi.settings(nextAtivo, nextAuto);
      setStatus(updated);
      setNotice({
        kind: 'ok',
        text:
          field === 'ativo'
            ? nextAtivo
              ? 'Envios pelo canal ativados.'
              : 'Envios pelo canal pausados.'
            : nextAuto
              ? 'Alertas automáticos ativados.'
              : 'Alertas automáticos desativados.',
      });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível salvar a configuração.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  async function handleTestSend(e: React.FormEvent) {
    e.preventDefault();
    const cleanPhone = onlyDigits(testPhone, 13);
    if (cleanPhone.length < 10) {
      setNotice({
        kind: 'err',
        text: 'Informe um número válido com DDD (ex.: 5591984120099).',
      });
      return;
    }

    setActionBusy('test');
    setNotice(null);
    try {
      await whatsappAdminApi.test({
        telefone: cleanPhone,
        mensagem: testMsg.trim(),
      });
      await loadPanel(true);
      setNotice({ kind: 'ok', text: `Mensagem de teste enviada para ${cleanPhone}.` });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível enviar a mensagem de teste.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  async function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setActionBusy('broadcast');
    setNotice(null);
    try {
      const created = await alertasApi.dispararBairro({
        bairro: broadcastBairro,
        nivelRisco: broadcastRisk,
        mensagem: broadcastMsg.trim(),
        tipoAlerta: broadcastType,
        origemAlerta: 'MANUAL',
      });
      await loadPanel(true);
      const count = created.length;
      setNotice({
        kind: 'ok',
        text:
          count > 0
            ? `Alerta registrado para ${count} estabelecimento(s) do bairro.`
            : 'Alerta processado para o bairro selecionado.',
      });
    } catch (err) {
      setNotice({
        kind: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível realizar o disparo.',
      });
    } finally {
      setActionBusy(null);
    }
  }

  const labelClass = 'block text-xs font-medium text-[var(--sys-ink-2)]';
  const inputClass = 'sys-input';

  if (roleResolved && !isAdmin) {
    return (
      <div className="space-y-6">
        <header className="border-b border-[var(--sys-border)] pb-5 space-y-1">
          <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
            Canal WhatsApp
          </h1>
          <p className="text-sm text-[var(--sys-ink-2)]">
            Administração exclusiva para disparos coletivos e conexão do canal
          </p>
        </header>
        <section className="sys-box p-6 space-y-3 max-w-xl">
          <p className="text-sm text-[var(--sys-ink)] font-medium">
            Acesso restrito ao perfil administrador
          </p>
          <p className="text-xs text-[var(--sys-ink-2)] leading-relaxed">
            Seu estabelecimento já recebe notificações automáticas quando cadastrado. O controle de conexão WhatsApp e disparos para bairros inteiros fica disponível apenas para a equipe administrativa.
          </p>
          <div className="pt-1">
            <a href="/dashboard" className="sys-btn-primary">
              Voltar ao painel
            </a>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)] shrink-0">
          Canal WhatsApp
        </h1>

        <div className="min-h-[20px] flex items-center sm:justify-end min-w-0">
          {notice && (
            <span
              role="status"
              title={notice.text}
              className={`inline-flex items-center gap-2 text-xs font-medium truncate max-w-full sm:max-w-[540px] ${
                notice.kind === 'ok'
                  ? 'text-[var(--sys-ok-text)]'
                  : 'text-[var(--sys-crit-text)]'
              }`}
            >
              <span
                className={`sys-indicator-dot shrink-0 ${
                  notice.kind === 'ok' ? 'bg-[var(--sys-dot-ok)]' : 'bg-[var(--sys-dot-crit)]'
                }`}
              />
              <span className="truncate">{notice.text}</span>
            </span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <section className="lg:col-span-5 sys-box p-5 sm:p-6 space-y-5 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <h2 className="font-editorial text-2xl font-normal text-[var(--sys-ink)] truncate">
                {loading
                  ? 'Carregando informações...'
                  : (isConnected ? status?.nome : null) || status?.instancia || 'Central Belém'}
              </h2>
              <p className="font-mono-data text-xs text-[var(--sys-ink-2)]">
                {isConnected && status?.telefone ? status.telefone : 'Nenhum aparelho conectado'}
              </p>
            </div>

            <span className="sys-indicator shrink-0">
              <span className={`sys-indicator-dot ${stateMeta.dotClass}`} />
              <span className={stateMeta.textClass}>{stateMeta.label}</span>
            </span>
          </div>

          <div className="divide-y divide-[var(--sys-border)] border-y border-[var(--sys-border)]">
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(status?.ativo)}
              disabled={!status || actionBusy === 'ativo'}
              onClick={() => toggleSetting('ativo')}
              className="w-full py-3.5 flex items-center justify-between text-[13px] font-medium text-[var(--sys-ink)] cursor-pointer disabled:opacity-50"
            >
              <span>Envios habilitados</span>
              <span className="inline-flex items-center gap-2.5">
                <span className="text-xs text-[var(--sys-ink-2)]">
                  {status?.ativo ? 'Ativo' : 'Pausado'}
                </span>
                <span
                  aria-hidden="true"
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors inline-flex items-center ${
                    status?.ativo
                      ? 'bg-[var(--sys-brand)] justify-end'
                      : 'bg-[var(--sys-border-strong)] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white" />
                </span>
              </span>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={Boolean(status?.enviarAlertasAutomaticos)}
              disabled={!status || actionBusy === 'enviarAlertasAutomaticos'}
              onClick={() => toggleSetting('enviarAlertasAutomaticos')}
              className="w-full py-3.5 flex items-center justify-between text-[13px] font-medium text-[var(--sys-ink)] cursor-pointer disabled:opacity-50"
            >
              <span>Alertas automáticos</span>
              <span className="inline-flex items-center gap-2.5">
                <span className="text-xs text-[var(--sys-ink-2)]">
                  {status?.enviarAlertasAutomaticos ? 'Ativado' : 'Desativado'}
                </span>
                <span
                  aria-hidden="true"
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors inline-flex items-center ${
                    status?.enviarAlertasAutomaticos
                      ? 'bg-[var(--sys-brand)] justify-end'
                      : 'bg-[var(--sys-border-strong)] justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white" />
                </span>
              </span>
            </button>
          </div>

          {isConnected ? (
            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={actionBusy !== null}
                className="sys-btn-secondary w-full"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${actionBusy === 'refresh' ? 'animate-spin' : ''}`}
                />
                <span>{actionBusy === 'refresh' ? 'Verificando...' : 'Atualizar status'}</span>
              </button>
              <button
                type="button"
                onClick={handleReconnect}
                disabled={actionBusy !== null}
                className="sys-btn-secondary w-full"
              >
                <PlugZap className="w-3.5 h-3.5" />
                <span>{actionBusy === 'reconnect' ? 'Reiniciando...' : 'Reiniciar conexão'}</span>
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={actionBusy !== null}
                className="sys-btn-secondary w-full min-[380px]:col-span-2 text-[var(--sys-crit-text)] hover:border-[var(--sys-dot-crit)]"
              >
                <Power className="w-3.5 h-3.5" />
                <span>{actionBusy === 'disconnect' ? 'Desconectando...' : 'Desconectar WhatsApp'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleGenerateQr}
                  disabled={actionBusy !== null}
                  className="sys-btn-primary w-full min-[380px]:col-span-2"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>
                    {actionBusy === 'qr'
                      ? 'Gerando QR Code...'
                      : qrData?.base64
                        ? 'Gerar novo QR Code'
                        : 'Gerar QR Code para conectar'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleRefreshStatus}
                  disabled={actionBusy !== null}
                  className="sys-btn-secondary w-full"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${actionBusy === 'refresh' ? 'animate-spin' : ''}`}
                  />
                  <span>{actionBusy === 'refresh' ? 'Verificando...' : 'Verificar conexão'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReconnect}
                  disabled={actionBusy !== null}
                  className="sys-btn-secondary w-full"
                >
                  <PlugZap className="w-3.5 h-3.5" />
                  <span>{actionBusy === 'reconnect' ? 'Reiniciando...' : 'Reiniciar instância'}</span>
                </button>
              </div>

              {qrData?.base64 && (
                <div className="border-t border-[var(--sys-border)] pt-4 flex flex-col items-center text-center space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-black/10 shadow-xs inline-block">
                    <img
                      src={qrData.base64}
                      alt="QR Code para conectar WhatsApp"
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain block"
                    />
                  </div>
                  <p className="text-xs text-[var(--sys-ink-2)] leading-relaxed max-w-xs">
                    No WhatsApp do celular: <strong className="font-medium text-[var(--sys-ink)]">Aparelhos conectados → Conectar aparelho</strong> e aponte a câmera.
                  </p>
                  {qrData.pairingCode && (
                    <p className="font-mono-data text-xs text-[var(--sys-ink)]">
                      Código de pareamento: <strong>{qrData.pairingCode}</strong>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="lg:col-span-7 space-y-7 min-w-0">
          <form onSubmit={handleTestSend} className="pb-6 border-b border-[var(--sys-border)] space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[14px] font-medium text-[var(--sys-ink)]">Teste rápido</h2>
              {!isConnected && !loading && (
                <span className="text-[11px] text-[var(--sys-ink-3)]">
                  Requer QR Code conectado para entregar mensagens
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className={labelClass}>Telefone (DDI + DDD)</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  maxLength={13}
                  value={testPhone}
                  onChange={(e) => setTestPhone(onlyDigits(e.target.value, 13))}
                  placeholder="5591984120099"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className={labelClass}>Mensagem</label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={actionBusy === 'test'} className="sys-btn-secondary">
                {actionBusy === 'test' ? 'Enviando mensagem...' : 'Enviar teste'}
              </button>
            </div>
          </form>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <h2 className="text-[14px] font-medium text-[var(--sys-ink)]">Disparo por bairro</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <CustomSelect
                ariaLabel="Bairro"
                size="sm"
                value={broadcastBairro}
                onChange={setBroadcastBairro}
                options={NEIGHBORHOOD_OPTIONS}
                leftIcon={<MapPin className="w-3.5 h-3.5" />}
              />

              <CustomSelect
                ariaLabel="Nível de risco"
                size="sm"
                value={broadcastRisk}
                onChange={(val) => setBroadcastRisk(val as NivelRisco)}
                options={RISK_OPTIONS}
                leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
              />

              <CustomSelect
                ariaLabel="Tipo de alerta"
                size="sm"
                alignRight
                value={broadcastType}
                onChange={(val) => setBroadcastType(val as TipoAlerta)}
                options={ALERT_TYPE_OPTIONS}
              />
            </div>

            <textarea
              rows={2}
              required
              maxLength={600}
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              className={inputClass}
            />

            <div className="flex justify-end">
              <button type="submit" disabled={actionBusy === 'broadcast'} className="sys-btn-primary">
                {actionBusy === 'broadcast' ? 'Disparando alertas...' : 'Disparar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Registro de Envios */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between pb-2.5 border-b border-[var(--sys-border)]">
          <h2 className="text-[15px] font-medium text-[var(--sys-ink)]">Registro de envios</h2>
          <span className="font-mono-data text-xs text-[var(--sys-ink-3)] tabular-nums">
            {history.length} {history.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {loading ? (
          <div className="py-10 flex items-center justify-center gap-2 text-xs text-[var(--sys-ink-2)]">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
            <span>Carregando informações do canal...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--sys-ink-3)]">
            Nenhum envio registrado ainda.
          </div>
        ) : (
          <>
            <div className="sm:hidden divide-y divide-[var(--sys-border)]">
              {history.map((log) => (
                <div key={log.id} className="py-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[var(--sys-ink)] truncate">
                      {log.estabelecimentoNome || log.responsavel || log.telefone}
                    </span>
                    <span className="sys-indicator text-xs shrink-0">
                      <span
                        className={`sys-indicator-dot ${
                          log.status === 'ENVIADO' || log.status === 'DELIVERED' || log.status === 'READ'
                            ? 'bg-[var(--sys-dot-ok)]'
                            : 'bg-[var(--sys-dot-warn)]'
                        }`}
                      />
                      <span>{log.status}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--sys-ink-3)]">
                    <span className="truncate">{log.responsavel || log.telefone}</span>
                    <span className="font-mono-data shrink-0">{formatDateTime(log.criadoEm)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--sys-border)] text-[var(--sys-ink-3)] font-medium">
                    <th className="py-2.5 pr-4">Estabelecimento / Responsável</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Criado</th>
                    <th className="py-2.5 pl-4">Confirmado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sys-border)]">
                  {history.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3 pr-4">
                        <span className="block text-[var(--sys-ink)] font-medium">
                          {log.estabelecimentoNome || log.responsavel || log.telefone}
                        </span>
                        {(log.responsavel || (log.estabelecimentoNome && log.telefone)) && (
                          <span className="block text-[11px] text-[var(--sys-ink-3)]">
                            {log.responsavel || log.telefone}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="sys-indicator text-xs">
                          <span
                            className={`sys-indicator-dot ${
                              log.status === 'ENVIADO' || log.status === 'DELIVERED' || log.status === 'READ'
                                ? 'bg-[var(--sys-dot-ok)]'
                                : 'bg-[var(--sys-dot-warn)]'
                            }`}
                          />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono-data text-[var(--sys-ink-2)]">{formatDateTime(log.criadoEm)}</td>
                      <td className="py-3 pl-4 font-mono-data text-[var(--sys-ink-2)]">{formatDateTime(log.enviadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
