// Archivo: src/CrearNegocio.jsx
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Building, MapPin, AlignLeft, Phone, ArrowLeft,
  Loader2, Clock, Globe, Link as LinkIcon, User, Map, Image as ImageIcon, X, Check
} from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImgFile } from '../../utils/cropImage';
import ModalVerificacion from '../../components/ModalVerificacion';

export default function CrearNegocio() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '', title: '', category: '', subcategory: '', country: 'Bolivia', state: '', neighborhood: '', description: '',
    genero: '', phone: '', whatsapp: '', facebook: '', instagram: '',
    linkedin: '', website: '', tiktok: '', github: '', ubicacion_url: ''
  });

  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageFile, setCroppedImageFile] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropImage = async () => {
    try {
      const file = await getCroppedImgFile(imageSrc, croppedAreaPixels);
      setCroppedImageFile(file);
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
      setError("Error al recortar la imagen");
    }
  };

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
    
    // VERIFICACIÓN DE USUARIO (Nuevo Flujo EMAIL)
    const userObj = JSON.parse(localStorage.getItem('spingamma_user') || '{}');
    let isVerifiedStrict = userObj?.is_verified === true || userObj?.is_verified === "true" || userObj?.is_verified === 1;
    
    if (!isVerifiedStrict) {
      // Re-verificar con el backend por seguridad
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const verifyRes = await fetch(`${API_URL}/usuarios/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.is_verified === true || verifyData.is_verified === "true" || verifyData.is_verified === 1) {
            userObj.is_verified = true;
            localStorage.setItem('spingamma_user', JSON.stringify(userObj));
            isVerifiedStrict = true; 
          }
        }
      } catch (err) {
        console.error("Error consultando estado de verificación al backend", err);
      }
      
      if (!isVerifiedStrict) {
        setShowVerificationModal(true);
        setIsSubmitting(false);
        return;
      }
    }

    // Limpiar campos vacíos para que no mande strings vacíos si el backend espera null
    const payload = { ...formData };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') payload[key] = null;
    });

    // La imagen ya no es obligatoria
    /*
    if (!croppedImageFile) {
      setError("Es obligatorio subir y recortar una imagen de perfil.");
      setIsSubmitting(false);
      return;
    }
    */

    const formDataObj = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null) {
        formDataObj.append(key, payload[key]);
      }
    });
    if (croppedImageFile) {
      formDataObj.append("image", croppedImageFile);
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${API_URL}/businesses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
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
            <p className="text-[#E6E2DF]">Completa tu perfil para destacar en Tarjetoso.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* SECCIÓN 1: INFORMACIÓN BÁSICA E IMAGEN */}
            <div>
              <h3 className="text-lg font-extrabold text-[#B95221] border-b border-gray-200 pb-2 mb-4">Información Principal</h3>

              <div className="mb-6">
                <label className={labelClass}>Foto de Perfil / Negocio (Opcional)</label>
                <div className={`${wrapperClass} flex-col sm:flex-row items-center justify-between p-4 bg-white border-dashed`}>
                  <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    {croppedImageFile ? (
                      <img src={URL.createObjectURL(croppedImageFile)} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-[#1E3D51]" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                        <ImageIcon size={30} className="text-gray-400" />
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      <p className="font-bold text-[#1E3D51]">Sube una foto clara</p>
                      <p>JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  <div>
                    <label className="cursor-pointer bg-[#32698F] hover:bg-[#1E3D51] text-white px-5 py-2.5 rounded-xl font-medium transition-colors inline-block text-sm">
                      Elegir Imagen
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className={labelClass}>Nombre / Marca <span className="text-red-500">*</span></label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><Briefcase size={18} /></div>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="Ej. Dra. Ana López" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Especialidad / Título <span className="text-red-500">*</span></label>
                  <div className={wrapperClass}>
                    <div className="pl-4 flex items-center text-gray-400"><AlignLeft size={18} /></div>
                    <input required name="title" value={formData.title} onChange={handleChange} placeholder="Ej. Odontóloga Especialista" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Categoría <span className="text-red-500">*</span></label>
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
                  <label className={labelClass}>País <span className="text-red-500">*</span></label>
                  <div className={`${wrapperClass} opacity-70`}>
                    <div className="pl-4 flex items-center text-gray-400"><MapPin size={18} /></div>
                    <input name="country" value={formData.country} readOnly disabled className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Ciudad / Departamento <span className="text-red-500">*</span></label>
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
                  <label className={labelClass}>Zona / Barrio <span className="text-red-500">*</span></label>
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
                <label className={labelClass}>Descripción de Servicios <span className="text-red-500">*</span></label>
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

      {/* Modal de Easy Crop */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[600px]">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-[#1E3D51] text-lg">Recortar Imagen</h3>
              <button onClick={() => setShowCropModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <X size={24} />
              </button>
            </div>

            <div className="relative flex-1 bg-gray-900 w-full">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            <div className="p-5 bg-white space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Zoom</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F67927]"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCropImage}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#F67927] hover:bg-[#e06516] transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Verificación por Email */}
      <ModalVerificacion 
        isOpen={showVerificationModal} 
        onClose={() => setShowVerificationModal(false)} 
        onSuccess={() => {
          setShowVerificationModal(false);
          // Auto-continuar si desea, pero por seguridad y UX dejamos que presione enviar de nuevo
          setError('¡Tu cuenta ha sido verificada! Ahora presiona Enviar nuevamente.');
          setTimeout(() => setError(''), 5000);
        }}
        userName={JSON.parse(localStorage.getItem('spingamma_user') || '{}')?.nombre}
      />

    </div>
  );
}