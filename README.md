# Maré Alerta — front-end

Aplicação web para estabelecimentos comerciais de Belém (PA) acompanharem o risco de alagamento por maré. Com a conta do estabelecimento, é possível consultar alertas, acompanhar o checklist preventivo e registrar ocorrências com fotos.

O projeto usa React 19, JavaScript, Vite 8, React Router e CSS. As telas autenticadas consomem a API Maré Alerta.

## Rodar localmente

Use Git, npm e Node.js 22.12.0 ou superior. A versão 20 também é compatível a partir da 20.19.0, conforme o requisito do Vite registrado no [lockfile](package-lock.json).

```sh
git clone https://github.com/MonkeyCodeUnama/mare-alerta-frontend.git
cd mare-alerta-frontend
npm ci
npm run dev
```

Abra o endereço exibido pelo Vite no terminal, normalmente `http://localhost:5173`. A página inicial é pública. Para abrir o painel e as demais telas protegidas, use uma conta da API configurada ou crie uma em **Criar conta**. O front-end usa a API remota padrão sem configuração adicional.

### Configurar outra API ou links do WhatsApp

Copie [.env.example](.env.example) para `.env.local` na raiz. Edite as variáveis necessárias e reinicie o servidor de desenvolvimento.

| Variável | Comportamento |
| --- | --- |
| `VITE_API_BASE_URL` | URL base da API. Quando vazia, usa `https://ma-api.andr3dav1d.dev`. |
| `VITE_WHATSAPP_TEAM_URL` | Link do WhatsApp da equipe, exibido no checklist. |
| `VITE_WHATSAPP_GROUP_URL` | Link do grupo comunitário, exibido no histórico de alertas. |

Os botões do WhatsApp ficam desabilitados quando a URL correspondente está vazia. Mantenha segredos fora das variáveis `VITE_*`, pois o navegador recebe esses valores. Se usar uma API própria, configure o CORS para aceitar a origem exibida pelo Vite.

## Scripts

| Comando | Função |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento com atualização durante a edição. |
| `npm run build` | Gera os arquivos estáticos de produção em `dist/`. |
| `npm run preview` | Serve o conteúdo de `dist/` localmente após o build. |
| `npm run lint` | Verifica o código com Oxlint. |

O projeto ainda não configura uma suíte automatizada de testes.

## Estrutura

```text
docs/              Guias de uso, design e integração
public/            Arquivos estáticos e fallback de rotas para Netlify
src/
├── main.jsx       Inicialização do React, do roteador e do provedor de estado
├── App.jsx        Rotas e regras de acesso
├── api/           Cliente HTTP e adaptadores de dados da API
├── assets/        Imagens e ícones importados pelas telas
├── components/    Componentes compartilhados
├── data/          Modelo local de maré usado pelo componente TideChart
├── pages/         Telas públicas, operacionais e administrativas
├── state/         Sessão e perfil do estabelecimento
├── styles/        Estilos da administração do WhatsApp
├── config.js      URL base da API e links externos
├── index.css      Tokens globais e estilos base
└── App.css        Estilos das telas e componentes
```

## Documentação

- [Design tokens](docs/design-tokens.md) — cores, tipografia e espaçamento.
- [Componentes](docs/componentes.md) — props, estados visuais e exemplos copiáveis.
- [Navegação](docs/navegacao.md) — diagrama do fluxo, mapa de rotas e regras de acesso.
- [Como funciona o front-end](docs/funcionamento-frontend.md) — comportamento das funcionalidades.
- [Integração com o backend](docs/integracao-backend.md) — endpoints consumidos pela interface.

## Hospedagem

Publique `dist/` e configure o servidor para retornar `index.html` em acessos diretos a rotas da aplicação, como `/dashboard`. O `BrowserRouter` resolve a tela no navegador. O repositório já inclui a regra para [Vercel](vercel.json) e [Netlify](public/_redirects).
