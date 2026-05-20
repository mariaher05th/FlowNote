import api from './api';

export interface Reminder {
  _id: string;
  nota_id: string;
  usuario_id: string;
  mensaje: string;
  fecha_hora: string;
  enviado: boolean;
}

export const remindersService = {
  getAll: async (): Promise<Reminder[]> => {
    const res = await api.get('/reminders');
    return res.data;
  },
  marcarEnviado: async (id: string): Promise<void> => {
    await api.put(`/reminders/${id}`, { enviado: true });
  },
  eliminar: async (id: string): Promise<void> => {
    await api.delete(`/reminders/${id}`);
  },
};
