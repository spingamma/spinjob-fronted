import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ==========================================
// 📥 IMPORTACIÓN DE PLANTILLAS
// ==========================================
// 1. Plantilla Estándar
import PlantillaGenerica from './plantillas/PlantillaGenerica';

// 2. Plantillas Premium (Descomentar a medida que se creen)
import PlantillaInmobiliaria from './plantillas/PlantillaInmobiliaria';
// import PlantillaJuanPablo from './plantillas/PlantillaJuanPablo';

function Perfil() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profesional, setProfesional] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Variable de entorno para saber si usamos la URL local o de producción
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // Usamos la variable de entorno para que el fetch sea dinámico
    fetch(`${API_URL}/profesionales`)
      .then(res => res.json())
      .then(data => {
        const perfilEncontrado = data.find(p => p.slug === slug);
        setProfesional(perfilEncontrado);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error cargando perfil:", err);
        setCargando(false);
      });
  }, [slug, API_URL]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#1E3D51] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#F67927] mb-4"></div>
        <p className="text-[#E6E2DF] font-medium text-lg">Cargando perfil...</p>
      </div>
    );
  }

  if (!profesional) {
    return (
      <div className="min-h-screen bg-[#1E3D51] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-2">Perfil no encontrado</h2>
        <button onClick={() => navigate("/")} className="text-[#F67927] hover:underline">
          Volver al directorio
        </button>
      </div>
    );
  }

  const volverAtras = () => navigate("/");

  // ==========================================
  // 💎 ENRUTADOR DE CLIENTES PREMIUM 
  // ==========================================
  // Aquí es donde "conectaremos" los diseños personalizados.
  // Ejemplo:
  if (slug === 'inmobiliaria-san-luis') {
    return <PlantillaInmobiliaria profesional={profesional} volverAtras={volverAtras} />;
   }
  
  // ==========================================
  // 🏢 CLIENTES ESTÁNDAR (El diseño por defecto)
  // ==========================================
  return <PlantillaGenerica profesional={profesional} volverAtras={volverAtras} />;
}

export default Perfil;