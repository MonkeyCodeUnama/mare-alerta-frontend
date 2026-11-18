# Maré Alerta — Front-end

Plataforma web para estabelecimentos comerciais de Belém (PA) acompanharem o risco de alagamento por maré e chuva, executarem checklists preventivos, receberem alertas e registrarem ocorrências com protocolo e fotos.

## Stack Atual

- **Framework:** Astro 6 (`output: 'static'`)
- **Ilhas Interativas:** React 19 + TypeScript
- **Estilização:** Tailwind CSS v4 + Tokens OKLCH (Light & Dark)
- **Gráficos & Ícones:** Recharts + Lucide (`lucide-react` e `astro-icon`)
- **Qualidade:** Oxlint + TypeScript (`tsc --noEmit`)

## Rodar localmente

Requer Node.js 20.19+ ou 22.12+.

```powershell
cd mare-alerta-frontend
npm.cmd ci
npm.cmd run dev
```

O servidor sobe em `http://localhost:4321/`.

### Configurar API

Por padrão, `PUBLIC_API_BASE_URL` usa `https://ma-api.andr3dav1d.dev`. Para apontar para o backend local (ex.: Docker na porta `8080`), crie um `.env` na raiz:

```env
PUBLIC_API_BASE_URL=http://localhost:8080
```

## Scripts

| Comando | Função |
| --- | --- |
| `npm.cmd run dev` | Inicia o servidor de desenvolvimento em `localhost:4321` |
| `npm.cmd run build` | Gera o site estático de produção em `dist/` |
| `npm.cmd run preview` | Serve o conteúdo de `dist/` localmente |
| `npx.cmd oxlint src` | Executa o linter Oxlint em `src/` |
| `npx.cmd tsc --noEmit` | Verifica tipos TypeScript |

## Estrutura

```text
src/
├── features/        # Landing page, autenticação, telemetria, checklist, ocorrências, alertas e admin WhatsApp
├── layouts/         # Layouts EditorialLayout (sistema) e AuthLayout (entrar/cadastro)
├── pages/           # Rotas estáticas Astro (pt-BR e /en/)
└── shared/          # Cliente HTTP (client.ts), tipos, formatadores, componentes e estilos globais
```
