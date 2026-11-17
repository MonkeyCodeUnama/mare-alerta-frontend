import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock3,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  checklistsApi,
  estabelecimentoApi,
  hasRealAuthToken,
} from '../../shared/api/client';
import type {
  ChecklistResumoDTO,
  ItemChecklistResponse,
  PrioridadeChecklist,
  TipoNegocio,
} from '../../shared/api/types';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import {
  BUSINESS_TYPES,
  STANDARD_TITLES_BY_SEGMENT,
} from '../../shared/lib/formatters';

const CATEGORY_META = {
  EQUIPAMENTOS: { key: 'EQUIPAMENTOS', label: 'Equipamentos', shortLabel: 'Equipamentos' },
  ESTOQUE: { key: 'ESTOQUE', label: 'Estoque', shortLabel: 'Estoque' },
  SEGURANCA: { key: 'SEGURANCA', label: 'Segurança', shortLabel: 'Segurança' },
  INFRAESTRUTURA: { key: 'INFRAESTRUTURA', label: 'Infraestrutura', shortLabel: 'Infraestrutura' },
  ADMINISTRATIVO: { key: 'ADMINISTRATIVO', label: 'Administrativo', shortLabel: 'Admin.' },
  TI: { key: 'TI', label: 'TI & Backup', shortLabel: 'TI' },
  MEIO_AMBIENTE: { key: 'MEIO_AMBIENTE', label: 'Drenagem & Resíduos', shortLabel: 'Drenagem' },
  PRE_CHEIA: { key: 'PRE_CHEIA', label: 'Pré-cheia', shortLabel: 'Pré-cheia' },
  DURANTE_ALAGAMENTO: { key: 'DURANTE_ALAGAMENTO', label: 'Durante', shortLabel: 'Durante' },
  POS_CHEIA: { key: 'POS_CHEIA', label: 'Pós-cheia', shortLabel: 'Pós-cheia' },
  OUTRAS: { key: 'OUTRAS', label: 'Outras tarefas', shortLabel: 'Outras' },
} as const;

type CategoryKey = keyof typeof CATEGORY_META;

const STANDARD_CATEGORY_KEYS: readonly CategoryKey[] = [
  'EQUIPAMENTOS',
  'ESTOQUE',
  'SEGURANCA',
  'INFRAESTRUTURA',
  'ADMINISTRATIVO',
  'TI',
  'MEIO_AMBIENTE',
];

const ORDERED_CATEGORY_KEYS: readonly CategoryKey[] = [
  ...STANDARD_CATEGORY_KEYS,
  'PRE_CHEIA',
  'DURANTE_ALAGAMENTO',
  'POS_CHEIA',
  'OUTRAS',
];

const CATEGORY_OPTIONS: readonly CustomSelectOption[] = STANDARD_CATEGORY_KEYS.map((key) => ({
  value: key,
  label: CATEGORY_META[key].label,
}));

function normalizeCategoryKey(raw?: string | null): CategoryKey {
  const upper = (raw ?? '').trim().toUpperCase();
  if (upper in CATEGORY_META) return upper as CategoryKey;
  if (upper.startsWith('PRE')) return 'PRE_CHEIA';
  if (upper.startsWith('DURANTE')) return 'DURANTE_ALAGAMENTO';
  if (upper.startsWith('POS')) return 'POS_CHEIA';
  return 'OUTRAS';
}

const PRIORITY_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Média' },
  { value: 'BAIXA', label: 'Baixa' },
];

function priorityMeta(prioridade: PrioridadeChecklist): {
  label: string;
  dotClass: string;
  textClass: string;
} {
  switch (prioridade) {
    case 'ALTA':
      return { label: 'Alta', dotClass: 'bg-[var(--sys-dot-crit)]', textClass: 'text-[var(--sys-crit-text)]' };
    case 'MEDIA':
      return { label: 'Média', dotClass: 'bg-[var(--sys-dot-warn)]', textClass: 'text-[var(--sys-warn-text)]' };
    default:
      return { label: 'Baixa', dotClass: 'bg-[var(--sys-ink-dim)]', textClass: 'text-[var(--sys-ink-3)]' };
  }
}

function computeResumoFromItems(list: ItemChecklistResponse[]): ChecklistResumoDTO {
  const totalItens = list.length;
  const concluidos = list.filter((i) => i.status === 'CONCLUIDO').length;
  const pendentes = Math.max(0, totalItens - concluidos);
  const percentualConcluido =
    totalItens > 0 ? Math.round((concluidos / totalItens) * 100) : 0;
  return {
    totalItens,
    concluidos,
    pendentes,
    percentualConcluido,
    progressoFormatado: `${percentualConcluido}%`,
    prontoParaInundacao: totalItens > 0 && concluidos === totalItens,
  };
}

