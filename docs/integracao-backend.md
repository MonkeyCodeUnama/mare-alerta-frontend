# Referência de integração com o backend

Este documento descreve o estado do frontend em `src/` e prepara uma futura integração. A seção **Hoje** registra fatos do código. A seção **Contrato a definir** é uma proposta de planejamento, não uma API implementada nem um compromisso de endpoints.

## 1. Estado atual

O projeto é uma SPA React 19 com Vite e React Router. Não existe backend, cliente HTTP, autenticação, autorização, sincronização ou upload. Não há suíte de testes configurada.

| Recurso visível | Comportamento atual | Persistência atual |
| --- | --- | --- |
| Login (`/`) | Aceita qualquer e-mail e senha que passem pela validação HTML; navega para `/dashboard`. Recuperação apenas mostra uma mensagem. | Nenhuma |
| Cadastro (`/cadastro`) | Valida 14 dígitos de CNPJ e regra local de senha; grava perfil parcial e segue para `/estabelecimento`. | Perfil em `localStorage` |
| Estabelecimento | Edita perfil, endereço, atividade, dias/horários e itens críticos. | `mare-alerta-store` |
| Maré e risco | `src/data/tide.js` gera uma série sintética semidiurna e valores derivados. A atualização do painel só muda o texto “Há 3 min” para “Agora”. | Constantes no bundle |
| Checklist | Tarefas e marcações em estado React. | Nenhuma |
| Histórico | Alertas e estatísticas definidos estaticamente em `Operations.jsx`; filtro local; compartilhar copia título e data. | Nenhuma |
| Ocorrência | Valores iniciais, fotos como nomes de arquivo e protocolo fixos; finalizar só muda uma mensagem. PDF usa impressão do navegador. | Nenhuma |
| WhatsApp | URLs opcionais de ambiente para equipe e grupo. | Configuração de build |
| Tema | Preferência `light`/`dark`; sem valor salvo segue preferência do sistema. | `mare-alerta-theme` |

O `StoreProvider` mescla o JSON salvo com `DEMO_STORE`, captura JSON inválido e tolera falha de gravação. Esse mecanismo é apenas conveniente para a demonstração: não fornece identidade, privacidade, consistência entre dispositivos, auditoria ou cópia de segurança.

## 2. Mapa das telas e dados consumidos

### Conta e acesso

Cadastro coleta:

- `name`: nome do estabelecimento ou responsável (texto obrigatório).
- `cnpj`: CNPJ formatado para exibição; a validação atual verifica apenas 14 dígitos, não os dígitos verificadores.
- `neighborhood`: um dos bairros locais `Campina`, `Marco`, `Nazaré`, `Umarizal`.
- `email`: e-mail comercial.
- `password` e confirmação: credenciais transitórias do formulário; nunca são salvas no `localStorage`.

Após concluir cadastro, o perfil local recebe também `owner: ''`, `street: ''`, `number: ''` e `criticalItems: []`, e o usuário segue para completar o estabelecimento. O formulário de login não consulta esse perfil.

### Estabelecimento

O objeto `store` usado pelo contexto tem atualmente este formato demonstrativo:

```json
{
  "name": "Empório da Maria",
  "owner": "Maria",
  "cnpj": "",
  "email": "",
  "neighborhood": "Umarizal",
  "street": "Travessa Visconde de Souza Franco (Doca)",
  "number": "742",
  "type": "Mercado",
  "days": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
  "opening": "07:30",
  "closing": "19:00",
  "criticalItems": ["Freezer no chão", "Estoque de secos"]
}
```

`DEMO_STORE` em `src/state/store.js` é a fonte dos valores padrão. `number` é texto; dias e itens críticos são arrays de rótulos definidos pelo frontend. `isDemo` compara o nome com o nome do estabelecimento de demonstração e não é uma identidade confiável.

### Maré, alertas e checklist

`src/data/tide.js` expõe `series` (pontos `{ hour, time, level, rain }`) e `tide` (estação, leitura, nível atual, tendência, baixa/preamar, cotas, janela segura, chuva, temperatura e vento). Período, horário de preamar, médias, amplitude e chuva são constantes de simulação. O gráfico consome série e deriva indicadores localmente.

O histórico em `src/pages/Operations.jsx` inclui alertas de demonstração com categoria, status, horário, fonte, título, texto, pico e chuva. Checklist e ações do painel são arrays fixos. As seleções não são ligadas a usuário ou a uma ocorrência.

### Ocorrência

Os controles atuais representam: data, hora inicial/final, faixa de lâmina d'água, categorias de dano, valor estimado, horas fechado, tamanho da equipe, descrição, lista de nomes de fotos e opção de compartilhar cópia. As opções e defaults estão hard-coded. Não há seleção real de arquivos, protocolo gerado, rascunho persistido ou envio.

## 3. Pontos recomendados de integração

Introduza uma camada de serviços (por exemplo, `src/api/`) e mantenha componentes focados em apresentação. Evite espalhar `fetch` pelas páginas. Separe pelo menos os recursos abaixo; os nomes são conceituais:

