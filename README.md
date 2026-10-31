# Maré Alerta — frontend

Interface para alertas de maré e risco de alagamento para estabelecimentos comerciais de Belém/PA, integrada à API Maré Alerta.

## Começar

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
npm install
npm run dev
```

Scripts disponíveis: `npm run build` gera `dist/`, `npm run preview` serve o build local e `npm run lint` executa Oxlint. Não há suíte de testes configurada.

## Navegação

| Caminho | Tela | Estado atual |
| --- | --- | --- |
| `/` | Landing page | Apresentação do serviço e acesso ao cadastro/login. |
| `/entrar` | Entrar | Autenticação pela API. |
| `/cadastro` | Criar conta | Cadastro remoto de conta e estabelecimento. |
| `/dashboard` | Painel de risco | Risco atual retornado pela API; ações preventivas locais. |
| `/checklist` | Checklist | Carrega tarefas da API, publica o modelo inicial e sincroniza atualizações. |
| `/historico` | Histórico de alertas | Lista geral retornada pela API. |
| `/ocorrencias` | Registro de ocorrência | Cria ocorrência e envia fotos selecionadas para a API. |
| `/estabelecimento` | Meu estabelecimento | Carrega e atualiza o perfil remoto autenticado. |

## Rotas em produção

- A aplicação usa `BrowserRouter`, então acessos diretos como `/dashboard` exigem fallback do servidor para `index.html`.
- Para deploy na Vercel, o rewrite está em `vercel.json`.
- O arquivo `public/_redirects` cobre hosts compatíveis com Netlify.
- Sem esse fallback, recarregar ou abrir uma rota interna direto no navegador resulta em `404` do servidor, mesmo com a rota existindo no React.

## Estrutura

- `src/App.jsx`: rotas.
- `src/pages/`: telas e fluxos.
- `src/components/AppShell.jsx`: navegação e layout operacional.
- `src/state/`: sessão JWT temporária e perfil remoto do estabelecimento.
- `src/api/`: cliente HTTP e tratamento comum de erros.
- `src/config.js`: URL da API e links externos opcionais do WhatsApp.
- `src/index.css` e `src/App.css`: tokens, tema e estilos.

## Documentação para integração

Consulte [Como funciona o front-end](docs/funcionamento-frontend.md) para conhecer a aplicação, seus fluxos, rotas e configuração. O [guia de integração com o backend](docs/integracao-backend.md) lista endpoints e limitações do contrato.

## Configuração externa

Copie `.env.example` para `.env.local` para configurar `VITE_API_BASE_URL`, `VITE_WHATSAPP_TEAM_URL` e `VITE_WHATSAPP_GROUP_URL`. Links vazios aparecem desabilitados. Variáveis `VITE_*` são incorporadas ao bundle do cliente: não coloque segredos nelas.

## Observações

- React 19, Vite 8, JavaScript, React Router e Recharts.
- O JWT fica em `sessionStorage`; fechar a aba encerra a sessão local.
- O backend ainda não documenta recuperação de senha, série temporal de maré ou consulta posterior de ocorrências.
- Interface e comentários voltados ao produto devem permanecer em português do Brasil.
