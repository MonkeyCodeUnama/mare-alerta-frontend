// Link para serviço externo; enquanto a URL não estiver configurada, vira um botão desativado.
export default function ExternalLink({ href, className = 'button', children }) {
  if (!href) {
    return <button type="button" className={className} disabled title="Link ainda não configurado">{children}</button>;
  }
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}