export default function ChecklistManager() {
  const [items, setItems] = useState<ItemChecklistResponse[]>([]);
  const [resumo, setResumo] = useState<ChecklistResumoDTO | null>(null);
  const [estabelecimentoId, setEstabelecimentoId] = useState<number | undefined>(undefined);
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>('MERCADO');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'TODAS' | CategoryKey>('TODAS');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [newCategory, setNewCategory] = useState<CategoryKey>('EQUIPAMENTOS');
  const [newPriority, setNewPriority] = useState<PrioridadeChecklist>('ALTA');
  const [creating, setCreating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadChecklist = useCallback(async () => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const [meu, lista, sum] = await Promise.all([
        estabelecimentoApi.meu(),
        checklistsApi.listar(),
        checklistsApi.resumo(),
      ]);
      setEstabelecimentoId(meu.id);
      if (meu.tipoNegocio) setTipoNegocio(meu.tipoNegocio);
      setItems(lista);
      setResumo(sum ?? computeResumoFromItems(lista));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o checklist agora.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadChecklist();
    });
    return () => {
      active = false;
    };
  }, [loadChecklist]);

  const segmentLabel = useMemo(
    () => BUSINESS_TYPES.find((b) => b.value === tipoNegocio)?.label ?? 'seu segmento',
    [tipoNegocio]
  );

  const isStandardComplete = useMemo(() => {
    const expected = STANDARD_TITLES_BY_SEGMENT[tipoNegocio] ?? STANDARD_TITLES_BY_SEGMENT.OUTROS;
    if (expected.length === 0) return false;
    const currentTitles = new Set(items.map((i) => i.titulo.trim().toLowerCase()));
    return expected.every((t) => currentTitles.has(t.trim().toLowerCase()));
  }, [items, tipoNegocio]);

  async function handleToggle(item: ItemChecklistResponse) {
    setBusyId(item.id);
    setError(null);
    setFeedback(null);
    try {
      const updated = await checklistsApi.toggle(item.id);
      setItems((prev) => {
        const next = prev.map((it) => (it.id === item.id ? updated : it));
        setResumo(computeResumoFromItems(next));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a tarefa.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    setBusyId(id);
    setError(null);
    setFeedback(null);
    try {
      await checklistsApi.deletar(id);
      setItems((prev) => {
        const next = prev.filter((it) => it.id !== id);
        setResumo(computeResumoFromItems(next));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover a tarefa.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleGenerateStandard() {
    setError(null);
    setFeedback(null);

    if (isStandardComplete) {
      setFeedback(
        `Seu checklist já está padronizado com todos os itens recomendados para ${segmentLabel}.`
      );
      return;
    }

    setGenerating(true);
    try {
      const prevIds = new Set(items.map((i) => i.id));
      const nextList = await checklistsApi.gerarPadrao(estabelecimentoId);
      setItems(nextList);
      setResumo(computeResumoFromItems(nextList));
      const addedCount = nextList.filter((i) => !prevIds.has(i.id)).length;
      if (addedCount > 0) {
        setFeedback(
          `${addedCount} ${addedCount === 1 ? 'item recomendado adicionado' : 'itens recomendados adicionados'} para ${segmentLabel}.`
        );
      } else {
        setFeedback(
          `Seu checklist já está padronizado com todos os itens recomendados para ${segmentLabel}.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar as sugestões do segmento.'
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !estabelecimentoId) return;
    setCreating(true);
    setError(null);
    setFeedback(null);
    try {
      const created = await checklistsApi.criar({
        estabelecimentoId,
        titulo: newTitle.trim(),
        ...(newDescription.trim() ? { descricao: newDescription.trim() } : {}),
        categoria: newCategory,
        prioridade: newPriority,
        status: 'PENDENTE',
      });
      setNewTitle('');
      setNewDescription('');
      setShowDetailsInput(false);
      setItems((prev) => {
        const next = [...prev, created];
        setResumo(computeResumoFromItems(next));
        return next;
      });
      setFeedback('Nova tarefa preventiva adicionada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a tarefa.');
    } finally {
      setCreating(false);
    }
  }

  const groupedByCategory = new Map<CategoryKey, ItemChecklistResponse[]>();
  for (const item of items) {
    const key = normalizeCategoryKey(item.categoria);
    const list = groupedByCategory.get(key);
    if (list) {
      list.push(item);
    } else {
      groupedByCategory.set(key, [item]);
    }
  }

  const presentCategories = ORDERED_CATEGORY_KEYS.filter((key) => {
    const group = groupedByCategory.get(key);
    return group && group.length > 0;
  });

  const visibleCategoryKeys: readonly CategoryKey[] =
    activeCategoryFilter === 'TODAS'
      ? presentCategories
      : [activeCategoryFilter];

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
          Checklist
        </h1>

        <button
          type="button"
          onClick={handleGenerateStandard}
          disabled={generating || loading}
          title={
            isStandardComplete
              ? `Todos os itens recomendados para ${segmentLabel} já estão no seu checklist`
              : `Adiciona ações preventivas prontas conforme o segmento (${segmentLabel})`
          }
          className="sys-btn-secondary shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {generating
              ? 'Verificando itens...'
              : isStandardComplete
                ? 'Itens do ramo aplicados'
                : 'Sugerir itens do ramo'}
          </span>
        </button>
      </header>

      {feedback && (
        <div className="border-b border-[var(--sys-border)] pb-3 text-xs font-medium text-[var(--sys-ok-text)]">
          {feedback}
        </div>
      )}

      {error && (
        <div className="border-b border-[var(--sys-border)] pb-3 text-xs font-medium text-[var(--sys-crit-text)]">
          {error}
        </div>
      )}

      {/* Resumo + Filtros */}
      <section className="space-y-4">
        <div className="sys-box p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <strong className="font-editorial text-4xl font-normal text-[var(--sys-ink)] tabular-nums">
              {resumo ? `${resumo.percentualConcluido}%` : '—'}
            </strong>
            <div className="space-y-1">
              <span className="sys-indicator">
                <span
                  className={`sys-indicator-dot ${
                    resumo?.prontoParaInundacao ? 'bg-[var(--sys-dot-ok)]' : 'bg-[var(--sys-dot-warn)]'
                  }`}
                />
                <span className={resumo?.prontoParaInundacao ? 'text-[var(--sys-ok-text)]' : 'text-[var(--sys-warn-text)]'}>
                  {resumo?.prontoParaInundacao ? 'Loja preparada' : 'Ações pendentes'}
                </span>
              </span>
              <span className="block text-xs text-[var(--sys-ink-2)] font-mono-data tabular-nums">
                {resumo ? `${resumo.concluidos}/${resumo.totalItens}` : '—'}
              </span>
            </div>
          </div>

          <div className="w-full sm:w-56">
            <div className="h-1.5 w-full rounded-full bg-[var(--sys-sheet-muted)] overflow-hidden">
              <div
                className="h-full bg-[var(--sys-brand)] transition-all duration-300"
                style={{ width: `${resumo?.percentualConcluido ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategoryFilter('TODAS')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
              activeCategoryFilter === 'TODAS'
                ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
            }`}
          >
            Todas ({items.length})
          </button>

          {presentCategories.map((key) => {
            const meta = CATEGORY_META[key];
            const catItems = groupedByCategory.get(key) ?? [];
            const doneCount = catItems.filter((item) => item.status === 'CONCLUIDO').length;
            const selected = activeCategoryFilter === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategoryFilter(selected ? 'TODAS' : key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                    : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
                }`}
              >
                <span>{meta.shortLabel}</span>
                <span className="font-mono-data text-[11px] opacity-75 tabular-nums">
                  {doneCount}/{catItems.length}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Adição Rápida Totalmente Responsiva */}
      <form onSubmit={handleCreate} className="sys-box p-4 sm:p-5 space-y-3">
        <label htmlFor="chk-new-title" className="block text-xs font-medium text-[var(--sys-ink-2)]">
          Nova tarefa de prevenção
        </label>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          <input
            id="chk-new-title"
            type="text"
            required
            maxLength={120}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ex.: Elevar freezer da cozinha"
            className="sys-input flex-1"
          />

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:flex items-center gap-2 shrink-0">
            <div className="lg:w-44 min-w-0">
              <CustomSelect
                ariaLabel="Categoria"
                size="sm"
                value={newCategory}
                onChange={(val) => setNewCategory(val as CategoryKey)}
                options={CATEGORY_OPTIONS}
              />
            </div>
            <div className="lg:w-28 min-w-0">
              <CustomSelect
                ariaLabel="Prioridade"
                size="sm"
                alignRight
                value={newPriority}
                onChange={(val) => setNewPriority(val as PrioridadeChecklist)}
                options={PRIORITY_OPTIONS}
              />
            </div>
          </div>

          <button type="submit" disabled={creating} className="sys-btn-primary shrink-0">
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </div>

        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => {
              setShowDetailsInput((prev) => {
                if (prev) setNewDescription('');
                return !prev;
              });
            }}
            className="text-xs font-medium text-[var(--sys-ink-2)] hover:text-[var(--sys-link,var(--sys-brand))] transition-colors cursor-pointer"
          >
            {showDetailsInput ? 'Ocultar instrução' : '+ Instrução (opcional)'}
          </button>

          {showDetailsInput && (
            <div className="mt-2">
              <textarea
                id="chk-new-desc"
                rows={2}
                maxLength={300}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Ex.: Subir sobre paletes antes das 16h"
                className="sys-input text-xs"
              />
            </div>
          )}
        </div>
      </form>

      {/* Lista por Categorias */}
      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2.5 text-xs text-[var(--sys-ink-2)]">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
          <span>Carregando informações do checklist...</span>
        </div>
      ) : presentCategories.length === 0 ? (
        <div className="py-10 text-center text-sm text-[var(--sys-ink-2)]">
          Nenhuma tarefa cadastrada. Clique em &quot;Sugerir itens do ramo&quot; ou adicione acima.
        </div>
      ) : (
        <div className="space-y-8">
          {visibleCategoryKeys.map((categoryKey) => {
            const meta = CATEGORY_META[categoryKey];
            const groupItems = groupedByCategory.get(categoryKey) ?? [];

            return (
              <section key={categoryKey} className="space-y-1">
                <div className="flex items-center justify-between pb-2.5 border-b border-[var(--sys-border)]">
                  <h2 className="font-editorial text-xl font-normal text-[var(--sys-ink)]">
                    {meta.label}
                  </h2>
                  <span className="font-mono-data text-xs text-[var(--sys-ink-3)] tabular-nums">
                    {groupItems.filter((i) => i.status === 'CONCLUIDO').length}/{groupItems.length}
                  </span>
                </div>

                {groupItems.length === 0 ? (
                  <p className="py-4 text-xs text-[var(--sys-ink-3)]">Sem tarefas nesta categoria.</p>
                ) : (
                  <div className="divide-y divide-[var(--sys-border)]">
                    {groupItems.map((item) => {
                      const done = item.status === 'CONCLUIDO';
                      const inProgress = item.status === 'EM_ANDAMENTO';
                      const prio = priorityMeta(item.prioridade);
                      return (
                        <div
                          key={item.id}
                          className="py-3.5 flex items-start justify-between gap-3"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggle(item)}
                            disabled={busyId === item.id}
                            className="flex-1 flex items-start gap-3 text-left cursor-pointer disabled:opacity-50 min-w-0"
                          >
                            <span className="mt-0.5 shrink-0">
                              {done ? (
                                <CheckCircle2 className="w-[18px] h-[18px] text-[var(--sys-link,var(--sys-brand))]" />
                              ) : inProgress ? (
                                <Clock3 className="w-[18px] h-[18px] text-[var(--sys-warn-text)]" />
                              ) : (
                                <Circle className="w-[18px] h-[18px] text-[var(--sys-ink-dim)]" />
                              )}
                            </span>

                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span
                                  className={`text-sm font-medium leading-snug break-words ${
                                    done ? 'line-through text-[var(--sys-ink-3)]' : 'text-[var(--sys-ink)]'
                                  }`}
                                >
                                  {item.titulo}
                                </span>
                                <span className="sys-indicator text-xs shrink-0">
                                  <span className={`sys-indicator-dot ${prio.dotClass}`} />
                                  <span className={prio.textClass}>{prio.label}</span>
                                </span>
                              </div>

                              {item.descricao && (
                                <p className={`text-xs line-clamp-1 ${done ? 'text-[var(--sys-ink-dim)]' : 'text-[var(--sys-ink-2)]'}`}>
                                  {item.descricao}
                                </p>
                              )}
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={busyId === item.id}
                            className="p-1.5 rounded-[8px] text-[var(--sys-ink-3)] hover:text-[var(--sys-crit-text)] hover:bg-[var(--sys-sheet-subtle)] transition-colors cursor-pointer shrink-0"
                            aria-label="Excluir tarefa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
