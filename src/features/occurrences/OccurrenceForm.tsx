import { useState } from 'react';
import { Check, ClipboardList, Droplets, Printer, Upload } from 'lucide-react';
import { ocorrenciasApi } from '../../shared/api/client';
import type { NivelAlagamento, OcorrenciaResponse } from '../../shared/api/types';
import CustomDatePicker from '../../shared/components/CustomDatePicker';
import CustomSelect, { type CustomSelectOption } from '../../shared/components/CustomSelect';
import CustomTimePicker from '../../shared/components/CustomTimePicker';

const DAMAGE_TAGS = [
  'ESTOQUE',
  'EQUIPAMENTOS',
  'ESTRUTURA',
  'PARALISACAO',
  'ELETRICA',
] as const;

const SEVERITY_OPTIONS: ReadonlyArray<{
  value: NivelAlagamento;
  label: string;
  hint: string;
}> = [
  { value: 'LEVE', label: 'Leve', hint: 'Lâmina rasa' },
  { value: 'MODERADO', label: 'Moderado', hint: 'Atingiu entrada' },
  { value: 'GRAVE', label: 'Grave', hint: 'Água no salão' },
  { value: 'CRITICO', label: 'Crítico', hint: 'Dano severo' },
];

const WATER_LEVEL_OPTIONS: readonly CustomSelectOption[] = [
  { value: 'ATE_10CM', label: 'Até 10 cm' },
  { value: 'ATE_30CM', label: '10 a 30 cm' },
  { value: 'ACIMA_30CM', label: '30 a 60 cm' },
  { value: 'ACIMA_60CM', label: 'Acima de 60 cm' },
];

