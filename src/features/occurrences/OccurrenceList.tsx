import { useCallback, useEffect, useState } from 'react';
import { Camera, Plus, RefreshCw, Search } from 'lucide-react';
import { hasRealAuthToken, ocorrenciasApi } from '../../shared/api/client';
import type { OcorrenciaResponse, StatusOcorrencia } from '../../shared/api/types';
import {
  floodLevelLabel,
  formatCurrency,
  formatDateBR,
  occurrenceStatusLabel,
} from '../../shared/lib/formatters';

const STATUS_FILTERS: ReadonlyArray<StatusOcorrencia | 'TODAS'> = [
  'TODAS',
  'ENVIADA',
  'EM_ANALISE',
  'FINALIZADA',
  'RASCUNHO',
];

function statusIndicator(status: StatusOcorrencia): { dot: string; text: string } {
  switch (status) {
    case 'FINALIZADA':
      return { dot: 'bg-[var(--sys-dot-ok)]', text: 'text-[var(--sys-ok-text)]' };
    case 'EM_ANALISE':
      return { dot: 'bg-[var(--sys-dot-warn)]', text: 'text-[var(--sys-warn-text)]' };
    case 'ENVIADA':
      return { dot: 'bg-[var(--sys-brand)]', text: 'text-[var(--sys-ink)]' };
    default:
      return { dot: 'bg-[var(--sys-ink-dim)]', text: 'text-[var(--sys-ink-2)]' };
  }
}

export default function OccurrenceList() {
  const [items, setItems] = useState<OcorrenciaResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusOcorrencia | 'TODAS'>('TODAS');
  const [protocolQuery, setProtocolQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadList = useCallback(async (filter: StatusOcorrencia | 'TODAS') => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = await ocorrenciasApi.listar(filter === 'TODAS' ? undefined : filter);
      setItems(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os protocolos agora.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadList('TODAS');
    });
    return () => {
      active = false;
    };
  }, [loadList]);

  async function handleFilterChange(next: StatusOcorrencia | 'TODAS') {
    setStatusFilter(next);
    setProtocolQuery('');
    setLoading(true);
    await loadList(next);
  }

  async function handleSearchProtocol(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = protocolQuery.trim();
    if (!cleaned) {
      await handleFilterChange(statusFilter);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const found = await ocorrenciasApi.buscarPorProtocolo(cleaned);
      setItems([found]);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Protocolo não encontrado.');
    } finally {
      setSearching(false);
    }
  }

  const totalLoss = items.reduce((acc, occ) => acc + (occ.valorEstimadoPrejuizo ?? 0), 0);
  const totalPhotos = items.reduce((acc, occ) => acc + (occ.fotos?.length ?? 0), 0);

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
          Protocolos
        </h1>

        <a href="/ocorrencias" className="sys-btn-primary shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>Nova ocorrência</span>
        </a>
      </header>

      {/* 3 Métricas Diretas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sys-box p-5">
          <span className="block text-xs font-medium text-[var(--sys-ink-2)]">
            Registros
          </span>
          <strong className="mt-2 block font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
            {items.length}
          </strong>
        </div>

        <div className="sys-box p-5">
          <span className="block text-xs font-medium text-[var(--sys-ink-2)]">
            Prejuízo estimado
          </span>
          <strong className="mt-2 block font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
            {formatCurrency(totalLoss)}
          </strong>
        </div>

        <div className="sys-box p-5">
          <span className="block text-xs font-medium text-[var(--sys-ink-2)]">
            Fotos anexadas
          </span>
          <strong className="mt-2 block font-editorial text-3xl font-normal text-[var(--sys-ink)] tabular-nums">
            {totalPhotos}
          </strong>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleFilterChange(status)}
              className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                  : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
              }`}
            >
              {status === 'TODAS' ? 'Todas' : occurrenceStatusLabel(status)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchProtocol} className="flex items-center gap-2 min-w-0">
          <div className="relative flex-1 min-w-0 sm:w-56">
            <Search
              className="w-3.5 h-3.5 text-[var(--sys-ink-3)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              maxLength={30}
              value={protocolQuery}
              onChange={(e) => setProtocolQuery(e.target.value)}
              placeholder="Buscar protocolo..."
              className="sys-input !pl-9 text-xs"
            />
          </div>
          <button type="submit" disabled={searching} className="sys-btn-secondary shrink-0">
            {searching ? '...' : 'Buscar'}
          </button>
        </form>
      </div>

      {error && (
        <div className="border-b border-[var(--sys-border)] pb-3 text-xs font-medium text-[var(--sys-warn-text)]">
          {error}
        </div>
      )}

      {/* Lista em Filetes */}
      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2.5 text-xs text-[var(--sys-ink-2)]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
          <span>Carregando informações dos protocolos...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-10 text-center text-sm text-[var(--sys-ink-2)]">
          Nenhum registro encontrado.
        </div>
      ) : (
        <div className="divide-y divide-[var(--sys-border)] border-y border-[var(--sys-border)]">
          {items.map((occ) => {
            const st = statusIndicator(occ.status);
            return (
              <article
                key={occ.id}
                className="py-3 px-2 -mx-2 rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 hover:bg-[var(--sys-card-bg)] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="sys-indicator text-[11px] shrink-0">
                    <span className={`sys-indicator-dot ${st.dot}`} />
                    <span className={st.text}>{occurrenceStatusLabel(occ.status)}</span>
                  </span>
                  <h2 className="text-sm font-medium text-[var(--sys-ink)] truncate">
                    {occ.titulo || 'Alagamento registrado'}
                  </h2>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="font-mono-data text-[11px] text-[var(--sys-ink-3)] whitespace-nowrap">
                    {formatDateBR(occ.dataOcorrencia)}
                    {occ.nivelAlagamento ? ` · ${floodLevelLabel(occ.nivelAlagamento)}` : ''}
                  </span>

                  {occ.fotos && occ.fotos.length > 0 && (
                    <a
                      href={ocorrenciasApi.fotoUrl(occ.id, occ.fotos[0].id, occ.fotos[0].urlFoto)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={occ.fotos[0].nomeArquivo}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[var(--sys-sheet-subtle)] hover:bg-[var(--sys-sheet-muted)] text-[11px] font-mono-data text-[var(--sys-ink-2)] hover:text-[var(--sys-link,var(--sys-brand))] transition-colors"
                    >
                      <Camera className="w-3 h-3 shrink-0" />
                      <span>{occ.fotos.length > 1 ? `${occ.fotos.length} fotos` : 'Foto'}</span>
                    </a>
                  )}

                  {occ.valorEstimadoPrejuizo !== undefined && (
                    <strong className="font-mono-data text-xs sm:text-[13px] font-medium text-[var(--sys-ink)] tabular-nums">
                      {formatCurrency(occ.valorEstimadoPrejuizo)}
                    </strong>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
