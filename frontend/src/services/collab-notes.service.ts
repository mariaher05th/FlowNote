import api from './api';

export const collabNotesService = {
  agregarColaborador: async (noteId: string, data: { usuario_id: string; username: string; nombre: string; rol: string }) => {
    const res = await api.post(`/notes/${noteId}/colaboradores`, data);
    return res.data;
  },
  cambiarRol: async (noteId: string, targetUsername: string, rol: string) => {
    const res = await api.patch(`/notes/${noteId}/colaboradores/${targetUsername}/rol`, { rol });
    return res.data;
  },
  eliminarColaborador: async (noteId: string, targetUsername: string) => {
    await api.delete(`/notes/${noteId}/colaboradores/${targetUsername}`);
  },
};
