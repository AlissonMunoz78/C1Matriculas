import axios from 'axios'

const API_URL = 'https://c1sistema-matriculas.vercel.app/api'

const api = axios.create({
  baseURL: API_URL
})

// Agregar token a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===== AUTENTICACIÓN =====
export const authAPI = {
  registro: (datos) => api.post('/auth/registro', datos),
  login: (email, password) => api.post('/auth/login', { email, password }),
  perfil: () => api.get('/auth/perfil')
}

// ===== ESTUDIANTES =====
export const estudianteAPI = {
  listar: () => api.get('/estudiantes'),
  obtener: (id) => api.get(`/estudiantes/${id}`),
  crear: (datos) => api.post('/estudiantes', datos),
  actualizar: (id, datos) => api.put(`/estudiantes/${id}`, datos),
  eliminar: (id) => api.delete(`/estudiantes/${id}`)
}

// ===== MATERIAS =====
export const materiaAPI = {
  listar: () => api.get('/materias'),
  obtener: (id) => api.get(`/materias/${id}`),
  crear: (datos) => api.post('/materias', datos),
  actualizar: (id, datos) => api.put(`/materias/${id}`, datos),
  eliminar: (id) => api.delete(`/materias/${id}`)
}

// ===== MATRÍCULAS =====
export const matriculaAPI = {
  listar: () => api.get('/matriculas'),
  obtener: (id) => api.get(`/matriculas/${id}`),
  crear: (datos) => api.post('/matriculas', datos),
  agregarMateria: (id, id_materia) => api.post(`/matriculas/${id}/materias`, { id_materia }),
  eliminarMateria: (id, idMateria) => api.delete(`/matriculas/${id}/materias/${idMateria}`),
  eliminar: (id) => api.delete(`/matriculas/${id}`)
}

export default api
