export function storeFromApi(profile, email = '') {
  return {
    id: profile.id,
    name: profile.nome ?? profile.name ?? '',
    owner: profile.responsavel ?? profile.owner ?? '',
    cnpj: profile.documento ?? profile.cnpj ?? '',
    email,
    neighborhood: profile.bairro ?? profile.neighborhood ?? '',
    street: profile.logradouro ?? profile.street ?? '',
    number: profile.numero ?? profile.number ?? '',
    type: profile.tipoNegocio ?? profile.type ?? '',
    days: profile.dias ?? profile.days ?? [],
    opening: profile.horarioAbertura ?? profile.opening ?? '',
    closing: profile.horarioFechamento ?? profile.closing ?? '',
    criticalItems: profile.itensCriticos ?? profile.criticalItems ?? [],
    complemento: profile.complemento ?? '',
    cep: profile.cep ?? '',
    telefone: profile.telefone ?? '',
    municipio: profile.municipio ?? 'Belém',
    uf: profile.uf ?? 'PA',
  };
}
