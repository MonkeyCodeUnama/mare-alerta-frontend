import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  ariaLabel?: string;
  required?: boolean;
  className?: string;
}

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS_PT = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (month < 0 || month > 11 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function toIsoDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function formatDisplayPt(iso: string): string {
  const parsed = parseIsoDate(iso);
  if (!parsed) return 'Selecionar data';
  return `${String(parsed.day).padStart(2, '0')}/${String(parsed.month + 1).padStart(2, '0')}/${parsed.year}`;
}

function getBelemTodayIso(): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Belem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // Fallback para hora local caso timezone não esteja disponível
  }
  const now = new Date();
  return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Seletor de data tonal para substituir a roleta nativa de calendário do navegador.
 */
export default function CustomDatePicker({
  id,
  value,
  onChange,
  ariaLabel = 'Selecionar data',
  className = '',
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const dialogId = `${id || autoId}-calendar`;

  const todayIso = useMemo(() => getBelemTodayIso(), []);
  const initialParsed = parseIsoDate(value) || parseIsoDate(todayIso)!;

  const [viewYear, setViewYear] = useState<number>(initialParsed.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.month);

  function toggleOpen() {
    if (!open) {
      const target = parseIsoDate(value) || parseIsoDate(todayIso)!;
      setViewYear(target.year);
      setViewMonth(target.month);
    }
    setOpen((prev) => !prev);
  }

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: Array<{ day: number | null; iso?: string }> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, iso: toIsoDate(viewYear, viewMonth, d) });
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={dialogId}
        aria-label={ariaLabel}
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between gap-2.5 min-h-[40px] rounded-[10px] border-[1.5px] px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
          open
            ? 'border-[var(--sys-link,var(--sys-brand))] bg-[var(--sys-card-bg)] text-[var(--sys-ink)]'
            : 'border-transparent bg-[var(--sys-input-bg)] text-[var(--sys-ink)] hover:bg-[var(--sys-rail-active-bg)]'
        }`}
      >
        <span className={`font-medium tabular-nums ${value ? '' : 'text-[var(--sys-ink-3)]'}`}>
          {formatDisplayPt(value)}
        </span>
        <Calendar
          className={`w-4 h-4 shrink-0 transition-colors ${
            open ? 'text-[var(--sys-link,var(--sys-brand))]' : 'text-[var(--sys-ink-3)]'
          }`}
        />
      </button>

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label="Calendário"
          className="absolute left-0 z-40 mt-1.5 w-[268px] rounded-2xl bg-[var(--sys-rail-surface)] p-3.5 shadow-[0_14px_36px_-10px_rgba(4,16,38,0.28)]"
        >
          <div className="flex items-center justify-between gap-2 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mês anterior"
              className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[var(--sys-ink-2)] hover:bg-[var(--sys-sheet-muted)] hover:text-[var(--sys-ink)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold text-[var(--sys-ink)]">
              {MONTH_NAMES_PT[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Próximo mês"
              className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-[var(--sys-ink-2)] hover:bg-[var(--sys-sheet-muted)] hover:text-[var(--sys-ink)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center pb-1">
            {WEEKDAYS_PT.map((label, idx) => (
              <span key={idx} className="text-[10px] font-medium text-[var(--sys-ink-3)] py-1">
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              if (!cell.day || !cell.iso) {
                return <span key={`empty-${idx}`} className="h-8" />;
              }
              const isSelected = cell.iso === value;
              const isToday = cell.iso === todayIso;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => {
                    onChange(cell.iso!);
                    setOpen(false);
                  }}
                  className={`h-8 rounded-lg text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                      : isToday
                        ? 'bg-[var(--sys-sheet-subtle)] text-[var(--sys-link,var(--sys-brand))] font-semibold hover:bg-[var(--sys-sheet-muted)]'
                        : 'text-[var(--sys-ink)] hover:bg-[var(--sys-sheet-muted)]'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--sys-border)]">
            <button
              type="button"
              onClick={() => {
                onChange(todayIso);
                setOpen(false);
              }}
              className="text-[11px] font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline cursor-pointer"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] font-medium text-[var(--sys-ink-3)] hover:text-[var(--sys-ink)] cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
