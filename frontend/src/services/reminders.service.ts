import api from './api';

export interface Reminder {
  _id: string;
  titulo: string;
  fecha: string;
  completado: boolean;
}

export const remindersService = {
  getAll: async (): Promise<Reminder[]> => {
    const res = await api.get('/reminders');
    return res.data;
  },
};
