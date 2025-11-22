import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', new URLSearchParams(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  }),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  getStorage: () => api.get('/users/storage'),
};

export const folderAPI = {
  getAll: () => api.get('/folders'),
  create: (data: any) => api.post('/folders', data),
  delete: (id: string) => api.delete(`/folders/${id}`),
};

export const fileAPI = {
  initUpload: (data: any) => api.post('/files/upload/init', data),
  completeUpload: (id: string) => api.post(`/files/upload/${id}/complete`),
  getAll: (folderId?: string) => api.get('/files', { params: { folder_id: folderId } }),
  getDownloadUrl: (id: string) => api.get(`/files/${id}/download`),
  delete: (id: string) => api.delete(`/files/${id}`),
};

export const shareAPI = {
  send: (data: any) => api.post('/shares', data),
  getSent: () => api.get('/shares/sent'),
  getReceived: () => api.get('/shares/received'),
  getDetails: (id: string) => api.get(`/shares/${id}`),
};

export const searchAPI = {
  search: (query: string, folderId?: string) => 
    api.get('/search', { params: { q: query, folder_id: folderId } }),
};
