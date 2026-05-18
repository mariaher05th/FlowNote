import api from './api';

export interface RegisterData {
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  contrasena: string;
}

export interface LoginData {
  username: string;
  contrasena: string;
}

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.usuario));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  buscarUsuarios: async (q: string): Promise<{ _id: string; nombre: string; apellido: string; username: string }[]> => {
    const res = await api.get(`/auth/buscar?q=${encodeURIComponent(q)}`);
    return res.data;
  },
};