export default function OccurrenceForm() {
  const [titulo, setTitulo] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [horaInicio, setHoraInicio] = useState('16:30');
  const [horaFim, setHoraFim] = useState('18:10');
  const [nivelAlagamento, setNivelAlagamento] = useState<NivelAlagamento>('MODERADO');
  const [faixaLaminaAgua, setFaixaLaminaAgua] = useState('ATE_30CM');
  const [selectedDamages, setSelectedDamages] = useState<string[]>(['ESTOQUE', 'PARALISACAO']);
  const [valorEstimadoPrejuizo, setValorEstimadoPrejuizo] = useState('');
  const [horasFechado, setHorasFechado] = useState('');
  const [descricao, setDescricao] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<OcorrenciaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleDamageTag(tag: string) {
    setSelectedDamages((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files).slice(0, 4));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (horaFim && horaInicio && horaFim < horaInicio) {
      setError('O horário de término deve ser igual ou posterior ao horário de início.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setCreated(null);

    try {
      const occ = await ocorrenciasApi.registrar({
        titulo: titulo.trim() || 'Registro de alagamento',
        descricao: descricao.trim() || undefined,
        status: 'ENVIADA',
        nivelAlagamento,
        dataOcorrencia,
        horaInicio,
        horaFim: horaFim || undefined,
        faixaLaminaAgua,
        categoriasDano: selectedDamages.join(', ') || undefined,
        valorEstimadoPrejuizo: valorEstimadoPrejuizo
          ? Number(valorEstimadoPrejuizo)
          : undefined,
        horasFechado: horasFechado ? Math.round(Number(horasFechado)) : undefined,
      });

      setCreated(occ);
      setTitulo('');
      setDescricao('');
      setValorEstimadoPrejuizo('');

      let failedPhotos = 0;
      for (const file of files) {
        try {
          await ocorrenciasApi.uploadFoto(occ.id, file);
        } catch {
          failedPhotos += 1;
        }
      }

      setFiles([]);
      if (failedPhotos > 0) {
        setError(
          `Protocolo ${occ.protocolo} criado, mas ${failedPhotos} foto(s) não puderam ser enviadas.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao emitir protocolo.');
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = 'block text-xs font-medium text-[var(--sys-ink-2)]';
  const inputClass = 'sys-input';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--sys-border)] pb-4">
        <h1 className="font-editorial text-2xl sm:text-[32px] font-normal tracking-tight text-[var(--sys-ink)]">
          Nova ocorrência
        </h1>

        <a href="/ocorrencias/lista" className="sys-btn-secondary shrink-0">
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Ver protocolos</span>
        </a>
      </header>

      {created && (
        <div className="sys-box p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-[var(--sys-ink)]">
            <span className="sys-indicator">
              <span className="sys-indicator-dot bg-[var(--sys-dot-ok)]" />
              <span className="text-[var(--sys-ok-text)]">Emitido</span>
            </span>
            <span className="font-mono-data text-xs sm:text-sm">Protocolo {created.protocolo}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="sys-btn-secondary text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>
            <a href="/ocorrencias/lista" className="text-xs font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline">
              Ver protocolos →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="border-b border-[var(--sys-border)] pb-3 text-xs font-medium text-[var(--sys-crit-text)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-8 space-y-5 min-w-0">
          <div className="space-y-1.5">
            <label className={labelClass}>Título *</label>
            <input
              type="text"
              required
              maxLength={120}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Alagamento na entrada principal"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="occ-date-picker" className={labelClass}>Data *</label>
              <CustomDatePicker
                id="occ-date-picker"
                ariaLabel="Data da ocorrência"
                value={dataOcorrencia}
                onChange={setDataOcorrencia}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="occ-start-time" className={labelClass}>Início *</label>
              <CustomTimePicker
                id="occ-start-time"
                ariaLabel="Horário de início"
                value={horaInicio}
                onChange={setHoraInicio}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="occ-end-time" className={labelClass}>Fim</label>
              <CustomTimePicker
                id="occ-end-time"
                ariaLabel="Horário de término"
                value={horaFim}
                onChange={setHoraFim}
                allowClear
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Nível da ocorrência</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEVERITY_OPTIONS.map((opt) => {
                const selected = nivelAlagamento === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setNivelAlagamento(opt.value)}
                    className={`rounded-[10px] p-3 text-left transition-colors cursor-pointer min-w-0 ${
                      selected
                        ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                        : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink)] hover:bg-[var(--sys-rail-active-bg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[13px] font-medium">{opt.label}</span>
                      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="occ-water-level" className={labelClass}>
                Altura da água
              </label>
              <CustomSelect
                id="occ-water-level"
                ariaLabel="Altura da água"
                value={faixaLaminaAgua}
                onChange={setFaixaLaminaAgua}
                options={WATER_LEVEL_OPTIONS}
                leftIcon={<Droplets className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Prejuízo estimado (R$)</label>
              <input
                type="number"
                min="0"
                max="99999999"
                step="0.01"
                value={valorEstimadoPrejuizo}
                onChange={(e) => setValorEstimadoPrejuizo(e.target.value)}
                placeholder="0,00"
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Horas fechado</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="720"
                step="1"
                value={horasFechado}
                onChange={(e) => setHorasFechado(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="Ex.: 3"
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Áreas afetadas</label>
            <div className="flex flex-wrap gap-1.5">
              {DAMAGE_TAGS.map((tag) => {
                const selected = selectedDamages.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDamageTag(tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                        : 'bg-[var(--sys-card-bg)] text-[var(--sys-ink-2)] hover:text-[var(--sys-ink)]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Observações</label>
            <textarea
              rows={3}
              maxLength={500}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes do ocorrido..."
              className={inputClass}
            />
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-5 lg:border-l lg:border-[var(--sys-border)] lg:pl-8 min-w-0">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--sys-ink-2)]">Fotos</span>
            <span className="font-mono-data text-[var(--sys-ink-2)] tabular-nums">
              {files.length}/4
            </span>
          </div>

          <label className="block rounded-[12px] bg-[var(--sys-card-bg)] p-6 text-center cursor-pointer hover:bg-[var(--sys-rail-active-bg)] transition-colors">
            <Upload className="w-4 h-4 text-[var(--sys-ink)] mx-auto mb-2" />
            <span className="block text-[13px] font-medium text-[var(--sys-ink)]">
              Anexar até 4 fotos
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {files.length > 0 && (
            <ul className="divide-y divide-[var(--sys-border)] border-y border-[var(--sys-border)] text-xs">
              {files.map((file) => (
                <li key={file.name} className="py-2.5 flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-[var(--sys-ink)]">{file.name}</span>
                  <span className="font-mono-data text-[var(--sys-ink-3)] shrink-0 tabular-nums">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button type="submit" disabled={submitting} className="sys-btn-primary w-full py-2.5">
            {submitting ? 'Emitindo...' : 'Emitir protocolo'}
          </button>
        </aside>
      </form>
    </div>
  );
}
