import api from './api';

export interface Colaborador {
  usuario_id: string;
  username: string;
  nombre: string;
  rol: string;
}

export interface Note {
  _id: string;
  titulo: string;
  contenido: string;
  estado: string;
  es_colaborativa: boolean;
  etiquetas: string[];
  colaboradores: Colaborador[];
  createdAt: string;
  updatedAt: string;
}

export const notesService = {
  getAll: async (): Promise<Note[]> => {
    const res = await api.get('/notes');
    return res.data;
  },

  create: async (data: {
    titulo: string;
    es_colaborativa?: boolean;
    colaboradores?: Colaborador[];
    etiquetas?: string[];
  }): Promise<Note> => {
    const res = await api.post('/notes', data);
    return res.data;
  },

  update: async (id: string, data: Partial<Pick<Note, 'titulo' | 'contenido' | 'estado' | 'etiquetas' | 'colaboradores'>>): Promise<Note> => {
    const res = await api.put(`/notes/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },
};
