// Links externos configuráveis por variável de ambiente (veja .env.example).
export const links = {
  whatsappTeam: import.meta.env.VITE_WHATSAPP_TEAM_URL || '',
  whatsappGroup: import.meta.env.VITE_WHATSAPP_GROUP_URL || '',
};
