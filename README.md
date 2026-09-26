# Maré Alerta — frontend

Protótipo de interface para alertas de maré e risco de alagamento para estabelecimentos comerciais de Belém/PA. O frontend ainda não está conectado a um backend: leituras, alertas, histórico e registros exibidos são dados de demonstração.

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
| `/` | Entrar | Qualquer e-mail/senha válidos no navegador navegam ao painel; não há autenticação. |
| `/cadastro` | Criar conta | Valida campos no cliente e grava dados locais; não cria uma conta remota. |
| `/dashboard` | Painel de risco | Usa cenário hidrológico fixo/sintético e ações em memória. |
| `/checklist` | Checklist | Tarefas e seleções em memória, sem persistência. |
| `/historico` | Histórico de alertas | Lista estática; compartilhar copia texto para a área de transferência. |
| `/ocorrencias` | Registro de ocorrência | Formulário demonstrativo; finalizar só altera o status visual. |
| `/estabelecimento` | Meu estabelecimento | Edita o contexto local e persiste no navegador. |

## Estrutura

- `src/App.jsx`: rotas.
- `src/pages/`: telas e fluxos.
- `src/components/AppShell.jsx`: navegação e layout operacional.
- `src/state/`: contexto e persistência local do estabelecimento.
- `src/data/tide.js`: cenário de maré sintético compartilhado entre telas.
- `src/config.js`: URLs externas opcionais do WhatsApp.
- `src/index.css` e `src/App.css`: tokens, tema e estilos.

## Documentação para integração

Leia [Integração futura com o backend](docs/integracao-backend.md) antes de implementar API, persistência remota ou autenticação. O documento registra o comportamento observado no código, os campos consumidos pela interface e as decisões que ainda precisam ser fechadas; os contratos sugeridos não são endpoints já existentes.

## Configuração externa

Copie `.env.example` para `.env.local` (se disponível) e configure `VITE_WHATSAPP_TEAM_URL` e `VITE_WHATSAPP_GROUP_URL`. Links vazios aparecem desabilitados. Variáveis `VITE_*` são incorporadas ao bundle do cliente: não coloque segredos nelas.

## Observações

- React 19, Vite 8, JavaScript, React Router e Recharts.
- Não há cliente HTTP, URL de API, autenticação real ou armazenamento de arquivos neste momento.
- O cenário em `src/data/tide.js` é calculado por fórmula e não deve ser apresentado como previsão oficial.
- Interface e comentários voltados ao produto devem permanecer em português do Brasil.
