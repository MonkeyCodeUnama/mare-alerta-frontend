// Links externos configuráveis por variável de ambiente (veja .env.example).
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://ma-api.andr3dav1d.dev').replace(/\/$/, '');

export const links = {
  whatsappTeam: import.meta.env.VITE_WHATSAPP_TEAM_URL || '',
  whatsappGroup: import.meta.env.VITE_WHATSAPP_GROUP_URL || '',
};
