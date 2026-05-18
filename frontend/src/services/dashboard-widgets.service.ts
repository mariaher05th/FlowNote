import api from './api';

export interface DashboardWidget {
  _id: string;
  tipo: 'pendientes' | 'nota' | 'nota_rapida' | 'recordatorios' | 'externo';
  config: Record<string, any>;
  orden: number;
}

export const dashboardWidgetsService = {
  getAll: async (): Promise<DashboardWidget[]> => {
    const res = await api.get('/widgets/dashboard');
    return res.data;
  },

  create: async (tipo: string, config: Record<string, any> = {}): Promise<DashboardWidget> => {
    const res = await api.post('/widgets/dashboard', { tipo, config });
    return res.data;
  },

  updateConfig: async (id: string, config: Record<string, any>): Promise<DashboardWidget> => {
    const res = await api.put(`/widgets/dashboard/${id}`, { config });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/widgets/dashboard/${id}`);
  },
};
