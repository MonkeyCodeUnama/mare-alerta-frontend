import { useEffect, useState } from 'react';

export interface ChartThemePalette {
  isDark: boolean;
  tideStroke: string;
  tideFillStart: string;
  tideFillEnd: string;
  rainStroke: string;
  rainFillStart: string;
  rainFillEnd: string;
  safeZoneFill: string;
  riskZoneFill: string;
  refAttention: string;
  refOverflow: string;
  gridStroke: string;
  axisTick: string;
}

export const SYSTEM_LIGHT_CHART_PALETTE: ChartThemePalette = {
  isDark: false,
  tideStroke: 'oklch(41% 0.112 244)',
  tideFillStart: 'oklch(41% 0.112 244 / 0.22)',
  tideFillEnd: 'oklch(41% 0.112 244 / 0.01)',
  rainStroke: 'oklch(54% 0.095 228)',
  rainFillStart: 'oklch(54% 0.095 228 / 0.26)',
  rainFillEnd: 'oklch(54% 0.095 228 / 0.03)',
  safeZoneFill: 'oklch(56% 0.080 236 / 0.055)',
  riskZoneFill: 'oklch(58% 0.115 48 / 0.085)',
  refAttention: 'oklch(62% 0.085 68)',
  refOverflow: 'oklch(55% 0.115 48)',
  gridStroke: 'oklch(89% 0.010 245 / 0.72)',
  axisTick: 'oklch(47% 0.016 245)',
};

export const SYSTEM_DARK_CHART_PALETTE: ChartThemePalette = {
  isDark: true,
  tideStroke: 'oklch(72% 0.100 238)',
  tideFillStart: 'oklch(72% 0.100 238 / 0.24)',
  tideFillEnd: 'oklch(72% 0.100 238 / 0.02)',
  rainStroke: 'oklch(74% 0.095 216)',
  rainFillStart: 'oklch(74% 0.095 216 / 0.26)',
  rainFillEnd: 'oklch(74% 0.095 216 / 0.03)',
  safeZoneFill: 'oklch(72% 0.075 236 / 0.055)',
  riskZoneFill: 'oklch(71% 0.100 48 / 0.095)',
  refAttention: 'oklch(75% 0.080 70)',
  refOverflow: 'oklch(71% 0.105 48)',
  gridStroke: 'oklch(100% 0 0 / 0.075)',
  axisTick: 'oklch(72% 0.012 240)',
};

export const PAPER_CHART_PALETTE = SYSTEM_LIGHT_CHART_PALETTE;

export function getChartPalette(isDark: boolean): ChartThemePalette {
  return isDark ? SYSTEM_DARK_CHART_PALETTE : SYSTEM_LIGHT_CHART_PALETTE;
}

/**
 * Observa mudanças no atributo `data-theme` do `<html>` e no evento customizado
 * `theme-changed` para re-renderizar o SVG do Recharts em tempo real.
 */
function readIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

export function useChartTheme(): ChartThemePalette {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (active) setIsDark(readIsDark());
    };
    void Promise.resolve().then(sync);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'data-theme') {
          sync();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    window.addEventListener('theme-changed', sync);
    return () => {
      active = false;
      observer.disconnect();
      window.removeEventListener('theme-changed', sync);
    };
  }, []);

  return isDark ? SYSTEM_DARK_CHART_PALETTE : SYSTEM_LIGHT_CHART_PALETTE;
}
