import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Estudiantes from './pages/Estudiantes'
import Materias from './pages/Materias'
import Matriculas from './pages/Matriculas'
import './styles.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const [seccion, setSeccion] = useState('matriculas')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>📚 Gestión de Matrículas</h1>
        <div className="nav-buttons">
          <button
            className={seccion === 'matriculas' ? 'active' : ''}
            onClick={() => setSeccion('matriculas')}
          >
            Matrículas
          </button>
          <button
            className={seccion === 'estudiantes' ? 'active' : ''}
            onClick={() => setSeccion('estudiantes')}
          >
            Estudiantes
          </button>
          <button
            className={seccion === 'materias' ? 'active' : ''}
            onClick={() => setSeccion('materias')}
          >
            Materias
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="content">
        {seccion === 'matriculas' && <Matriculas />}
        {seccion === 'estudiantes' && <Estudiantes />}
        {seccion === 'materias' && <Materias />}
      </main>
    </div>
  )
}
