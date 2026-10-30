# Como funciona o front-end do Maré Alerta

## Visão geral

O front-end é uma aplicação web de página única feita com React 19, Vite e React Router. Em termos simples: o navegador carrega a aplicação uma vez e o React troca as telas conforme a rota, sem recarregar a página inteira. As telas conversam com a API Maré Alerta por HTTP para autenticação, perfil, risco, alertas e ocorrências.

O produto é voltado a estabelecimentos comerciais de Belém/PA. A página pública apresenta o serviço; após entrar ou criar conta, a pessoa pode acompanhar o risco atual, consultar alertas, registrar ocorrências e atualizar os dados do estabelecimento.

## Como iniciar

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
npm install
npm run dev
```

Comandos disponíveis:

- `npm run dev`: inicia o servidor de desenvolvimento.
- `npm run build`: gera os arquivos de produção em `dist/`.
- `npm run preview`: serve localmente o build de produção.
- `npm run lint`: verifica o código com Oxlint.

Não há uma suíte automatizada de testes configurada neste repositório.

## Páginas e navegação

| Rota | Acesso | O que acontece |
| --- | --- | --- |
| `/` | Público | Landing page com apresentação e links para cadastro e login. |
| `/entrar` | Público | Envia e-mail e senha à API e inicia a sessão quando autenticado. |
| `/cadastro` | Público | Coleta os dados básicos do comércio e as credenciais; a API cria a conta e o estabelecimento. |
| `/dashboard` | Autenticado | Consulta o risco atual para o bairro do estabelecimento; as ações rápidas são locais. |
| `/historico` | Autenticado | Consulta e exibe a lista geral de alertas retornada pela API. |
| `/checklist` | Autenticado | Carrega tarefas da API; se não houver dados remotos, oferece publicar o modelo inicial e sincroniza as mudanças. |
| `/ocorrencias` | Autenticado | Envia uma ocorrência e, depois, os arquivos de foto selecionados. |
| `/estabelecimento` | Autenticado | Carrega e atualiza o perfil do estabelecimento na API. |

As rotas operacionais passam por `RequireAuth`. Sem um JWT, a pessoa é enviada a `/entrar`. Com uma sessão existente, o front carrega o perfil em `/estabelecimento/{id}` antes de exibir a tela operacional.

## Fluxos principais

### Entrar e criar conta

- O login envia `{ email, senha }` para `POST /auth/login`.
- O cadastro envia `{ email, senha, estabelecimento }` para `POST /auth/registro`. O CNPJ é enviado como dígitos e bairro e tipo comercial usam os enums definidos pelo backend.
- A resposta fornece o token e o identificador do estabelecimento. O front guarda o token, o ID e o e-mail em `sessionStorage`; não grava a senha.
- A sessão sobrevive a recargas na mesma aba e termina quando a aba é fechada ou a pessoa sai da conta. Respostas `401` em requisições autenticadas também limpam a sessão local.
- Depois do cadastro, o perfil é carregado e a pessoa pode completar endereço, horário de funcionamento e itens críticos.

### Estabelecimento

O adaptador em `src/api/adapters.js` converte os campos do DTO do backend — por exemplo, `nome`, `bairro` e `tipoNegocio` — para os nomes usados nos formulários. O salvamento envia o perfil para `PUT /estabelecimento/{id}` e atualiza o contexto com a resposta da API. O e-mail exibido vem da sessão, pois o DTO do perfil não inclui esse campo.

### Painel de risco

Ao abrir o painel, o front consulta `GET /risco/atual`, passando o código do bairro no parâmetro `localidade` quando há bairro no perfil. O botão de atualizar repete a consulta. A tela usa os campos retornados para mostrar nível de risco, descrição, pico previsto, nível de maré previsto e probabilidade de chuva. Como o contrato não especifica a escala da probabilidade, a interface interpreta valores entre `0` e `1` como fração e os apresenta em porcentagem; valores acima de `1` são exibidos como percentual direto.

O painel não usa a antiga série sintética de maré. Se a consulta falhar, a tela mostra o erro e permite tentar novamente; não substitui a resposta por valores de demonstração.

### Alertas

O histórico consulta `GET /alertas` e apresenta os registros retornados, incluindo mensagem, tipo, risco, origem, data e estabelecimento quando disponíveis. A API não documenta filtro ou paginação para essa rota, então a tela não simula esses controles. O botão de compartilhar copia a mensagem do alerta para a área de transferência.

### Ocorrências e fotos

O formulário envia os dados para `POST /ocorrencias`, incluindo o ID do estabelecimento da sessão, status `ENVIADA`, nível de alagamento, faixa de água, danos e valores informados. Se a API criar o registro, o front mostra o protocolo retornado. Cada foto selecionada é enviada depois, em `multipart/form-data`, no campo `arquivo` de `POST /ocorrencias/{id}/fotos`.

Se uma foto falhar, a interface informa que a ocorrência foi criada e quantas fotos foram enviadas. A API não documenta uma rota de listagem ou consulta posterior de ocorrências; após sair da tela ou recarregar, o front não consegue recuperar o protocolo.

### Checklist e tema

O checklist consulta `GET /checklists?estabelecimentoId=...`. Quando a API ainda não possui itens para o estabelecimento, a tela mostra um modelo inicial local e oferece o botão para publicá-lo em lote com `POST /checklists`. Depois disso, marcar ou desmarcar tarefas sincroniza o status com `PUT /checklists/{id}`.

O tema claro/escuro é uma preferência local independente da sessão. Uma escolha explícita fica em `localStorage`; sem escolha, a interface acompanha a preferência do sistema.

## Organização do código

- `src/main.jsx`: monta React, o roteador e o provedor de estado global.
- `src/App.jsx`: declara as rotas públicas e protegidas.
- `src/pages/`: landing page, login, cadastro, painel e telas operacionais.
- `src/components/AppShell.jsx`: navegação e moldura das telas autenticadas.
- `src/api/client.js`: cliente `fetch`, Bearer token, JSON, multipart e erros HTTP.
- `src/api/adapters.js`: tradução entre o DTO do estabelecimento e o modelo de tela.
- `src/state/StoreContext.jsx`: sessão, autenticação, perfil carregado e atualização do estabelecimento.
- `src/state/store.js`: enums de bairro/tipo comercial e contexto React.
- `src/config.js`: URL base da API e links opcionais de WhatsApp.
- `src/App.css`, `src/index.css` e `src/pages/Landing.css`: estilos globais, componentes e landing page.

## Configuração e comunicação com a API

A configuração padrão aponta para `https://ma-api.andr3dav1d.dev`. Para usar outra instância, defina `VITE_API_BASE_URL` em `.env.local`. As variáveis `VITE_WHATSAPP_TEAM_URL` e `VITE_WHATSAPP_GROUP_URL` configuram links externos opcionais. Variáveis `VITE_*` são públicas no bundle e não devem conter segredos.

O cliente comum fica em `src/api/client.js`. Chamadas autenticadas recebem `Authorization: Bearer <token>`. Requisições JSON enviam `Content-Type: application/json`; upload de fotos usa `FormData` para o navegador definir o cabeçalho multipart. Erros de rede e respostas HTTP são convertidos em mensagens exibidas pelas telas.

O servidor precisa aceitar requisições CORS da origem onde o front estiver hospedado, incluindo `Authorization` e uploads multipart. A URL usada pelo front permanece HTTPS, embora o documento OpenAPI anuncie um endereço HTTP.

## O que ainda não está coberto pelo backend

- Recuperação de senha e renovação/revogação de token.
- Série histórica de leituras de maré e previsão em gráfico.
- Filtros/paginação para alertas.
- Consulta posterior de ocorrências e de fotos já enviadas.
- Escala/unidade definida para `probabilidadeChuva` e limites/tipos de arquivos para fotos.
- Política de envio de cópia de ocorrência para terceiros.

Para os endpoints, campos e limitações observados no OpenAPI, consulte [Integração com o backend](integracao-backend.md).