| Recurso | Operações esperadas pela interface |
| --- | --- |
| Sessão | Entrar, sair, obter sessão atual, recuperar acesso e proteger rotas operacionais. |
| Estabelecimento | Obter e atualizar o perfil do estabelecimento autenticado; validar campos no servidor. |
| Telemetria/previsão | Obter leituras e previsão com estação, unidade, horário da observação, origem e validade. |
| Alertas | Listar alertas paginados/filtráveis, ver detalhe e compartilhar referência. |
| Checklist | Obter tarefas aplicáveis e persistir conclusões por usuário/estabelecimento e janela de risco. |
| Ocorrências | Criar rascunho, atualizar, enviar/finalizar, consultar protocolo/status e anexar/remover arquivos. |
| Comunidade | Obter contagens e eventos agregados; definir política de exposição de dados de vizinhos. |

### Requisitos para contratos

- Usar identificadores estáveis (`id`, `establishmentId`, `alertId`, `occurrenceId`) em vez de títulos/rótulos como chave.
- Enviar e receber datas em ISO 8601 com fuso explícito; esclarecer se horários de operação são hora local de Belém.
- Retornar unidades explicitamente (por exemplo, metros, mm/h) e distinguir horário observado de horário previsto.
- Separar a localização estruturada (logradouro, número, bairro, município, UF e, se necessário, coordenadas) dos rótulos de apresentação.
- Definir enumerações/versionamento para tipo comercial, danos, faixa de água, categorias e status. Rótulos visuais não devem ser o contrato persistido.
- Definir paginação, ordenação, filtros, limites, formato de erro e comportamento para dados ausentes/desatualizados.
- Nunca armazenar senha ou token no perfil do estabelecimento. Autenticação, autorização por recurso, armazenamento de anexos e retenção precisam ser tratados no servidor.
- Para ocorrência, esclarecer consentimento e destino da cópia, limites/tipos de arquivo, estados do fluxo, edição após envio e significado do protocolo.
- Alertar o usuário quando a fonte estiver indisponível ou a leitura estiver vencida; não substituir silenciosamente dados oficiais por valores simulados.

## 4. Contrato de dados a decidir com o backend

Antes de codificar os endpoints, alinhar com a equipe de backend:

1. Identidade: uma conta pode administrar vários estabelecimentos? Qual campo identifica o responsável e quem pode editar cada ponto?
2. CNPJ: unicidade, normalização, validação de dígitos, formato de armazenamento e possibilidade de cadastro sem CNPJ.
3. Localização: catálogo oficial de bairros, campos de endereço, geocodificação e precisão das coordenadas.
4. Telemetria: provedor/fonte oficial, estação por estabelecimento, frequência, histórico, previsão, janela de validade e unidades.
5. Risco: as cotas de atenção/alerta são globais, por rua ou por estabelecimento? Quem define o cálculo e sua explicabilidade?
6. Alertas: estados possíveis, autoria, escopo geográfico, expiração, canal de entrega e política de arquivamento.
7. Checklist: tarefas configuráveis por risco/atividade, recorrência e se a conclusão tem valor de auditoria.
8. Ocorrência: protocolo, permissões, rascunho, anexos, aprovação, correção e exportação oficial.
9. Privacidade: base legal, consentimento, retenção, acesso e compartilhamento com Defesa Civil/associações; a menção LGPD na tela não implementa essas garantias.
10. Operação: URL por ambiente, CORS, autenticação, renovação/expiração de sessão, limites, observabilidade e política de indisponibilidade.

## 5. Migração do estado local

Na integração, trate `mare-alerta-store` como dado legado não confiável. Não envie automaticamente o perfil de demonstração ao servidor. Após autenticação, obtenha o perfil remoto e adapte o formulário a um DTO explícito. Planeje o que fazer com perfis incompletos, conflito entre cache local e servidor, logout em dispositivo compartilhado e limpeza dos dados locais. O tema pode continuar sendo uma preferência local sem sincronização.

Para evitar que a interface dependa da forma da API, mantenha adaptadores entre DTOs remotos e modelos de visualização. Estados de carregamento, erro, vazio e dado desatualizado devem ser definidos em cada tela que passe a depender da rede.

## 6. Arquivos para começar a integração

- `src/state/StoreContext.jsx`: substituir/abstrair persistência local do estabelecimento.
- `src/state/store.js`: modelo padrão e lista local de bairros; decidir fonte remota/catálogo.
- `src/data/tide.js`: remover a fonte sintética do caminho de dados operacionais, preservando-a apenas como fixture claramente identificada quando necessário.
- `src/pages/Home.jsx` e `src/pages/Register.jsx`: autenticação e criação real de conta.
- `src/pages/Dashboard.jsx` e `src/components/TideChart.jsx`: consulta, atualização e estados da telemetria.
- `src/pages/Operations.jsx`: histórico, checklist, ocorrência e perfil; considerar separar em módulos ao conectar cada recurso.
- `src/config.js` e `.env.example`: configuração pública da URL base por ambiente, sem segredos no bundle.

## 7. Checklist de prontidão

- [ ] API e ambientes documentados, com OpenAPI ou referência equivalente.
- [ ] Autenticação, sessão, proteção de rotas e autorização definidos.
- [ ] Modelos e enumerações acordados, incluindo datas, fuso e unidades.
- [ ] Fonte oficial, validade e fallback de telemetria definidos.
- [ ] Fluxo de ocorrência, anexos, protocolo e permissões definidos.
- [ ] Tratamento consistente de loading, erro, vazio, offline e dados vencidos.
- [ ] Política de privacidade, retenção e compartilhamento aprovada pelo produto/backend.
- [ ] Dados de demonstração identificados e separados dos dados reais em todos os ambientes.
