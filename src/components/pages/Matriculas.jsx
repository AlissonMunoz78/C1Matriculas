import { useState, useEffect } from 'react'
import { matriculaAPI, estudianteAPI, materiaAPI } from '../../api'

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [materias, setMaterias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedMatricula, setSelectedMatricula] = useState(null)
  const [showMateriaForm, setShowMateriaForm] = useState(false)

  const [formData, setFormData] = useState({
    id_estudiante: '',
    codigo: '',
    descripcion: '',
    materias: []
  })

  const [newMateria, setNewMateria] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [matriculasRes, estudiantesRes, materiasRes] = await Promise.all([
        matriculaAPI.listar(),
        estudianteAPI.listar(),
        materiaAPI.listar()
      ])
      setMatriculas(matriculasRes.data.matriculas)
      setEstudiantes(estudiantesRes.data.estudiantes)
      setMaterias(materiasRes.data.materias)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al cargar datos')
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
        // Actualizar no está implementado en backend, solo crear/eliminar
        setError('La actualización no está disponible. Elimina y crea una nueva.')
      } else {
        await matriculaAPI.crear(formData)
        setSuccess('✅ Matrícula creada correctamente')
        setFormData({ id_estudiante: '', codigo: '', descripcion: '', materias: [] })
        setShowForm(false)
        await cargarDatos()
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al guardar matrícula')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarMateria = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await matriculaAPI.agregarMateria(selectedMatricula._id, newMateria)
      setSuccess('✅ Materia agregada correctamente')
      setNewMateria('')
      setShowMateriaForm(false)
      await cargarDatos()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al agregar materia')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminarMateria = async (matriculaId, materiaId) => {
    if (!window.confirm('¿Eliminar esta materia de la matrícula?')) return

    setLoading(true)
    try {
      await matriculaAPI.eliminarMateria(matriculaId, materiaId)
      setSuccess('✅ Materia eliminada')
      await cargarDatos()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar materia')
    } finally {
      setLoading(false)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar esta matrícula completamente?')) return

    setLoading(true)
    try {
      await matriculaAPI.eliminar(id)
      setSuccess('✅ Matrícula eliminada')
      setSelectedMatricula(null)
      await cargarDatos()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al eliminar')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMatricula = (matricula) => {
    setSelectedMatricula(matricula)
    setShowMateriaForm(false)
  }

  if (loading && !matriculas.length) return <div className="container"><p>Cargando...</p></div>

  return (
    <div className="container">
      <div className="header">
        <h2>📋 Matrículas</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '❌ Cancelar' : '➕ Nueva Matrícula'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Estudiante:</label>
            <select
              value={formData.id_estudiante}
              onChange={(e) => setFormData({ ...formData, id_estudiante: e.target.value })}
              required
            >
              <option value="">Selecciona un estudiante</option>
              {estudiantes.map(est => (
                <option key={est._id} value={est._id}>
                  {est.nombre} {est.apellido} ({est.cedula})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Código:</label>
            <input
              type="text"
              value={formData.codigo}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="MAT2024-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <input
              type="text"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la matrícula"
            />
          </div>

          <div className="form-group">
            <label>Materias (puedes agregar después):</label>
            <select
              multiple
              value={formData.materias}
              onChange={(e) => setFormData({
                ...formData,
                materias: Array.from(e.target.selectedOptions, option => option.value)
              })}
            >
              {materias.map(mat => (
                <option key={mat._id} value={mat._id}>
                  {mat.nombre} ({mat.codigo}) - {mat.creditos} créditos
                </option>
              ))}
            </select>
            <small>Usa Ctrl+Click para seleccionar múltiples</small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Crear Matrícula'}
          </button>
        </form>
      )}

      <div className="content-wrapper">
        <div className="list-section">
          <h3>Matrículas Registradas</h3>
          {matriculas.length === 0 ? (
            <p>No hay matrículas registradas</p>
          ) : (
            <ul className="list">
              {matriculas.map(mat => (
                <li
                  key={mat._id}
                  className={selectedMatricula?._id === mat._id ? 'active' : ''}
                  onClick={() => handleSelectMatricula(mat)}
                >
                  <strong>{mat.codigo}</strong> - {mat.id_estudiante.nombre}
                  <br />
                  <small>{mat.materias.length} materias | {mat.creditosCalculados} créditos</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedMatricula && (
          <div className="detail-section">
            <h3>Detalle de Matrícula</h3>
            <div className="detail-box">
              <p><strong>Código:</strong> {selectedMatricula.codigo}</p>
              <p><strong>Estudiante:</strong> {selectedMatricula.id_estudiante.nombre} {selectedMatricula.id_estudiante.apellido}</p>
              <p><strong>Email:</strong> {selectedMatricula.id_estudiante.email}</p>
              <p><strong>Descripción:</strong> {selectedMatricula.descripcion || 'N/A'}</p>
              <p><strong>Créditos Totales:</strong> {selectedMatricula.creditosCalculados}</p>

              <h4 style={{ marginTop: '20px' }}>Materias Inscritas:</h4>
              {selectedMatricula.materias.length === 0 ? (
                <p>Sin materias</p>
              ) : (
                <ul className="materias-list">
                  {selectedMatricula.materias.map(mat => (
                    <li key={mat._id}>
                      <span>
                        <strong>{mat.nombre}</strong> ({mat.codigo}) - {mat.creditos} créditos
                      </span>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleEliminarMateria(selectedMatricula._id, mat._id)}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {!showMateriaForm && (
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: '10px' }}
                  onClick={() => setShowMateriaForm(true)}
                >
                  ➕ Agregar Materia
                </button>
              )}

              {showMateriaForm && (
                <form onSubmit={handleAgregarMateria} style={{ marginTop: '15px' }}>
                  <select
                    value={newMateria}
                    onChange={(e) => setNewMateria(e.target.value)}
                    required
                  >
                    <option value="">Selecciona una materia</option>
                    {materias
                      .filter(m => !selectedMatricula.materias.some(sm => sm._id === m._id))
                      .map(mat => (
                        <option key={mat._id} value={mat._id}>
                          {mat.nombre} ({mat.codigo}) - {mat.creditos} créditos
                        </option>
                      ))}
                  </select>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Agregar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowMateriaForm(false)}
                  >
                    Cancelar
                  </button>
                </form>
              )}

              <button
                className="btn btn-danger"
                style={{ marginTop: '20px', width: '100%' }}
                onClick={() => handleEliminar(selectedMatricula._id)}
              >
                🗑️ Eliminar Matrícula
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
