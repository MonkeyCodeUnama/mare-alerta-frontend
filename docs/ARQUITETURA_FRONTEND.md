# Arquitetura do Front-end — Maré Alerta

Documentação técnica completa da aplicação web do **Maré Alerta** voltada a estabelecimentos comerciais de Belém (PA) para monitoramento hidrometeorológico, mitigação preventiva e protocolo de ocorrências.

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Uso no projeto |
| :--- | :--- | :--- |
| **Framework** | Astro (`output: 'static'`) | Geração estática de 12 rotas HTML com zero JS na Landing Page |
| **Ilhas Interativas** | React 19 + TypeScript | Painéis, formulários, gráficos, filtros e administração |
| **Estilização** | Tailwind CSS v4 + Tokens OKLCH | Tema editorial claro e escuro escopado (`.sys-paper-shell`) |
| **Gráficos** | Recharts | Curvas de maré e chuva com faixas segura e de risco |
| **Ícones** | Lucide (`lucide-react` / `astro-icon`) | Ícones vetoriais em interfaces React e layouts Astro |
| **Qualidade** | Oxlint + `tsc --noEmit` | Lint rápido e checagem estrita de tipos TypeScript |

---

## 2. Rotas da Aplicação

### Públicas
- `/` (`pt-BR`) e `/en/` (`en`): Landing Page estática bilíngue com troca de idioma e tema no cliente, modal interativo de previews (`#lp-preview-modal`) e imagens responsivas (`AVIF` / `WebP` / `JPG`).
- `/entrar` e `/cadastro`: Autenticação e cadastro de estabelecimento em 2 etapas.
- `/telemetria`: Consulta pública da série de maré e chuva de 24h (`TideChartIsland`).

### Autenticadas (exigem token JWT em `localStorage`)
- `/dashboard`: Visão operacional por bairro (`DashboardGrid`), veredito, chuva, maré prevista com cota de segurança, checklist e gráfico das próximas horas.
- `/estabelecimento`: Cadastro/edição do ponto comercial, horários (`CustomTimePicker`) e itens críticos.
- `/checklist`: Gestão de tarefas preventivas por categoria e prioridade.
- `/ocorrencias`: Registro de ocorrência com data/hora customizados (`CustomDatePicker` / `CustomTimePicker`), nível, lâmina de água, prejuízo e upload de fotos.
- `/ocorrencias/lista`: Consulta e busca de protocolos em formato de filetes.
- `/historico`: Histórico de alertas de risco em filetes (com detalhamento de envios WhatsApp para administradores).
- `/admin/whatsapp`: Gestão da instância Evolution API, QR Code, testes e automação por bairro (exclusivo `ADMIN` / `SUPERADMIN`).

---

## 3. Autenticação e Integração com Backend

- **Cliente HTTP ([`src/shared/api/client.ts`](../src/shared/api/client.ts)):**
  - Base URL configurada por `PUBLIC_API_BASE_URL` (padrão `https://ma-api.andr3dav1d.dev`; para backend local/Docker usar `http://localhost:8080`).
  - Envia `Authorization: Bearer <token>` a partir do `localStorage` (`mare_alerta_token`).
  - Em `401`, tenta renovação automática via `POST /auth/refresh`; se falhar ou não houver `refreshToken`, limpa a sessão (`clearAuthSession()`) e redireciona para `/entrar`.
  - Cache GET em memória de `15s` chaveado por token e invalidado automaticamente em mutações (`POST`/`PUT`/`PATCH`/`DELETE`).
- **Guarda de Rotas ([`src/layouts/EditorialLayout.astro`](../src/layouts/EditorialLayout.astro)):**
  - Rotas privadas verificam a presença do token no cliente e redirecionam imediatamente para `/entrar` quando ausente.

---

## 4. Design System e Mídia

- **Superfície Tonal em Degrau (`src/shared/styles/global.css`):**
  - **Light Mode:** folha `oklch(96.8% 0.003 242)`, rail `98.6%`, cards `#ffffff`, acento azul marinho `41%`.
  - **Dark Mode:** folha `oklch(16.0% 0.011 244)`, rail `18.6%`, cards `21.2%`, botões primários azul marinho `49%` com texto claro e links/ícones em `--sys-link` (`73%`).
- **Componentes de Seleção Próprios:** `CustomSelect`, `CustomDatePicker` e `CustomTimePicker` substituem controles nativos de data, hora e select.
- **Imagens e Cache Offline (`public/`):**
  - 9 conjuntos fotográficos da LP em `AVIF`, `WebP` e fallback `JPG` + variantes `-mobile` (`fetchpriority="high"` no Hero e `loading="lazy"` nas demais seções).
  - 12 previews reais do sistema em `public/previews/` (`light` e `dark`).
  - Service Worker (`public/sw.js`, `mare-alerta-cache-v3`) desativado automaticamente em `localhost` e ativo em produção (Network-First para HTML, Cache-First/SWR para assets estáticos).

---

## 5. Comandos e Variáveis

```env
# .env (opcional — para apontar para backend local/Docker)
PUBLIC_API_BASE_URL=http://localhost:8080
```

```powershell
npm.cmd run dev       # Servidor de desenvolvimento em http://localhost:4321
npm.cmd run build     # Build estático de produção em dist/
npx.cmd oxlint src    # Verificação de lint
npx.cmd tsc --noEmit  # Verificação de tipos TypeScript
```
