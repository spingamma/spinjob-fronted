// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Perfil from './Perfil'

// 1. EL DIRECTORIO (La cuadrícula de profesionales)
function Directorio() {
  const [profesionales, setProfesionales] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    // 🔥 TU URL DE RENDER 🔥
    fetch("https://spinjob-api.onrender.com/profesionales/")
      .then(res => res.json())
      .then(data => { setProfesionales(data); setCargando(false); })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans antialiased text-gray-900">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-10">🚀 Directorio Spinjob</h1>
      {cargando && <p className="text-center text-gray-500 font-bold">Conectando a Render...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {profesionales.map((prof) => (
          <div key={prof.id} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all duration-300 flex flex-col items-center">
            {prof.image && <img src={prof.image} alt={prof.name} className="w-32 h-32 rounded-full object-cover border-4 border-indigo-50 mb-4" />}
            <h2 className="text-xl font-bold text-gray-800">{prof.name}</h2>
            <p className="text-sm font-semibold text-indigo-600 mb-4">{prof.title}</p>
            
            <button 
              onClick={() => navigate(`/perfil/${prof.slug}`)} 
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition-colors mt-auto"
            >
              Ver Perfil Completo
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// 2. EL GESTOR DE RUTAS
function App() {
  return (
    <Routes>
      <Route path="/" element={<Directorio />} />
      <Route path="/perfil/:slug" element={<Perfil />} />
    </Routes>
  )
}

export default App