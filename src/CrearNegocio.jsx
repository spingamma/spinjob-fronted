// Archivo: src/CrearNegocio.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, Building, MapPin, AlignLeft, Phone, ArrowLeft, 
  Loader2, Clock, Globe, Link as LinkIcon, User, Map 
} from 'lucide-react';

export default function CrearNegocio() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '', title: '', category: '', subcategory: '', country: 'Bolivia', state: '', neighborhood: '', description: '',
    genero: '', phone: '', whatsapp: '', facebook: '', instagram: '',
    linkedin: '', website: '', tiktok: '', github: '', ubicacion_url: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDetectLocation = () => {
    setIsDetecting(true);
    setError('');

    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, ubicacion_url: url }));
        setIsDetecting(false);
        // Feedback visual rápido
        const input = document.getElementsByName('ubicacion_url')[0];
        if (input) {
          input.classList.add('ring-2', 'ring-green-400');
          setTimeout(() => input.classList.remove('ring-2', 'ring-green-400'), 2000);
        }
      },
      (err) => {
        console.error(err);
        let msg = "No se pudo obtener tu ubicación.";
        if (err.code === 1) msg = "Permiso de ubicación denegado. Por favor, actívalo en tu navegador.";
        else if (err.code === 2) msg = "Posición no disponible.";
        else if (err.code === 3) msg = "Tiempo de espera agotado.";
        
        setError(msg);
        setIsDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('spingamma_token');
    if (!token) {
      setError('Debes iniciar sesión para registrar un negocio.');
      setIsSubmitting(false);
      return;
    }

    // Limpiar campos vacíos para que no mande strings vacíos si el backend espera null
    const payload = { ...formData };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') payload[key] = null;
    });

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/businesses/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al crear el negocio.');
      }

      setSuccess(true);
      setTimeout(() => navigate('/mis-negocios'), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4 text-center">
        <Clock size={64} className="text-[#F67927] mb-4" />
        <h2 className="text-2xl font-bold text-[#1E3D51]">¡Solicitud enviada con éxito!</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Tu negocio ha sido registrado y está en estado <strong>Pendiente de Revisión</strong>. 
          Te estamos redirigiendo a tu panel...
        </p>
      </div>
    );
  }

  // Clases comunes para inputs para no repetir tanto código
  const inputClass = "w-full bg-transparent px-3 py-3 outline-none text-[#1E3D51]";
  const wrapperClass = "flex bg-gray-50 rounded-xl border border-gray-200 focus-within:border-[#B95221] focus-within:ring-1 focus-within:ring-[#B95221] transition-all overflow-hidden";
  const labelClass = "text-sm font-bold text-[#1E3D51] uppercase tracking-wide mb-1 block";

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-[#32698F] hover:text-[#B95221] font-medium mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver atrás
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-[#1E3D51] to-[#32698F] p-8 text-white text-center">
            <h1 className="text-3xl font-extrabold mb-2">Registra tu Negocio</h1>
            <p className="text-[#E6E2DF]">Completa tu perfil para destacar en SpinJob.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
            <div>
              <h3 className="text-lg font-extrabold text-[#B95221] border-b border-gray-200 pb-2 mb-4">Información Principal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className={labelClass}>Nombre / Marca *</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Briefcase size={18} /></div>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Dra. Ana López" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Especialidad / Título *</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><AlignLeft size={18} /></div>
                    <input required name="title" value={formData.title} onChange={handleChange} placeholder="Ej. Odontóloga Especialista" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Categoría *</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Building size={18} /></div>
                    <input required name="category" value={formData.category} onChange={handleChange} placeholder="Ej. Salud, Tecnología..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Sub-especialidad (Opcional)</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><AlignLeft size={18} /></div>
                    <input name="subcategory" value={formData.subcategory || ""} onChange={handleChange} placeholder="Ej. Ortodoncia, Frontend..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>País *</label>
                  <div className={`${wrapperClass} opacity-70`}>
                    <div className="pl-4 flex items-center text-gray-400"><MapPin size={18} /></div>
                    <input name="country" value={formData.country} readOnly disabled className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Ciudad / Departamento *</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><MapPin size={18} /></div>
                    <select required name="state" value={formData.state} onChange={handleChange} className={`${inputClass} bg-transparent cursor-pointer`}>
                      <option value="">Seleccionar...</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="Oruro">Oruro</option>
                      <option value="Potosí">Potosí</option>
                      <option value="Chuquisaca">Chuquisaca</option>
                      <option value="Tarija">Tarija</option>
                      <option value="Beni">Beni</option>
                      <option value="Pando">Pando</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Zona / Barrio *</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Map size={18} /></div>
                    <input required name="neighborhood" value={formData.neighborhood} onChange={handleChange} placeholder="Ej. Zona Sur" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Género (Opcional)</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><User size={18} /></div>
                    <select name="genero" value={formData.genero} onChange={handleChange} className={`${inputClass} bg-transparent cursor-pointer`}>
                      <option value="">Seleccionar...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Empresa">Empresa / No aplica</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="mt-5">
                <label className={labelClass}>Descripción de Servicios *</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="¿Qué servicios ofreces? Destaca tu experiencia..." className="w-full bg-gray-50 rounded-xl border border-gray-200 focus:border-[#B95221] focus:ring-1 focus:ring-[#B95221] transition-all px-4 py-3 outline-none text-[#1E3D51] resize-none"></textarea>
              </div>
            </div>

            {/* SECCIÓN 2: CONTACTO Y UBICACIÓN */}
            <div>
              <h3 className="text-lg font-extrabold text-[#B95221] border-b border-gray-200 pb-2 mb-4">Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className={labelClass}>WhatsApp (Principal)</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Phone size={18} /></div>
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="Ej. +59170000000" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Teléfono Fijo / Otro</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Phone size={18} /></div>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Ej. 2123456" className={inputClass} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex justify-between items-end mb-1">
                    <label className={labelClass}>Link de Google Maps (Ubicación)</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetecting}
                      className="text-xs font-bold text-[#B95221] hover:text-[#1E3D51] flex items-center gap-1 mb-1 transition-colors px-2 py-1 rounded-lg hover:bg-orange-50"
                    >
                      {isDetecting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Detectando...
                        </>
                      ) : (
                        <>
                          <MapPin size={14} />
                          Detectar mi ubicación actual
                        </>
                      )}
                    </button>
                  </div>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Map size={18} /></div>
                    <input 
                      type="url" 
                      name="ubicacion_url" 
                      value={formData.ubicacion_url} 
                      onChange={handleChange} 
                      placeholder="https://maps.app.goo.gl/..." 
                      className={inputClass} 
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* SECCIÓN 3: REDES SOCIALES (Opcionales) */}
            <div>
              <h3 className="text-lg font-extrabold text-[#B95221] border-b border-gray-200 pb-2 mb-4">Redes Sociales (Enlaces)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Facebook</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-blue-600"><LinkIcon size={16} /></div>
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Instagram</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-pink-600"><LinkIcon size={16} /></div>
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">LinkedIn</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-blue-800"><LinkIcon size={16} /></div>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">TikTok</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-black"><LinkIcon size={16} /></div>
                    <input type="url" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="https://tiktok.com/@..." className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Página Web</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-600"><Globe size={16} /></div>
                    <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://miweb.com" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">GitHub (Programadores)</label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-800"><LinkIcon size={16} /></div>
                    <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="https://github.com/..." className={inputClass} />
                  </div>
                </div>

              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full font-bold py-4 px-6 rounded-xl text-white transition-all shadow-md flex justify-center items-center gap-2 mt-8 
                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F67927] hover:bg-[#e06516] hover:-translate-y-1'}`}
            >
              {isSubmitting && <Loader2 size={20} className="animate-spin" />}
              {isSubmitting ? 'Guardando Perfil...' : 'Enviar para Revisión'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}