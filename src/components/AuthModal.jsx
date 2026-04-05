// Archivo: src/components/AuthModal.jsx
import { useState, useEffect, useCallback } from 'react';
import { UserPlus, LogIn, X, Loader2, Eye, EyeOff, Phone } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para el flujo de completar celular (Google Auth Híbrido)
  const [isCompletingPhone, setIsCompletingPhone] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const [tempUserData, setTempUserData] = useState(null);

  const [formData, setFormData] = useState({ nombre: '', celular: '', password: '' });
  const [errores, setErrores] = useState({ nombre: '', celular: '', password: '' });

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (isOpen) {
      setFormData({ nombre: '', celular: '', password: '' });
      setErrores({ nombre: '', celular: '', password: '' });
      setApiError('');
      setIsLoginMode(true);
      setShowPassword(false);
      setIsCompletingPhone(false);
      setTempToken(null);
      setTempUserData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ----- INICIO SESIÓN CON GOOGLE (ID Token / credential JWT) -----
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ google_token: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error en validación con Google.');
      
      // El servidor siempre nos da un access_token
      localStorage.setItem('spingamma_token', data.access_token);
      
      // Regla de Negocio: Si no tiene celular, forzamos completarlo
      if (!data.celular) {
        setTempToken(data.access_token);
        setTempUserData({ nombre: data.nombre });
        setIsCompletingPhone(true);
      } else {
        // Ya tenía cuenta completa
        localStorage.setItem('spingamma_user', JSON.stringify({ nombre: data.nombre, celular: data.celular }));
        onSuccess({ nombre: data.nombre, celular: data.celular });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validar = (soloCelular = false) => {
    let valid = true;
    const nuevosErrores = { nombre: '', celular: '', password: '' };

    const regexCelular = /^[0-9]{8}$/;
    if (!regexCelular.test(formData.celular.trim())) {
      nuevosErrores.celular = 'El celular debe tener exactamente 8 dígitos numéricos.';
      valid = false;
    }

    if (!soloCelular) {
      if (!isLoginMode) {
        const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s+[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
        if (!regexNombre.test(formData.nombre.trim())) {
          nuevosErrores.nombre = 'Ingresa al menos tu nombre y un apellido (solo letras).';
          valid = false;
        }
      }
  
      if (formData.password.trim().length < 4) {
        nuevosErrores.password = 'La contraseña debe tener al menos 4 caracteres.';
        valid = false;
      }
    }

    setErrores(nuevosErrores);
    return valid;
  };

  const handleSubmitNormal = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validar(false)) return;
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
      if (!response.ok) throw new Error(data.detail || 'Ocurrió un error inesperado.');

      // Login/Register exitoso, guardar token si lo devuelve (Login normal lo devuelve, Registro depende de tu API)
      if (data.access_token) {
        localStorage.setItem('spingamma_token', data.access_token);
      }
      
      onSuccess({ nombre: data.nombre, celular: data.celular });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletarCelular = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validar(true)) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/completar-celular`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ phone: formData.celular })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al completar tu celular.');

      // Exitoso. Finalizar flujo de Google.
      const celularGuardado = formData.celular; // O si el backend lo devuelve, usarlo = data.phone
      localStorage.setItem('spingamma_user', JSON.stringify({ nombre: tempUserData.nombre, celular: celularGuardado }));
      onSuccess({ nombre: tempUserData.nombre, celular: celularGuardado });
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
  const eyeIconColor = isDarkTheme ? 'text-[#E6E2DF]/60 hover:text-[#F67927]' : 'text-gray-400 hover:text-[#B95221]';

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${bgOverlay} backdrop-blur-sm transition-opacity`}>
      <div className={`${bgModal} border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300`}>
        
        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${btnCloseBg}`} disabled={isLoading}>
          <X size={20} />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-inner ${iconWrapBg}`}>
            {isCompletingPhone ? (
               <Phone size={32} className={iconColor} />
            ) : isLoginMode ? (
               <LogIn size={32} className={iconColor} /> 
            ) : (
               <UserPlus size={32} className={iconColor} />
            )}
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${textTitle}`}>
            {isCompletingPhone 
              ? 'Falta un paso más' 
              : isLoginMode ? 'Inicia Sesión' : 'Crea tu Cuenta'}
          </h2>
          <p className={`text-sm px-2 ${textSub}`}>
            {isCompletingPhone 
              ? `Hola, vincula tu número de WhatsApp para activar la opción de calificación en SpinJob.`
              : isLoginMode ? 'Ingresa para guardar tus perfiles y dejar reseñas.' : 'Únete gratis y de forma segura a SpinJob en segundos.'}
          </p>
        </div>

        {/* Formulario Completa tu Celular */}
        {isCompletingPhone ? (
           <form onSubmit={handleCompletarCelular} className="space-y-4">
             <div>
               <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Celular / WhatsApp (OBLIGATORIO)</label>
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
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Completar Registro'}
             </button>
           </form>
        ) : (
          /* Formulario Normal (Auth) */
          <>


            <form onSubmit={handleSubmitNormal} className="space-y-4">
              
              {/* BOTÓN GOOGLE - Botón custom en español, usa GSI API directamente */}
              <button
                type="button"
                onClick={() => {
                  if (!window.google?.accounts?.id) {
                    setApiError('Google Sign-In no está disponible. Intenta recargar la página.');
                    return;
                  }
                  setApiError('');
                  window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: (response) => handleGoogleSuccess({ credential: response.credential }),
                  });
                  window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                      // Si One Tap no se puede mostrar, usar popup como fallback
                      window.google.accounts.id.renderButton(
                        document.createElement('div'),
                        { type: 'standard' }
                      );
                      // Fallback: abrir popup OAuth manualmente
                      const popup = window.open(
                        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=id_token&scope=openid%20email%20profile&nonce=${Date.now()}`,
                        'google-login',
                        'width=500,height=600'
                      );
                      if (!popup) setApiError('Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e intenta de nuevo.');
                    }
                  });
                }}
                disabled={isLoading}
                className={`w-full font-bold py-3 px-4 rounded-xl transition-all border border-gray-300 shadow-sm flex justify-center items-center gap-3 bg-white text-gray-700 hover:bg-gray-50 active:scale-[0.98] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Iniciar sesión con Google
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300/50"></div>
                <span className={`mx-4 text-xs font-semibold ${textSub}`}>O usando tu número</span>
                <div className="flex-grow border-t border-gray-300/50"></div>
              </div>

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
                <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Contraseña</label>
                <div className="relative">
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Mínimo 4 caracteres" 
                    value={formData.password} 
                    onChange={(e) => {
                      setFormData({...formData, password: e.target.value});
                      if(errores.password) setErrores({...errores, password: ''});
                    }} 
                    className={`w-full pl-4 pr-12 py-3 rounded-xl outline-none focus:ring-1 transition-all tracking-wider ${inputBg} ${errores.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
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
                {isLoading && !isCompletingPhone && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Procesando...' : (isLoginMode ? 'Ingresar a mi cuenta' : 'Crear mi cuenta gratis')}
              </button>
            </form>

            {/* Link para cambiar entre Login y Registro */}
            <p className={`text-center text-sm mt-5 ${textSub}`}>
              {isLoginMode ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(false); setApiError(''); }}
                    className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}
                  >
                    Crear tu cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(true); setApiError(''); }}
                    className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </p>
          </>
        )}

      </div>
    </div>
  );
}