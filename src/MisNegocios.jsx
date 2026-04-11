// Archivo: src/MisNegocios.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, PlusCircle, Building, Eye, FileText, X } from 'lucide-react';

// Mini-componente para mostrar los campos en solo lectura
const CampoLectura = ({ label, valor }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
    <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="block text-sm font-medium text-[#1E3D51] break-words whitespace-pre-wrap">
      {valor ? valor : <span className="text-gray-300 italic">No especificado</span>}
    </span>
  </div>
);

export default function MisNegocios() {
  const [negocios, setNegocios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Estado para controlar qué negocio se está viendo en el modal
  const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);

  useEffect(() => {
    const fetchMisNegocios = async () => {
      const token = localStorage.getItem('spingamma_token');
      if (!token) {
        navigate('/');
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_URL}/usuarios/mis-negocios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Error al cargar tus negocios");
        
        const data = await res.json();
        setNegocios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchMisNegocios();
  }, [navigate]);

  if (cargando) return <div className="text-center py-20 text-[#1E3D51] font-bold">Cargando tus negocios...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto relative">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#32698F] hover:text-[#B95221] font-medium mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Volver
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#1E3D51] flex items-center gap-3">
            <Building className="text-[#B95221]" /> Mis Negocios
          </h1>
          <Link to="/crear-negocio" className="bg-[#B95221] hover:bg-[#9A4219] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-transform hover:-translate-y-0.5">
            <PlusCircle size={18} /> Nuevo
          </Link>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>}

        {negocios.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500 mb-4">Aún no has registrado ningún negocio.</p>
            <Link to="/crear-negocio" className="text-[#B95221] font-bold underline">Crea tu primer perfil profesional</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {negocios.map(neg => (
              <div key={neg.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 transition-all hover:shadow-md">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-xl text-[#1E3D51]">{neg.name}</h3>
                    <p className="text-gray-500 text-sm">{neg.title} • {neg.category}</p>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    {neg.status === 'aprobado' && (
                      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full font-bold text-sm">
                        <CheckCircle2 size={16} /> Aprobado
                      </div>
                    )}
                    {neg.status === 'pendiente' && (
                      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-bold text-sm">
                        <Clock size={16} /> En Revisión
                      </div>
                    )}
                    {neg.status === 'rechazado' && (
                      <>
                        <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full font-bold text-sm mb-2">
                          <XCircle size={16} /> Rechazado
                        </div>
                        <p className="text-xs text-red-500 max-w-xs text-right bg-red-50/50 p-2 rounded-lg border border-red-100">
                          <strong>Motivo:</strong> {neg.rejection_reason || "No cumple las políticas."}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap justify-end gap-4">
                  
                  {/* Este botón abre el modal de solo lectura, SIEMPRE visible */}
                  <button 
                    onClick={() => setNegocioSeleccionado(neg)}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#1E3D51] transition-colors"
                  >
                    <FileText size={18} /> Ver Datos Enviados
                  </button>

                  {/* Este enlace va a la tarjeta pública, SOLO visible si está aprobado */}
                  {neg.status === 'aprobado' && (
                    <Link 
                      to={`/perfil/${neg.slug}`} 
                      className="flex items-center gap-2 text-sm font-bold text-[#32698F] hover:text-[#B95221] transition-colors"
                    >
                      <Eye size={18} /> Ver Tarjeta Pública
                    </Link>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

        {/* MODAL DE VISTA PREVIA DEL FORMULARIO */}
        {negocioSeleccionado && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1E3D51]/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#F8F9FA] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              
              <div className="bg-gradient-to-r from-[#1E3D51] to-[#32698F] p-5 flex justify-between items-center text-white shrink-0">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Building size={20} /> Datos del Formulario
                </h2>
                <button onClick={() => setNegocioSeleccionado(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {negocioSeleccionado.status === 'pendiente' && (
                  <div className="bg-orange-50 text-orange-800 p-4 rounded-xl border border-orange-200 text-sm">
                    <strong>Información en revisión:</strong> Estos datos fueron enviados a los administradores. Una vez aprobados, se generará tu tarjeta digital pública.
                  </div>
                )}
                
                {negocioSeleccionado.status === 'rechazado' && (
                  <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 text-sm">
                    <strong>Solicitud rechazada:</strong> {negocioSeleccionado.rejection_reason}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Información Principal</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CampoLectura label="Nombre / Marca" valor={negocioSeleccionado.name} />
                    <CampoLectura label="Especialidad" valor={negocioSeleccionado.title} />
                    <CampoLectura label="Categoría" valor={negocioSeleccionado.category} />
                    <CampoLectura label="País" valor={negocioSeleccionado.country} />
                    <CampoLectura label="Ciudad / Departamento" valor={negocioSeleccionado.state} />
                    <CampoLectura label="Zona / Barrio" valor={negocioSeleccionado.neighborhood} />
                    <CampoLectura label="Género" valor={negocioSeleccionado.genero} />
                  </div>
                  <div className="mt-3">
                    <CampoLectura label="Descripción de Servicios" valor={negocioSeleccionado.description} />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Contacto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CampoLectura label="WhatsApp" valor={negocioSeleccionado.whatsapp} />
                    <CampoLectura label="Teléfono Fijo" valor={negocioSeleccionado.phone} />
                  </div>
                  <div className="mt-3">
                    <CampoLectura label="Link de Ubicación (Maps)" valor={negocioSeleccionado.ubicacion_url} />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#B95221] border-b border-gray-200 pb-2 mb-3">Redes Sociales</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CampoLectura label="Página Web" valor={negocioSeleccionado.website} />
                    <CampoLectura label="Facebook" valor={negocioSeleccionado.facebook} />
                    <CampoLectura label="Instagram" valor={negocioSeleccionado.instagram} />
                    <CampoLectura label="LinkedIn" valor={negocioSeleccionado.linkedin} />
                    <CampoLectura label="TikTok" valor={negocioSeleccionado.tiktok} />
                    <CampoLectura label="GitHub" valor={negocioSeleccionado.github} />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}