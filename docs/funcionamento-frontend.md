# Como funciona o front-end do Maré Alerta

## Visão geral

O front-end é uma aplicação web de página única feita com React 19, Vite e React Router. Em termos simples: o navegador carrega a aplicação uma vez e o React troca as telas conforme a rota, sem recarregar a página inteira. As telas conversam com a API Maré Alerta por HTTP para autenticação, perfil, risco, alertas e ocorrências.

O produto é voltado a estabelecimentos comerciais de Belém/PA. A página pública apresenta o serviço; após entrar ou criar conta, a pessoa pode acompanhar o risco atual, consultar alertas, registrar ocorrências e atualizar os dados do estabelecimento.

## Como iniciar

Consulte o [README](../README.md#rodar-localmente) para instalar as dependências, configurar a API e iniciar o servidor de desenvolvimento.

## Páginas e navegação

O [guia de navegação](navegacao.md) reúne o diagrama de primeiro acesso, o mapa de rotas e as regras de acesso.

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

Ao abrir o painel, o front consulta `GET /risco/atual`, passando o código do bairro no parâmetro `localidade` quando há bairro no perfil. A tela mostra nível de risco, descrição, pico previsto, nível de maré previsto e probabilidade de chuva. Para exibir a probabilidade, multiplica valores de até `1` por `100` e apresenta valores acima de `1` diretamente como porcentagem. O painel também consulta `GET /checklists/resumo` para exibir o progresso do checklist.

O painel não usa a antiga série sintética de maré. Se a consulta falhar, a tela mostra o erro e permite tentar novamente; não substitui a resposta por valores de demonstração.

### Alertas

O histórico consulta `GET /alertas` e apresenta os registros retornados, incluindo mensagem, tipo, risco, origem, data e estabelecimento quando disponíveis. A API não documenta filtro ou paginação para essa rota, então a tela não simula esses controles. O botão de compartilhar copia a mensagem do alerta para a área de transferência.

### Ocorrências e fotos

O formulário envia os dados para `POST /ocorrencias`, incluindo o ID do estabelecimento da sessão, status `ENVIADA`, nível de alagamento, faixa de água, danos e valores informados. Se a API criar o registro, o front mostra o protocolo retornado. Cada foto selecionada é enviada depois, em `multipart/form-data`, no campo `arquivo` de `POST /ocorrencias/{id}/fotos`.

Se uma foto falhar, a interface informa que a ocorrência foi criada e quantas fotos foram enviadas. O link **Ver ocorrências registradas** abre `/ocorrencias/lista`, que consulta `GET /ocorrencias` e exibe os registros retornados, incluindo protocolo, status e quantidade de fotos.

### Checklist e tema

O checklist consulta `GET /checklists?estabelecimentoId=...`. Se a consulta falhar ou não trouxer itens, a tela mostra um modelo local e permite gerar o checklist padrão na API com `POST /checklists/gerar-padrao?estabelecimentoId=...`. Para itens remotos, a interface alterna o status com `PATCH /checklists/{id}/toggle`.

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

O servidor precisa aceitar requisições CORS da origem onde o front estiver hospedado, incluindo `Authorization` e uploads multipart. Use uma URL HTTPS para a API quando o front também estiver hospedado em HTTPS.

## Funcionalidades fora do fluxo atual

- Recuperação de senha e renovação ou revogação remota de token.
- Série histórica de leituras de maré e previsão em gráfico.
- Filtros/paginação para alertas.
- Abertura de fotos no histórico de ocorrências.
- Envio de cópia de ocorrência para terceiros.

Para consultar as chamadas feitas pela interface, veja [Integração com o backend](integracao-backend.md).
