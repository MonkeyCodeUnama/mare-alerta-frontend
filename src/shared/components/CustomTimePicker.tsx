import { useEffect, useId, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

interface CustomTimePickerProps {
  id?: string;
  value: string; // HH:mm
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  allowClear?: boolean;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function parseTime(value: string): { hour: string; minute: string } | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  return { hour: m[1], minute: m[2] };
}

/**
 * Seletor de horário em grade dupla (hora x minutos) para substituir a roleta nativa de horas.
 */
export default function CustomTimePicker({
  id,
  value,
  onChange,
  ariaLabel = 'Selecionar horário',
  placeholder = '— : —',
  allowClear = false,
  className = '',
}: CustomTimePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const popoverId = `${id || autoId}-timepicker`;

  const parsed = parseTime(value);
  const activeHour = parsed?.hour ?? '08';
  const activeMinute = parsed?.minute ?? '00';

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

  function selectHour(h: string) {
    onChange(`${h}:${activeMinute}`);
  }

  function selectMinute(m: string) {
    onChange(`${activeHour}:${m}`);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 min-h-[40px] rounded-[10px] border-[1.5px] px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
          open
            ? 'border-[var(--sys-link,var(--sys-brand))] bg-[var(--sys-card-bg)] text-[var(--sys-ink)]'
            : 'border-transparent bg-[var(--sys-input-bg)] text-[var(--sys-ink)] hover:bg-[var(--sys-rail-active-bg)]'
        }`}
      >
        <span className={`font-medium tabular-nums ${parsed ? '' : 'text-[var(--sys-ink-3)]'}`}>
          {parsed ? `${parsed.hour}:${parsed.minute}` : placeholder}
        </span>
        <Clock
          className={`w-4 h-4 shrink-0 transition-colors ${
            open ? 'text-[var(--sys-link,var(--sys-brand))]' : 'text-[var(--sys-ink-3)]'
          }`}
        />
      </button>

      {open && (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Selecionar hora e minuto"
          className="absolute left-0 z-40 mt-1.5 w-[212px] rounded-2xl bg-[var(--sys-rail-surface)] p-3 shadow-[0_14px_36px_-10px_rgba(4,16,38,0.28)]"
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--sys-ink-3)] px-1">
                Hora
              </span>
              <div className="max-h-48 overflow-y-auto pr-0.5 space-y-0.5">
                {HOURS.map((h) => {
                  const selected = parsed?.hour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => selectHour(h)}
                      className={`w-full py-1.5 rounded-lg text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                          : 'text-[var(--sys-ink)] hover:bg-[var(--sys-sheet-muted)]'
                      }`}
                    >
                      {h} h
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-[var(--sys-ink-3)] px-1">
                Minuto
              </span>
              <div className="max-h-48 overflow-y-auto pr-0.5 space-y-0.5">
                {MINUTES.map((m) => {
                  const selected = parsed?.minute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => selectMinute(m)}
                      className={`w-full py-1.5 rounded-lg text-xs font-medium tabular-nums transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[var(--sys-brand)] text-[var(--sys-brand-ink)]'
                          : 'text-[var(--sys-ink)] hover:bg-[var(--sys-sheet-muted)]'
                      }`}
                    >
                      :{m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--sys-border)]">
            {allowClear ? (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-[11px] font-medium text-[var(--sys-ink-3)] hover:text-[var(--sys-ink)] cursor-pointer"
              >
                Limpar
              </button>
            ) : (
              <span className="text-[11px] tabular-nums text-[var(--sys-ink-3)]">
                {activeHour}:{activeMinute}
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                if (!parsed) onChange(`${activeHour}:${activeMinute}`);
                setOpen(false);
              }}
              className="text-[11px] font-medium text-[var(--sys-link,var(--sys-brand))] hover:underline cursor-pointer"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
