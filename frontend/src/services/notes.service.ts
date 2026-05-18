import api from './api';

export interface Note {
  _id: string;
  titulo: string;
  contenido: string;
  estado: string;
  createdAt: string;
}

export const notesService = {
  getAll: async (): Promise<Note[]> => {
    const res = await api.get('/notes');
    return res.data;
  },
};
