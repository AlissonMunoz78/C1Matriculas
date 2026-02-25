import { useState, useEffect } from 'react'
import { estudianteAPI } from '../../api'

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    ciudad: ''
  })

  useEffect(() => {
    cargarEstudiantes()
  }, [])

  const cargarEstudiantes = async () => {
    setLoading(true)
    try {
      const response = await estudianteAPI.listar()
      setEstudiantes(response.data.estudiantes)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al cargar estudiantes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        await estudianteAPI.actualizar(editingId, formData)
        setSuccess('✅ Estudiante actualizado')
        setEditingId(null)
      } else {
        await estudianteAPI.crear(formData)
        setSuccess('✅ Estudiante creado')
      }
      setFormData({ nombre: '', apellido: '', cedula: '', email: '', telefono: '', ciudad: '' })
      setShowForm(false)
      await cargarEstudiantes()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar estudiante')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (est) => {
    setFormData(est)
    setEditingId(est._id)
    setShowForm(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este estudiante?')) return
    setLoading(true)
    try {
      await estudianteAPI.eliminar(id)
      setSuccess('✅ Estudiante eliminado')
      await cargarEstudiantes()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nombre: '', apellido: '', cedula: '', email: '', telefono: '', ciudad: '' })
  }

  if (loading && !estudiantes.length) return <div className="container"><p>Cargando...</p></div>

  return (
    <div className="container">
      <div className="header">
        <h2>👥 Estudiantes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '➕ Nuevo Estudiante'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Apellido:</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cédula:</label>
              <input
                type="text"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Ciudad:</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No hay estudiantes registrados</td>
              </tr>
            ) : (
              estudiantes.map(est => (
                <tr key={est._id}>
                  <td>{est.nombre}</td>
                  <td>{est.apellido}</td>
                  <td>{est.cedula}</td>
                  <td>{est.email || '-'}</td>
                  <td>{est.telefono || '-'}</td>
                  <td>{est.ciudad || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-info"
                      onClick={() => handleEditar(est)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleEliminar(est._id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
