# Integração com o backend

O frontend usa a API documentada em `https://ma-api.andr3dav1d.dev/v3/api-docs`. A URL base pode ser alterada com `VITE_API_BASE_URL`. O OpenAPI anuncia HTTP; o cliente mantém HTTPS para evitar conteúdo misto no navegador.

## Endpoints conectados

| Recurso | Endpoint | Comportamento |
| --- | --- | --- |
| Cadastro | `POST /auth/registro` | Cria usuário e estabelecimento; salva token e ID retornados na sessão da aba. |
| Login | `POST /auth/login` | Autentica e inicia sessão. |
| Perfil | `GET /estabelecimento/me`, `PUT /estabelecimento/{id}` | Carrega e atualiza o estabelecimento autenticado. |
| Risco | `GET /risco/atual?localidade=...` | Alimenta o painel com o cenário retornado pelo serviço. |
| Alertas | `GET /alertas` | Exibe a lista geral retornada, sem filtros locais de categoria. |
| Ocorrências | `POST /ocorrencias` | Registra o impacto e exibe o protocolo retornado. |
| Fotos | `POST /ocorrencias/{id}/fotos` | Envia os arquivos escolhidos após a criação da ocorrência. |

Chamadas autenticadas usam `Authorization: Bearer <token>`. O token e o ID do estabelecimento ficam em `sessionStorage`, não no perfil persistido. A interface converte os nomes de campos em português e os enums do OpenAPI para os modelos apresentados pelos formulários.

## Limitações do contrato atual

- Não há endpoint documentado para recuperar senha, renovar/revogar sessão, consultar série temporal da maré, filtrar/paginar alertas, sincronizar checklist ou listar/consultar ocorrências depois do envio.
- O endpoint de risco descreve `probabilidadeChuva` como número, sem especificar escala ou unidade; a interface mostra o valor sem inferir unidade.
- A ocorrência aceita categorias de dano como texto; os rótulos selecionados são enviados separados por vírgula.
- O OpenAPI não documenta limites/tipos aceitos para fotos nem política de cópia a terceiros. A interface envia imagens escolhidas e não afirma compartilhamento com Defesa Civil/associações.
- O checklist continua apenas na memória da tela. O frontend não usa o cenário sintético legado em `src/data/tide.js` nas telas operacionais.

## Desenvolvimento

Configure `VITE_API_BASE_URL` em `.env.local` se usar outra instância. CORS deve permitir a origem do frontend e os cabeçalhos `Authorization` e `Content-Type`, além de requisições multipart para fotos. Não configure segredos em variáveis `VITE_*`.
