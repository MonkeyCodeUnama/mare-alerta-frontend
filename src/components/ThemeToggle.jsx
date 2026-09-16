import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const STORAGE_KEY = 'mare-alerta-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function readStored() {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

// Sem escolha salva, o tema segue o sistema; o botão grava uma escolha explícita.
function currentTheme() {
  return document.documentElement.dataset.theme || (media.matches ? 'dark' : 'light');
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    const follow = () => { if (!readStored()) setTheme(currentTheme()); };
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* armazenamento indisponível: vale só nesta sessão */ }
    setTheme(next);
  };

  const label = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro';
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label={label} title={label}>
    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
