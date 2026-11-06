# Componentes do front-end

Os exemplos assumem um arquivo JSX diretamente em `src/pages/`. Os estilos compartilhados já são carregados por [`src/main.jsx`](../src/main.jsx).

## AppShell

[`src/components/AppShell.jsx`](../src/components/AppShell.jsx) organiza as telas autenticadas. Exibe o menu lateral, o estabelecimento conectado, o cabeçalho e o conteúdo da página. Use dentro de `BrowserRouter` e `StoreProvider`, em uma rota protegida que já carregou o perfil.

| Prop | Tipo | Padrão | Uso |
| --- | --- | --- | --- |
| `active` | `string` | `undefined` | Caminho do item que deve aparecer selecionado. Use `/ocorrencias` também na página `/ocorrencias/lista`, que pertence ao mesmo item. Sem valor, nenhum item fica selecionado. |
| `children` | `ReactNode` | `undefined` | Conteúdo exibido na área principal, abaixo do cabeçalho. |

**Estados visuais**

- Em telas acima de `900px`, o menu lateral fica visível. O item selecionado usa o fundo de marca.
- Até `900px`, o menu inicia fechado. O botão no cabeçalho alterna entre os ícones de menu e fechar. Selecionar um link fecha o menu.
- O item **WhatsApp Admin** aparece quando a sessão tem o papel `ADMIN`.

Exemplo para uma página da rota `/checklist`.

```jsx
import AppShell from '../components/AppShell';

export default function ChecklistPage() {
  return (
    <AppShell active="/checklist">
      <div className="ops-content">
        <h1>Checklist de Prevenção</h1>
      </div>
    </AppShell>
  );
}
```

## ExternalLink

[`src/components/ExternalLink.jsx`](../src/components/ExternalLink.jsx) apresenta um atalho para um serviço externo opcional. O histórico usa esse componente para o grupo de WhatsApp, e o checklist o usa para o contato com a equipe.

| Prop | Tipo | Padrão | Uso |
| --- | --- | --- | --- |
| `href` | `string` | `undefined` | URL de destino. Uma string vazia ou a ausência da prop deixa a ação desativada. |
| `className` | `string` | `'button'` | Classes aplicadas ao link ou botão. Use `button primary` para a variante primária. |
| `children` | `ReactNode` | `undefined` | Conteúdo visível. Forneça um rótulo que identifique o destino. |

**Estados visuais**

- Com URL, o componente renderiza um link estilizado como botão e abre o destino em outra aba. Ao passar o ponteiro, a variante padrão destaca a borda e a primária muda o fundo.
- Sem URL, o componente renderiza um botão desativado, com `55%` de opacidade nas classes padrão e o título “Link ainda não configurado”.

O exemplo lê `VITE_WHATSAPP_GROUP_URL` por meio de `links.whatsappGroup`. Sem valor para a variável, o botão fica desativado.

```jsx
import ExternalLink from '../components/ExternalLink';
import { links } from '../config';

export default function GroupLink() {
  return (
    <ExternalLink className="button primary" href={links.whatsappGroup}>
      Entrar no Grupo WhatsApp
    </ExternalLink>
  );
}
```

## ThemeToggle

[`src/components/ThemeToggle.jsx`](../src/components/ThemeToggle.jsx) alterna o tema global. O componente não recebe props. Sem preferência salva, acompanha o tema do sistema. Ao alternar, define `data-theme` no elemento `<html>` e tenta salvar a escolha em `localStorage`, na chave `mare-alerta-theme`.

**Estados visuais**

- Tema claro. Mostra o ícone de lua e o rótulo acessível “Usar tema escuro”.
- Tema escuro. Mostra o ícone de sol e o rótulo acessível “Usar tema claro”.
- Ao passar o ponteiro, a borda e o ícone ganham as cores de marca. O foco por teclado exibe o contorno de foco compartilhado.

Exemplo de uso em um cabeçalho de página pública. Nas telas que usam `AppShell`, o botão já faz parte do cabeçalho.

```jsx
import ThemeToggle from '../components/ThemeToggle';

export default function PublicHeader() {
  return (
    <header>
      <span>Maré Alerta</span>
      <ThemeToggle />
    </header>
  );
}
```
