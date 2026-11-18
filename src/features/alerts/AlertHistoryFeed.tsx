import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Plus, RefreshCw, Send } from 'lucide-react';
import {
  alertasApi,
  estabelecimentoApi,
  getStoredSession,
  hasRealAuthToken,
} from '../../shared/api/client';
import type {
  AlertaResponse,
  EnvioAlertaWhatsappResponse,
  NivelRisco,
  TipoAlerta,
} from '../../shared/api/types';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import {
  formatDateTime,
  isAdminRole,
  normalizeRiskLevel,
  riskDotClass,
  riskLabel,
  riskTextClass,
} from '../../shared/lib/formatters';

const RISK_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'CRITICO', label: 'Crítico' },
  { value: 'ALTO', label: 'Alto' },
  { value: 'MEDIO', label: 'Médio' },
  { value: 'BAIXO', label: 'Baixo' },
];

const TYPE_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'MARE_ALTA', label: 'Maré Alta' },
  { value: 'TEMPESTADE', label: 'Tempestade' },
  { value: 'ALAGAMENTO', label: 'Alagamento' },
  { value: 'INUNDACAO', label: 'Inundação' },
];

export default function AlertHistoryFeed() {
  const [alerts, setAlerts] = useState<AlertaResponse[]>([]);
  const [filterRisk, setFilterRisk] = useState<NivelRisco | 'TODOS'>('TODOS');
  const [composerOpen, setComposerOpen] = useState(false);
  const [newRisk, setNewRisk] = useState<NivelRisco>('ALTO');
  const [newType, setNewType] = useState<TipoAlerta>('PREVENTIVO');
  const [newMessage, setNewMessage] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);
  const [deliveriesMap, setDeliveriesMap] = useState<
    Record<number, EnvioAlertaWhatsappResponse[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadAlerts = useCallback(async (adminFlag: boolean) => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      if (adminFlag) {
        setAlerts(await alertasApi.listar());
        return;
      }
      let estabId: number | undefined;
      try {
        const meu = await estabelecimentoApi.meu();
        estabId = meu?.id;
      } catch {
        estabId = getStoredSession()?.estabelecimentoId ?? undefined;
      }
      setAlerts(await alertasApi.listar(estabId));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const syncAndLoad = () => {
      if (!active) return;
      if (!hasRealAuthToken()) {
        setLoading(false);
        return;
      }
      const adminFlag = isAdminRole(getStoredSession()?.role);
      setIsAdmin(adminFlag);
      if (!adminFlag) setComposerOpen(false);
      void loadAlerts(adminFlag);
    };
    void Promise.resolve().then(syncAndLoad);
    window.addEventListener('auth-session-changed', syncAndLoad);
    return () => {
      active = false;
      window.removeEventListener('auth-session-changed', syncAndLoad);
    };
  }, [loadAlerts]);

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setSimulating(true);
    try {
      await alertasApi.criar({
        nivelRisco: newRisk,
        tipoAlerta: newType,
        origemAlerta: 'MANUAL',
        mensagem: newMessage.trim() || 'Boletim preventivo emitido.',
      });
      await loadAlerts(isAdmin);
      setComposerOpen(false);
    } finally {
      setSimulating(false);
    }
  }

  async function toggleDeliveries(alertaId: number) {
    if (expandedAlertId === alertaId) {
      setExpandedAlertId(null);
      return;
    }
    setExpandedAlertId(alertaId);
    if (!deliveriesMap[alertaId]) {
      try {
        const list = await alertasApi.enviosWhatsapp(alertaId);
        setDeliveriesMap((prev) => ({ ...prev, [alertaId]: list }));
      } catch {
        setDeliveriesMap((prev) => ({ ...prev, [alertaId]: [] }));
      }
    }
  }

  const filtered =
    filterRisk === 'TODOS'
      ? alerts
      : alerts.filter((a) => normalizeRiskLevel(a.nivelRisco) === filterRisk);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
          Histórico de alertas
        </h1>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setComposerOpen((prev) => !prev)}
            className="sys-btn-secondary shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{composerOpen ? 'Fechar' : 'Emitir alerta'}</span>
          </button>
        )}
      </header>

      {isAdmin && composerOpen && (
        <form onSubmit={handleCreateAlert} className="sys-box p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--sys-ink-2)]">
                Nível de risco
              </label>
              <CustomSelect
                ariaLabel="Nível de risco"
                size="sm"
                value={newRisk}
                onChange={(val) => setNewRisk(val as NivelRisco)}
                options={RISK_OPTIONS}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[var(--sys-ink-2)]">
                Tipo
              </label>
              <CustomSelect
                ariaLabel="Tipo de alerta"
                size="sm"
                alignRight
                value={newType}
                onChange={(val) => setNewType(val as TipoAlerta)}
                options={TYPE_OPTIONS}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              required
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mensagem do alerta..."
              className="sys-input flex-1"
            />
            <button type="submit" disabled={simulating} className="sys-btn-primary shrink-0">
              <Send className="w-3.5 h-3.5" />
              <span>{simulating ? 'Emitindo' : 'Emitir'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Filtros responsivos */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['TODOS', 'CRITICO', 'ALTO', 'MEDIO', 'BAIXO'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setFilterRisk(level)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                filterRisk === level
                  ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                  : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
              }`}
            >
              {level === 'TODOS' ? 'Todos' : riskLabel(level)}
            </button>
          ))}
        </div>

        <span className="font-mono-data text-xs text-[var(--sys-ink-3)] tabular-nums">
          {filtered.length} {filtered.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2.5 text-xs text-[var(--sys-ink-2)]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
          <span>Carregando informações do histórico...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-[var(--sys-ink-2)]">
          Nenhum alerta encontrado.
        </div>
      ) : (
        <div className="divide-y divide-[var(--sys-border)] border-y border-[var(--sys-border)]">
          {filtered.map((alert) => {
            const expanded = expandedAlertId === alert.id;
            const deliveries = deliveriesMap[alert.id];
            return (
              <article key={alert.id} className="py-3 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="sys-indicator text-[11px] shrink-0">
                      <span className={`sys-indicator-dot ${riskDotClass(alert.nivelRisco)}`} />
                      <span className={riskTextClass(alert.nivelRisco)}>
                        {riskLabel(alert.nivelRisco)}
                      </span>
                    </span>
                    <p className="text-[13px] text-[var(--sys-ink)] truncate">
                      {alert.mensagem}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="font-mono-data text-[11px] text-[var(--sys-ink-3)] tabular-nums">
                      {formatDateTime(alert.dataEnvio)}
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => toggleDeliveries(alert.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline cursor-pointer"
                      >
                        WhatsApp
                        <ChevronDown
                          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {isAdmin && expanded && (
                  <div className="pl-3.5 border-l-2 border-[var(--sys-border)] space-y-1.5 text-xs font-mono-data pt-1">
                    {!deliveries ? (
                      <span className="text-[var(--sys-ink-3)]">Consultando...</span>
                    ) : deliveries.length === 0 ? (
                      <span className="text-[var(--sys-ink-3)]">Sem registros de envio.</span>
                    ) : (
                      deliveries.map((d) => (
                        <div key={d.id} className="flex items-center justify-between gap-2 py-0.5">
                          <span className="text-[var(--sys-ink)] truncate">{d.telefoneDestinatario}</span>
                          <span className="text-[var(--sys-ink-2)] uppercase">{d.statusEnvio}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
