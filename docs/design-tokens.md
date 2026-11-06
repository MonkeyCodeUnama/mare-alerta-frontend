# Design tokens do Maré Alerta

As variáveis globais ficam em `src/index.css`. O tema segue a preferência do sistema até a pessoa escolher um tema com o `ThemeToggle`. O botão define `data-theme` no `<html>` e grava a escolha em `localStorage` na chave `mare-alerta-theme`. O `index.html` lê essa chave antes da primeira pintura. [Tokens globais](../src/index.css) · [Inicialização do tema](../index.html)

## Cores globais

### Superfícies, texto e marca

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--bg` | `#F8F9FF` | `#0A1120` | Fundo da página |
| `--surface` | `#FFFFFF` | `#111A2C` | Fundo de cartões e controles |
| `--surface-soft` | `#EFF4FF` | `#16213A` | Superfície secundária |
| `--border` | `#DFE6F1` | `#243250` | Contornos e divisórias |
| `--border-strong` | `#C9D1E2` | `#3A4A6B` | Contorno mais forte |
| `--text-h` | `#0B1C30` | `#E6ECF7` | Títulos e texto principal |
| `--text` | `#565E74` | `#A9B4C9` | Texto de apoio |
| `--text-muted` | `#6B6E80` | `#8591AA` | Texto de menor ênfase |
| `--brand` | `#1D4ED8` | `#2F5FE0` | Preenchimento de ações primárias |
| `--brand-hover` | `#1E40AF` | `#4471EE` | Preenchimento sob o ponteiro |
| `--brand-ink` | `#0037B0` | `#9DB9FF` | Links e texto de ações |
| `--brand-soft` | `#EFF4FF` | `#16213A` | Fundo suave de marca |
| `--brand-tint` | `#E6EFFF` | `#1B2C52` | Fundo de destaque de marca |
| `--brand-border` | `#9FC3FF` | `#4466A8` | Contorno de destaque de marca |

### Estados

| Estado | Token de texto | Token de fundo | Claro (texto / fundo) | Escuro (texto / fundo) |
| --- | --- | --- | --- | --- |
| Favorável | `--good-text` | `--good-bg` | `#047857` / `#E7F7EF` | `#6EE7B7` / `#0F2E25` |
| Atenção | `--warning-text` | `--warning-bg` | `#92400E` / `#FEF3C7` | `#FCD34D` / `#33260A` |
| Crítico | `--critical-text` | `--critical-bg` | `#9A3412` / `#FFEDD5` | `#FDBA74` / `#3A1C0B` |
| Erro | `--error-text` | `--error-bg` | `#9F1C1C` / `#FDECEC` | `#FCA5A5` / `#3B1515` |

### Gráfico de maré

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--chart-level` | `#1D4ED8` | `#7AA2FF` | Série de nível da maré |
| `--chart-rain` | `#4F7FE8` | `#4F7FE8` | Barras de chuva |
| `--chart-grid` | `#E6EBF3` | `#22304B` | Grade e linhas dos eixos |
| `--chart-axis` | `#747686` | `#8591AA` | Rótulos dos eixos e cursor |
| `--chart-attention` | `#D97706` | `#F59E0B` | Linha de atenção |
| `--chart-alert` | `#C2410C` | `#FB7A3C` | Linha de alerta |
| `--chart-now` | `#0B1C30` | `#C9D4EA` | Linha do horário atual |

O CSS de `.tide-chart-area` aplica esses tokens ao SVG do Recharts. O tooltip usa `--shadow`, com `0 8px 20px rgb(11 28 48 / 12%)` no tema claro e `0 8px 24px rgb(0 0 0 / 45%)` no escuro. [Estilos do gráfico](../src/App.css)

A página inicial declara `--landing-ink` (`#10263D`), `--landing-blue` (`#1264E8`), `--landing-water` (`#2BC4C7`) e `--landing-signal` (`#FFBF69`) no escopo de `.landing-page`. A arte e o destaque da abertura usam a paleta local. Os cartões e o cabeçalho usam os tokens globais. [Estilos da página inicial](../src/pages/Landing.css)

## Tipografia

`--sans` usa `Plus Jakarta Sans`, com `Arial` e `sans-serif` como alternativas. A fonte vem do Google Fonts nos pesos `400`, `500`, `600`, `700` e `800`.

| Elemento | Tamanho | Entrelinha | Peso |
| --- | --- | --- | --- |
| Texto base (`:root`) | `16px` | `1.45` | `400` |
| Título `h1` | `24px` | `1.25` | `600` |
| Título `h2` | `18px` | `1.25` | `600` |
| Título `h3` | `15px` | Herdada | `600` |
| Rótulo de campo de login | `13px` | `18px` | `600` |

As telas podem ajustar a escala base. O título de abertura da página inicial usa `clamp(46px, 5.4vw, 74px)` no estilo padrão, com regras próprias para telas menores. Os trechos em itálico usam `Georgia`, `Times New Roman` e `serif`. [Estilos da página inicial](../src/pages/Landing.css)

## Espaçamento

O CSS define espaçamentos diretamente nas regras de cada tela. A tabela reúne medidas usadas no projeto para servir de referência.

| Medida | Exemplo no CSS |
| --- | --- |
| `4px` | Recuo vertical da etiqueta no cabeçalho do gráfico (`.chart-heading span b`) |
| `6px` | Distância entre rótulo e controle no login (`.field`) |
| `8px` | Distância entre itens no botão de entrada (`.submit-button`) |
| `12px` | Distância entre campos do formulário de login (`.login-form`) |
| `16px` | Recuo interno do cartão de login (`.login-card`) |
| `20px` | Recuo interno dos cartões de indicadores (`.metric`) |
| `24px` | Distância entre itens do grid do painel (`.dashboard-grid`) |
| `32px` | Distância entre links do cabeçalho público (`.landing-nav`) |
| `40px` | Recuo inferior do conteúdo da área autenticada (`.ops-content`) |
| `48px` | Margem acima dos cartões de recursos no estilo padrão da página inicial (`.landing-features`) |

As regras das telas internas e da página inicial estão em arquivos separados. [Telas internas](../src/App.css) · [Página inicial](../src/pages/Landing.css)

## Exemplo de uso

Este cartão usa os tokens globais e herda as cores do tema ativo.

```css
.painel-resumo {
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--sans);
}

.painel-resumo a {
  color: var(--brand-ink);
}
```
