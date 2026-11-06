# Integração com o backend

O front-end usa `https://ma-api.andr3dav1d.dev` por padrão. Para trocar a URL base, configure `VITE_API_BASE_URL`. Este guia descreve as chamadas implementadas no cliente.

## Endpoints conectados

| Recurso | Endpoint | Comportamento |
| --- | --- | --- |
| Cadastro | `POST /auth/registro` | Cria usuário e estabelecimento; salva token e ID retornados na sessão da aba. |
| Login | `POST /auth/login` | Autentica e inicia sessão. |
| Perfil | `GET /estabelecimento/{id}`, `PUT /estabelecimento/{id}` | Carrega e atualiza o estabelecimento autenticado com o ID retornado no login/cadastro. |
| Risco | `GET /risco/atual?localidade=...` | Alimenta o painel com o cenário retornado pelo serviço. |
| Alertas | `GET /alertas` | Exibe a lista geral retornada, sem filtros locais de categoria. |
| Ocorrências | `POST /ocorrencias` | Registra o impacto e exibe o protocolo retornado. |
| Histórico de ocorrências | `GET /ocorrencias` | Lista os registros, protocolos, status e quantidades de fotos retornados. |
| Fotos | `POST /ocorrencias/{id}/fotos` | Envia os arquivos escolhidos após a criação da ocorrência. |
| Checklist | `GET /checklists?estabelecimentoId=...`, `POST /checklists/gerar-padrao?estabelecimentoId=...`, `PATCH /checklists/{id}/toggle` | Busca itens do estabelecimento, gera o modelo padrão e alterna o status de um item. |
| Resumo do checklist | `GET /checklists/resumo` | Exibe o progresso no painel. |
| Administração do WhatsApp | `GET /admin/whatsapp/status`, `/history` e `/qr` sob o mesmo prefixo | Consulta conexão, histórico de envios e QR Code. |
| Ações do WhatsApp | `POST /admin/whatsapp/{connect,reconnect,disconnect,test}`, `PATCH /admin/whatsapp/settings` | Controla a conexão, envia mensagem de teste e salva a configuração automática. |

Chamadas autenticadas usam `Authorization: Bearer <token>`. O token e o ID do estabelecimento ficam em `sessionStorage`. A interface converte campos e enums retornados pela API para os modelos usados nos formulários.

## Formatação e envio de dados

- Para exibir `probabilidadeChuva`, o painel multiplica valores de até `1` por `100` e apresenta valores acima de `1` diretamente como porcentagem.
- O formulário de ocorrência envia as categorias de dano como texto, com os rótulos separados por vírgulas.
- A interface envia cada foto em `multipart/form-data`, no campo `arquivo`, depois de receber o ID da ocorrência.

## Desenvolvimento

Configure `VITE_API_BASE_URL` em `.env.local` se usar outra instância. CORS deve permitir a origem do frontend e os cabeçalhos `Authorization` e `Content-Type`, além de requisições multipart para fotos. Não configure segredos em variáveis `VITE_*`.
