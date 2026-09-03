import axios from 'axios'
import type {
  AuthResponse,
  Group,
  Card,
  SimpleGroup,
  CreateCardRequest,
  UpdateCardRequest,
  MoveCardRequest,
  CreateGroupRequest,
  UpdateGroupRequest,
} from '../types'



const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { username, password }).then((r) => r.data),

  register: (username: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { username, password }).then((r) => r.data),
}

// Groups
export const groupsApi = {
  getAll: () => api.get<Group[]>('/groups').then((r) => r.data),

  create: (data: CreateGroupRequest) =>
    api.post<SimpleGroup>('/groups', data).then((r) => r.data),

  update: (id: number, data: UpdateGroupRequest) =>
    api.put<SimpleGroup>(`/groups/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/groups/${id}`),
}

// Cards
export const cardsApi = {
  get: (id: number) => api.get<Card>(`/cards/${id}`).then((r) => r.data),

  create: (data: CreateCardRequest) =>
    api.post<Card>('/cards', data).then((r) => r.data),

  update: (id: number, data: UpdateCardRequest) =>
    api.put<Card>(`/cards/${id}`, data).then((r) => r.data),

  move: (id: number, data: MoveCardRequest) =>
    api.patch<Card>(`/cards/${id}/move`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/cards/${id}`),
}

export default api
