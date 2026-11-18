import { useCallback, useEffect, useState } from 'react';
import { Building2, Check, MapPin, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import {
  estabelecimentoApi,
  hasRealAuthToken,
  itensCriticosApi,
} from '../../shared/api/client';
import type {
  EstabelecimentoResponse,
  ItemCriticoResponse,
  TipoNegocio,
} from '../../shared/api/types';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import CustomTimePicker from '../../shared/components/CustomTimePicker';
import {
  BUSINESS_TYPES,
  NEIGHBORHOODS,
  formatCepInput,
  formatCpfCnpjInput,
  formatPhoneInput,
  isValidCep,
  isValidCpfCnpj,
  isValidPhoneBR,
  normalizeBrPhoneDigits,
  onlyDigits,
  riskDotClass,
  riskTextClass,
} from '../../shared/lib/formatters';

const DAYS_OF_WEEK = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'] as const;

function normalizeDayCode(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toUpperCase()
    .slice(0, 3);
}

function normalizeTimeHHmm(raw?: string | null): string {
  return (raw ?? '').trim().slice(0, 5);
}

const BUSINESS_OPTIONS: readonly CustomSelectOption[] = BUSINESS_TYPES.map((bt) => ({
  value: bt.value,
  label: bt.label,
}));

const NEIGHBORHOOD_OPTIONS: readonly CustomSelectOption[] = NEIGHBORHOODS.map((b) => ({
  value: b.codigo,
  label: b.descricao,
}));

export default function EstablishmentForm() {
  const [establishment, setEstablishment] = useState<EstabelecimentoResponse | null>(null);
  const [criticalItems, setCriticalItems] = useState<ItemCriticoResponse[]>([]);

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [bairro, setBairro] = useState('CAMPINA');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cep, setCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>('MERCADO');
  const [horarioAbertura, setHorarioAbertura] = useState('07:00');
  const [horarioFechamento, setHorarioFechamento] = useState('19:00');
  const [dias, setDias] = useState<string[]>(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']);

  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [showItemDetails, setShowItemDetails] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEstablishment = useCallback(async () => {
    if (!hasRealAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const [meu, itens] = await Promise.all([
        estabelecimentoApi.meu(),
        itensCriticosApi.listar(),
      ]);
      setEstablishment(meu);
      setCriticalItems(itens);
      setNome(meu.nome || '');
      setDocumento(formatCpfCnpjInput(meu.documento));
      setResponsavel(meu.responsavel || '');
      setBairro(meu.bairro || 'CAMPINA');
      setLogradouro(meu.logradouro || '');
      setNumero(meu.numero || '');
      setComplemento(meu.complemento || '');
      setCep(formatCepInput(meu.cep));
      setTelefone(formatPhoneInput(meu.telefone));
      if (meu.tipoNegocio) setTipoNegocio(meu.tipoNegocio);
      const openTime = normalizeTimeHHmm(meu.horarioAbertura);
      const closeTime = normalizeTimeHHmm(meu.horarioFechamento);
      if (openTime) setHorarioAbertura(openTime);
      if (closeTime) setHorarioFechamento(closeTime);
      if (meu.dias && meu.dias.length > 0) {
        const normalized = meu.dias
          .map(normalizeDayCode)
          .filter((d) => (DAYS_OF_WEEK as readonly string[]).includes(d));
        if (normalized.length > 0) setDias(normalized);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os dados do estabelecimento.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return loadEstablishment();
    });
    return () => {
      active = false;
    };
  }, [loadEstablishment]);

  function toggleDay(day: string) {
    setDias((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!establishment) return;
    setFeedback(null);
    setError(null);

    if (!nome.trim()) {
      setError('Informe o nome do estabelecimento.');
      return;
    }
    if (!isValidCpfCnpj(documento)) {
      setError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }
    if (!isValidPhoneBR(telefone)) {
      setError('Informe um WhatsApp válido com DDD (10 ou 11 dígitos).');
      return;
    }
    if (!isValidCep(cep)) {
      setError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setSaving(true);
    const segmentChanged = establishment.tipoNegocio !== tipoNegocio;

    try {
      const cleanDoc = onlyDigits(documento, 14);
      const cleanCep = onlyDigits(cep, 8);
      const cleanPhone = normalizeBrPhoneDigits(telefone);

      const updated = await estabelecimentoApi.atualizar(establishment.id, {
        nome: nome.trim(),
        documento: cleanDoc || undefined,
        responsavel: responsavel.trim() || undefined,
        bairro,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        cep: cleanCep || undefined,
        municipio: 'Belém',
        uf: 'PA',
        telefone: cleanPhone || undefined,
        tipoNegocio,
        dias,
        horarioAbertura,
        horarioFechamento,
        itensCriticos: criticalItems.map((i) => i.nome),
      });
      setEstablishment(updated);
      setFeedback(
        segmentChanged
          ? 'Alterações salvas e checklist preventivo atualizado para o novo segmento.'
          : 'Alterações salvas com sucesso.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar as alterações agora.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCriticalItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    setAddingItem(true);
    setError(null);
    try {
      const created = await itensCriticosApi.criar({
        estabelecimentoId: establishment?.id,
        nome: newItemName.trim(),
        ...(newItemDesc.trim() ? { descricao: newItemDesc.trim() } : {}),
      });
      setCriticalItems((prev) => [created, ...prev]);
      setNewItemName('');
      setNewItemDesc('');
      setShowItemDetails(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao adicionar.');
    } finally {
      setAddingItem(false);
    }
  }

  async function handleDeleteCriticalItem(id: number) {
    try {
      await itensCriticosApi.deletar(id);
      setCriticalItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao remover.');
    }
  }

  const labelClass = 'block text-xs font-medium text-[var(--sys-ink-2)]';
  const inputClass = 'sys-input';

  const selectedDistrict = NEIGHBORHOODS.find((b) => b.codigo === bairro) ?? NEIGHBORHOODS[0];

  if (loading) {
    return (
      <div className="py-14 flex items-center justify-center gap-2.5 text-xs text-[var(--sys-ink-2)]">
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--sys-link,var(--sys-brand))]" />
        <span>Carregando informações do estabelecimento...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
          Estabelecimento
        </h1>

        <button
          type="submit"
          form="establishment-form"
          disabled={saving}
          className="sys-btn-primary shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Salvando...' : 'Salvar alterações'}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <form
          id="establishment-form"
          onSubmit={handleSave}
          className="lg:col-span-7 space-y-6 min-w-0"
        >
          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-[var(--sys-ink)] pb-2 border-b border-[var(--sys-border)]">
              Dados cadastrais
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>Nome *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>CNPJ / CPF</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={18}
                  placeholder="00.000.000/0001-00"
                  value={documento}
                  onChange={(e) => setDocumento(formatCpfCnpjInput(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Responsável</label>
                <input
                  type="text"
                  maxLength={120}
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="est-segment-select" className={labelClass}>
                  Segmento
                </label>
                <CustomSelect
                  id="est-segment-select"
                  ariaLabel="Segmento"
                  value={tipoNegocio}
                  onChange={(val) => setTipoNegocio(val as TipoNegocio)}
                  options={BUSINESS_OPTIONS}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>WhatsApp</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(91) 98412-0099"
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhoneInput(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-[var(--sys-ink)] pb-2 border-b border-[var(--sys-border)]">
              Endereço
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="est-bairro-select" className={labelClass}>
                  Bairro
                </label>
                <CustomSelect
                  id="est-bairro-select"
                  ariaLabel="Bairro"
                  value={bairro}
                  onChange={setBairro}
                  options={NEIGHBORHOOD_OPTIONS}
                  leftIcon={<MapPin className="w-4 h-4" />}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>CEP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="66000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCepInput(e.target.value))}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className={labelClass}>Endereço</label>
                <input
                  type="text"
                  maxLength={180}
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Número</label>
                <input
                  type="text"
                  maxLength={15}
                  placeholder="Ex.: 420 ou S/N"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Complemento</label>
                <input
                  type="text"
                  maxLength={80}
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-medium text-[var(--sys-ink)] pb-2 border-b border-[var(--sys-border)]">
              Funcionamento
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="est-open-time" className={labelClass}>Abertura</label>
                <CustomTimePicker
                  id="est-open-time"
                  ariaLabel="Horário de abertura"
                  value={horarioAbertura}
                  onChange={setHorarioAbertura}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="est-close-time" className={labelClass}>Fechamento</label>
                <CustomTimePicker
                  id="est-close-time"
                  ariaLabel="Horário de fechamento"
                  value={horarioFechamento}
                  onChange={setHorarioFechamento}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Dias</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const active = dias.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-[8px] font-mono-data text-xs transition-colors cursor-pointer min-w-[60px] ${
                        active
                          ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)] font-medium'
                          : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 shrink-0" />}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="pt-1 sm:hidden">
            <button type="submit" disabled={saving} className="sys-btn-primary w-full">
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Salvando...' : 'Salvar alterações'}</span>
            </button>
          </div>
        </form>

        {/* Direita: Bairro + Itens Sensíveis */}
        <aside className="lg:col-span-5 lg:border-l lg:border-[var(--sys-border)] lg:pl-8 space-y-6 min-w-0">
          <div className="sys-box p-5 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-[var(--sys-ink-3)] font-medium">Bairro</span>
              <span className="sys-indicator">
                <span className={`sys-indicator-dot ${riskDotClass(selectedDistrict.nivelVulnerabilidade)}`} />
                <span className={riskTextClass(selectedDistrict.nivelVulnerabilidade)}>
                  {selectedDistrict.nivelVulnerabilidade}
                </span>
              </span>
            </div>

            <h2 className="font-editorial text-2xl font-normal text-[var(--sys-ink)]">
              {selectedDistrict.descricao}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--sys-border)]">
              <h2 className="text-[14px] font-medium text-[var(--sys-ink)]">Itens sensíveis</h2>
              <span className="font-mono-data text-xs text-[var(--sys-ink-3)] tabular-nums">
                {criticalItems.length}
              </span>
            </div>

            <form onSubmit={handleAddCriticalItem} className="space-y-2">
              <div className="flex gap-2">
                <input
                  id="est-new-item-name"
                  type="text"
                  required
                  maxLength={100}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Ex.: Nobreak do caixa"
                  className={inputClass}
                />
                <button
                  type="submit"
                  disabled={addingItem}
                  aria-label="Adicionar item"
                  className="sys-btn-secondary shrink-0 px-3"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemDetails((prev) => {
                      if (prev) setNewItemDesc('');
                      return !prev;
                    });
                  }}
                  className="text-xs font-medium text-[var(--sys-ink-2)] hover:text-[var(--sys-link,var(--sys-brand))] transition-colors cursor-pointer"
                >
                  {showItemDetails ? 'Ocultar detalhe' : '+ Observação (opcional)'}
                </button>
                {showItemDetails && (
                  <div className="mt-2">
                    <textarea
                      id="est-new-item-desc"
                      rows={2}
                      maxLength={240}
                      value={newItemDesc}
                      onChange={(e) => setNewItemDesc(e.target.value)}
                      placeholder="Ex.: Piso térreo"
                      className="sys-input text-xs"
                    />
                  </div>
                )}
              </div>
            </form>

            <div className="divide-y divide-[var(--sys-border)] border-t border-[var(--sys-border)] max-h-[340px] overflow-y-auto">
              {criticalItems.length === 0 ? (
                <p className="text-xs text-[var(--sys-ink-3)] text-center py-6">
                  Nenhum item.
                </p>
              ) : (
                criticalItems.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <span className="block text-[13px] font-medium text-[var(--sys-ink)] truncate">
                        {item.nome}
                      </span>
                      {item.descricao && (
                        <span className="block text-xs text-[var(--sys-ink-3)] line-clamp-1">
                          {item.descricao}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCriticalItem(item.id)}
                      className="p-1.5 rounded-[6px] text-[var(--sys-ink-3)] hover:text-[var(--sys-crit-text)] hover:bg-[var(--sys-sheet-subtle)] transition-colors cursor-pointer shrink-0"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
