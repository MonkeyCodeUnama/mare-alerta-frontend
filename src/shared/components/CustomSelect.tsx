import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  hint?: string;
  badge?: string;
}

interface CustomSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<CustomSelectOption>;
  placeholder?: string;
  ariaLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
  alignRight?: boolean;
  leftIcon?: React.ReactNode;
}

/**
 * Seletor editorial acessível para substituir caixas nativas `<select>` em todo o sistema.
 */
export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecionar',
  ariaLabel,
  size = 'md',
  className = '',
  alignRight = false,
  leftIcon,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const listboxId = `${id || autoId}-listbox`;

  const selected = options.find((opt) => opt.value.toUpperCase() === value.toUpperCase());

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

  const paddingClasses =
    size === 'sm' ? 'px-3 py-2 text-xs rounded-xl' : 'px-3.5 py-2.5 text-sm rounded-xl';

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 border text-left transition-all cursor-pointer ${paddingClasses} ${
          open
            ? 'border-[var(--sys-link,var(--color-brand-primary))] bg-[var(--sys-card-bg,var(--color-surface))] text-[var(--color-text-primary)]'
            : 'border-[var(--sys-combobox-border,var(--color-border-editorial))] bg-[var(--sys-input-bg,var(--color-canvas))] text-[var(--color-text-primary)] hover:bg-[var(--sys-rail-active-bg,var(--color-surface))]'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          {leftIcon && (
            <span className="shrink-0 text-[var(--color-text-muted)] flex items-center">
              {leftIcon}
            </span>
          )}
          <span className={`truncate font-medium ${selected ? '' : 'text-[var(--color-text-muted)]'}`}>
            {selected ? selected.label : placeholder}
          </span>
          {selected?.badge && (
            <span className="shrink-0 rounded-full bg-[var(--sys-brand-soft,rgba(30,90,160,0.12))] px-2 py-0.5 font-mono-data text-[10px] font-medium text-[var(--sys-link,var(--color-brand-primary))]">
              {selected.badge}
            </span>
          )}
        </span>

        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[var(--color-text-muted)] transition-transform duration-200 ${
            open ? 'rotate-180 text-[var(--sys-link,var(--color-brand-primary))]' : ''
          }`}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          className={`absolute z-40 mt-1.5 min-w-full w-max max-w-[min(22rem,88vw)] max-h-64 overflow-y-auto rounded-2xl border border-[var(--sys-combobox-border,var(--color-border-editorial))] bg-[var(--sys-rail-surface,var(--color-surface))] p-1.5 shadow-[0_14px_36px_-10px_rgba(4,16,38,0.22)] ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value.toUpperCase() === value.toUpperCase();
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--sys-brand-soft,rgba(30,90,160,0.12))] text-[var(--sys-link,var(--color-brand-primary))] font-semibold'
                    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)]'
                }`}
              >
                <div className="min-w-0">
                  <span className="block truncate">{opt.label}</span>
                  {opt.hint && (
                    <span className="block truncate text-[11px] font-normal text-[var(--color-text-muted)]">
                      {opt.hint}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {opt.badge && (
                    <span className="font-mono-data text-[10px] text-[var(--color-text-muted)]">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--sys-link,var(--color-brand-primary))]" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
