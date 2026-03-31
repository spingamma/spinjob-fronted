// Archivo: src/components/AuthModal.jsx
import { useState, useEffect } from 'react';
import { UserPlus, LogIn, X, Loader2, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // NUEVO: Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ nombre: '', celular: '', password: '' });
  const [errores, setErrores] = useState({ nombre: '', celular: '', password: '' });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (isOpen) {
      setFormData({ nombre: '', celular: '', password: '' });
      setErrores({ nombre: '', celular: '', password: '' });
      setApiError('');
      setIsLoginMode(false);
      setShowPassword(false); // Resetear visibilidad al abrir
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validar = () => {
    let valid = true;
    const nuevosErrores = { nombre: '', celular: '', password: '' };

    if (!isLoginMode) {
      const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s+[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      if (!regexNombre.test(formData.nombre.trim())) {
        nuevosErrores.nombre = 'Ingresa al menos tu nombre y un apellido (solo letras).';
        valid = false;
      }
    }

    const regexCelular = /^[0-9]{8}$/;
    if (!regexCelular.test(formData.celular.trim())) {
      nuevosErrores.celular = 'El celular debe tener exactamente 8 dígitos numéricos.';
      valid = false;
    }

    if (formData.password.trim().length < 4) {
      nuevosErrores.password = 'La contraseña debe tener al menos 4 caracteres.';
      valid = false;
    }

    setErrores(nuevosErrores);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validar()) return;
    
    setIsLoading(true);
    
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const payload = isLoginMode 
      ? { phone: formData.celular, password: formData.password }
      : { name: formData.nombre, phone: formData.celular, password: formData.password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ocurrió un error inesperado.');
      }

      // Éxito: data devuelve {id, nombre, celular}
      onSuccess({ nombre: data.nombre, celular: data.celular });
      
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clases dinámicas basadas en el tema
  const bgOverlay = isDarkTheme ? 'bg-[#152a38]/90' : 'bg-[#1E3D51]/80';
  const bgModal = isDarkTheme ? 'bg-[#1E3D51] border-[#32698F]' : 'bg-white border-gray-200';
  const textTitle = isDarkTheme ? 'text-white' : 'text-[#1E3D51]';
  const textSub = isDarkTheme ? 'text-[#E6E2DF]' : 'text-gray-500';
  const btnCloseBg = isDarkTheme ? 'bg-[#32698F] text-[#E6E2DF] hover:bg-[#F67927] hover:text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-[#1E3D51]';
  const iconWrapBg = isDarkTheme ? 'bg-[#32698F] border-[#F67927]' : 'bg-orange-50 border-[#B95221]';
  const iconColor = isDarkTheme ? 'text-[#F67927]' : 'text-[#B95221]';
  const labelColor = isDarkTheme ? 'text-[#F67927]' : 'text-[#B95221]';
  const inputBg = isDarkTheme ? 'bg-[#32698F] border-[#32698F] text-white placeholder-[#E6E2DF]/50 focus:border-[#F67927] focus:ring-[#F67927]' : 'bg-gray-50 border-gray-200 text-[#1E3D51] placeholder-gray-400 focus:border-[#B95221] focus:ring-[#B95221]';
  const btnSubmitBg = isDarkTheme ? 'bg-[#F67927] hover:bg-[#e06516] text-white' : 'bg-[#B95221] hover:bg-[#9A4219] text-white';
  
  // NUEVO: Colores para el icono del ojo
  const eyeIconColor = isDarkTheme ? 'text-[#E6E2DF]/60 hover:text-[#F67927]' : 'text-gray-400 hover:text-[#B95221]';

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${bgOverlay} backdrop-blur-sm transition-opacity`}>
      <div className={`${bgModal} border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300`}>
        
        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${btnCloseBg}`} disabled={isLoading}>
          <X size={20} />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-inner ${iconWrapBg}`}>
            {isLoginMode ? <LogIn size={32} className={iconColor} /> : <UserPlus size={32} className={iconColor} />}
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${textTitle}`}>
            {isLoginMode ? 'Inicia Sesión' : 'Crea tu Cuenta'}
          </h2>
          <p className={`text-sm px-2 ${textSub}`}>
            {isLoginMode ? 'Ingresa para guardar tus perfiles y dejar reseñas.' : 'Únete gratis y de forma segura a SpinJob en segundos.'}
          </p>
        </div>

        {/* TABS SELECTOR */}
        <div className="flex bg-gray-100/50 rounded-xl p-1 mb-6 border border-gray-200/50 shadow-inner">
           <button 
              type="button"
              onClick={() => { setIsLoginMode(false); setApiError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLoginMode ? 'bg-white shadow text-[#1E3D51]' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Registro
           </button>
           <button 
              type="button"
              onClick={() => { setIsLoginMode(true); setApiError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLoginMode ? 'bg-white shadow text-[#1E3D51]' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Ingreso
           </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLoginMode && (
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Nombre Completo</label>
              <input 
                required 
                type="text" 
                placeholder="Ej. Ana Pérez" 
                value={formData.nombre} 
                onChange={(e) => {
                  setFormData({...formData, nombre: e.target.value});
                  if(errores.nombre) setErrores({...errores, nombre: ''});
                }} 
                className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-1 transition-all ${inputBg} ${errores.nombre ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
              />
              {errores.nombre && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.nombre}</p>}
            </div>
          )}
          
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Celular / WhatsApp</label>
            <input 
              required 
              type="tel" 
              inputMode="numeric"
              placeholder="Ej. 71234567" 
              value={formData.celular} 
              onChange={(e) => {
                setFormData({...formData, celular: e.target.value});
                if(errores.celular) setErrores({...errores, celular: ''});
              }} 
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-1 transition-all ${inputBg} ${errores.celular ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              disabled={isLoading}
            />
            {errores.celular && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.celular}</p>}
          </div>

          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Contraseña o PIN</label>
            {/* Contenedor relativo para el input y el ojo */}
            <div className="relative">
              <input 
                required 
                // MODIFICADO: El tipo cambia dinámicamente
                type={showPassword ? 'text' : 'password'} 
                placeholder="Mínimo 4 caracteres" 
                value={formData.password} 
                onChange={(e) => {
                  setFormData({...formData, password: e.target.value});
                  if(errores.password) setErrores({...errores, password: ''});
                }} 
                // MODIFICADO: Añadido padding-right (pr-12) para que el texto no choque con el icono
                className={`w-full pl-4 pr-12 py-3 rounded-xl outline-none focus:ring-1 transition-all tracking-wider ${inputBg} ${errores.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isLoading}
              />
              
              {/* NUEVO: Botón del Ojo absolutely positioned */}
              <button
                type="button" // Importante: tipo button para no enviar el form
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center active:scale-95 transition-all ${eyeIconColor}`}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
              </button>
            </div>
            
            {errores.password && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.password}</p>}
          </div>

          {apiError && (
             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in">
               {apiError}
             </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-bold py-4 px-4 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98]'} ${btnSubmitBg}`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Procesando...' : (isLoginMode ? 'Ingresar a mi cuenta' : 'Crear mi cuenta gratis')}
          </button>
        </form>

      </div>
    </div>
  );
}