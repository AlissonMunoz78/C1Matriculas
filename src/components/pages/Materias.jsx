import { useState, useEffect } from 'react'
import { materiaAPI } from '../../api'

export default function Materias() {
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    creditos: ''
  })

  useEffect(() => {
    cargarMaterias()
  }, [])

  const cargarMaterias = async () => {
    setLoading(true)
    try {
      const response = await materiaAPI.listar()
      setMaterias(response.data.materias)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al cargar materias')
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
      const datos = {
        ...formData,
        creditos: Number(formData.creditos)
      }

      if (editingId) {
        await materiaAPI.actualizar(editingId, datos)
        setSuccess('✅ Materia actualizada')
        setEditingId(null)
      } else {
        await materiaAPI.crear(datos)
        setSuccess('✅ Materia creada')
      }
      setFormData({ nombre: '', codigo: '', descripcion: '', creditos: '' })
      setShowForm(false)
      await cargarMaterias()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar materia')
    } finally {
      setLoading(false)
    }
  }

  const handleEditar = (mat) => {
    setFormData({ ...mat, creditos: mat.creditos.toString() })
    setEditingId(mat._id)
    setShowForm(true)
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta materia?')) return
    setLoading(true)
    try {
      await materiaAPI.eliminar(id)
      setSuccess('✅ Materia eliminada')
      await cargarMaterias()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nombre: '', codigo: '', descripcion: '', creditos: '' })
  }

  if (loading && !materias.length) return <div className="container"><p>Cargando...</p></div>

  return (
    <div className="container">
      <div className="header">
        <h2>📖 Materias</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '➕ Nueva Materia'}
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
                placeholder="Ej: Matemáticas Avanzada"
                required
              />
            </div>
            <div className="form-group">
              <label>Código:</label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                placeholder="Ej: MAT101"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la materia"
            />
          </div>

          <div className="form-group">
            <label>Créditos:</label>
            <input
              type="number"
              value={formData.creditos}
              onChange={(e) => setFormData({ ...formData, creditos: e.target.value })}
              min="0"
              max="10"
              required
            />
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
              <th>Código</th>
              <th>Descripción</th>
              <th>Créditos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">No hay materias registradas</td>
              </tr>
            ) : (
              materias.map(mat => (
                <tr key={mat._id}>
                  <td><strong>{mat.nombre}</strong></td>
                  <td>{mat.codigo}</td>
                  <td>{mat.descripcion || '-'}</td>
                  <td><span className="badge">{mat.creditos}</span></td>
                  <td className="actions">
                    <button
                      className="btn btn-small btn-info"
                      onClick={() => handleEditar(mat)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleEliminar(mat._id)}
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
