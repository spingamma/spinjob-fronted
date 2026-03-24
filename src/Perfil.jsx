import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Importamos las Plantillas Premium (Añadirás las demás después)
import PlantillaInmobiliaria from './plantillas/PlantillaInmobiliaria';

// Importamos la Genérica Dinámica
import PlantillaGenerica from './plantillas/PlantillaGenerica';

function Perfil() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profesional, setProfesional] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("https://spinjob-api.onrender.com/profesionales/")
      .then(res => res.json())
      .then(data => {
        const perfilEncontrado = data.find(p => p.slug === slug);
        setProfesional(perfilEncontrado);
        setCargando(false);
      });
  }, [slug]);

  if (cargando) return <h2 className="text-center mt-20 text-xl font-bold">Cargando perfil...</h2>;
  if (!profesional) return <h2 className="text-center mt-20 text-xl text-red-500">Perfil no encontrado</h2>;

  const volverAtras = () => navigate("/");

  // ==========================================
  // 💎 CLIENTES PREMIUM (Trajes a la medida)
  // ==========================================
  if (slug === 'inmobiliaria-san-luis') {
    return <PlantillaInmobiliaria profesional={profesional} volverAtras={volverAtras} />;
  }
  
  // Aquí agregarás los demás cuando los crees:
  // if (slug === 'juan-pablo-jurado') return <PlantillaJuanPablo profesional={profesional} volverAtras={volverAtras} />;
  // if (slug === 'ronald-jorge-sanchez') return <PlantillaRonald profesional={profesional} volverAtras={volverAtras} />;

  // ==========================================
  // 🏢 CLIENTES ESTÁNDAR (La Genérica que cambia de color)
  // ==========================================
  return <PlantillaGenerica profesional={profesional} volverAtras={volverAtras} />;
}

export default Perfil;