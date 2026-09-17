# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

"Maré Alerta" — protótipo de front-end (React 19 + Vite 8, JavaScript puro, sem TypeScript) que alerta o comércio de Belém sobre alagamentos por maré. **Não há backend**: todos os dados são simulados no cliente. A interface e os comentários do código são em português do Brasil; mantenha esse idioma ao escrever textos de UI e comentários.

## Comandos

```bash
npm run dev      # servidor de desenvolvimento (Vite)
npm run build    # build de produção em dist/
npm run lint     # oxlint (não ESLint)
npm run preview  # serve o build
```

Não existe suíte de testes nem runner configurado.

Variáveis de ambiente opcionais em `.env.example` (`VITE_WHATSAPP_TEAM_URL`, `VITE_WHATSAPP_GROUP_URL`); são lidas em `src/config.js` e consumidas por `ExternalLink`, que renderiza um botão desabilitado quando a URL está vazia.

## Arquitetura

- **Rotas** (`src/App.jsx`): `/` (Home/login), `/cadastro`, e quatro telas operacionais — `/dashboard`, `/checklist`, `/historico`, `/ocorrencias`, `/estabelecimento`. As telas operacionais (exceto Dashboard) vivem todas em `src/pages/Operations.jsx` como exports nomeados.
- **`src/components/AppShell.jsx`**: layout comum (sidebar + topo) de todas as telas autenticadas. Recebe `active` (o path da rota) para marcar o item de navegação.
- **`src/data/tide.js`**: fonte única dos dados de maré. A série de 24h é **gerada matematicamente** por um modelo semidiurno (período 12h25, preamar às 16:40), não é uma tabela fixa. Valores derivados (`safeUntil`, `trend`, picos) saem das mesmas constantes. Alterar uma constante muda todas as telas — nunca duplique números de maré em componentes; importe de `tide.js` e formate com `formatLevel` / `formatDuration` / `clockOf`.
- **`src/state/`**: contexto global do estabelecimento. `store.js` exporta o `StoreContext`, o hook `useStore`, `NEIGHBORHOODS` e `DEMO_STORE`; `StoreContext.jsx` tem o `StoreProvider`, que persiste em `localStorage` (`mare-alerta-store`). A separação existe para satisfazer a regra `react/only-export-components` do oxlint — mantenha hooks/constantes em `store.js` e o componente provider em `StoreContext.jsx`.
- **`src/components/TideChart.jsx`**: gráfico Recharts (área de nível + barras de chuva) com seletor de faixa, ponto fixado e tabela alternativa acessível.

## Estilo e tema

- CSS puro, sem Tailwind nem pipeline PostCSS. `src/index.css` define os tokens (`--bg`, `--brand`, `--chart-*`, …); `src/App.css` traz todos os estilos de tela.
- **Nunca use cores literais em CSS** — use os tokens, porque o tema escuro só redefine as variáveis.
- O tema tem três estados: sem escolha salva segue `prefers-color-scheme`; `ThemeToggle` grava `light`/`dark` em `localStorage` (`mare-alerta-theme`) e define `document.documentElement.dataset.theme`. Um script inline em `index.html` aplica a escolha antes da primeira pintura. Toda regra de tema escuro precisa existir **duas vezes**: em `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) … }` e em `:root[data-theme='dark'] …`.
- O Recharts recebe cores literais via props (`COLORS` em `TideChart.jsx`) apenas como fallback; as cores reais vêm de regras CSS sobre `.tide-chart-area .recharts-*` e classes `ref-*` no fim do `App.css`. Ao mudar cores do gráfico, mude o CSS.

## Convenções de código

- JSX compacto, frequentemente retornando elementos sem parênteses e com props/handlers em uma linha — siga o estilo do arquivo vizinho.
- Todo acesso a `localStorage` é envolvido em `try/catch` (o app precisa funcionar com armazenamento bloqueado).
- Acessibilidade é tratada explicitamente: `aria-label`/`aria-current`/`aria-hidden` nos ícones e navegação, alternativa em tabela para o gráfico. Preserve isso ao editar.
- Assets exportados do Figma ficam em `src/assets/figma/**` e são importados por módulo (não por caminho `/public`).
