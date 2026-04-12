// Archivo: src/components/AuthModal.jsx
import { useState, useEffect } from 'react';
import { UserPlus, LogIn, X, Loader2, Eye, EyeOff, Phone, KeyRound, Mail, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  // ── Estados de vista ──
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCompletingPhone, setIsCompletingPhone] = useState(false);

  // ── Estados auxiliares ──
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // ── Datos temporales (Google flow / change-password flow) ──
  const [tempToken, setTempToken] = useState(null);
  const [tempUserData, setTempUserData] = useState(null);

  // ── Formulario ──
  const [formData, setFormData] = useState({ nombre: '', apellidos: '', celular: '', email: '', password: '', newPassword: '', confirmPassword: '' });
  const [errores, setErrores] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // ── Reset al abrir ──
  useEffect(() => {
    if (isOpen) {
      setFormData({ nombre: '', apellidos: '', celular: '', email: '', password: '', newPassword: '', confirmPassword: '' });
      setErrores({});
      setApiError('');
      setApiSuccess('');
      setIsLoginMode(true);
      setIsForgotMode(false);
      setIsChangingPassword(false);
      setShowPassword(false);
      setShowNewPassword(false);
      setIsCompletingPhone(false);
      setTempToken(null);
      setTempUserData(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ══════════════════════════════════════════
  // Google Auth Handler
  // ══════════════════════════════════════════
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
      
      localStorage.setItem('spingamma_token', data.access_token);
      
      if (!data.celular) {
        setTempToken(data.access_token);
        setTempUserData({ nombre: data.nombre, is_admin: data.is_admin || false });
        setIsCompletingPhone(true);
      } else {
        localStorage.setItem('spingamma_user', JSON.stringify({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false }));
        onSuccess({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // Validación
  // ══════════════════════════════════════════
  const validar = (soloCelular = false) => {
    let valid = true;
    const nuevosErrores = {};

    if (!soloCelular) {
      // ── Forgot mode: solo email ──
      if (isForgotMode) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(formData.email.trim())) {
          nuevosErrores.email = 'Ingresa un correo electrónico válido.';
          valid = false;
        }
        setErrores(nuevosErrores);
        return valid;
      }

      // ── Change-password mode ──
      if (isChangingPassword) {
        if (formData.newPassword.trim().length < 4) {
          nuevosErrores.newPassword = 'La contraseña debe tener al menos 4 caracteres.';
          valid = false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
          valid = false;
        }
        setErrores(nuevosErrores);
        return valid;
      }

      // ── Register fields ──
      if (!isLoginMode) {
        if (formData.nombre.trim().length < 2) {
          nuevosErrores.nombre = 'Ingresa tu nombre.';
          valid = false;
        }
        if (formData.apellidos.trim().length < 2) {
          nuevosErrores.apellidos = 'Ingresa tus apellidos.';
          valid = false;
        }
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(formData.email.trim())) {
          nuevosErrores.email = 'Ingresa un correo electrónico válido.';
          valid = false;
        }
      }
    }

    // ── Celular (register + login + completar phone) ──
    if (!isForgotMode && !isChangingPassword) {
      const regexCelular = /^[0-9]{8}$/;
      if (!regexCelular.test(formData.celular.trim())) {
        nuevosErrores.celular = 'El celular debe tener exactamente 8 dígitos numéricos.';
        valid = false;
      }
    }

    // ── Password (register + login) ──
    if (!soloCelular && !isForgotMode && !isChangingPassword) {
      if (formData.password.trim().length < 4) {
        nuevosErrores.password = 'La contraseña debe tener al menos 4 caracteres.';
        valid = false;
      }
    }

    setErrores(nuevosErrores);
    return valid;
  };

  // ══════════════════════════════════════════
  // Login / Register
  // ══════════════════════════════════════════
  const handleSubmitNormal = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validar(false)) return;
    setIsLoading(true);
    
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const payload = isLoginMode 
      ? { phone: formData.celular, password: formData.password }
      : { 
          name: `${formData.nombre.trim()} ${formData.apellidos.trim()}`, 
          phone: formData.celular, 
          email: formData.email.trim(),
          password: formData.password 
        };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Ocurrió un error inesperado.');

      if (data.access_token) {
        localStorage.setItem('spingamma_token', data.access_token);
      }
      
      // Si must_change_password es true, forzar cambio de contraseña
      if (data.must_change_password) {
        setTempToken(data.access_token);
        setTempUserData({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false });
        setIsChangingPassword(true);
        setIsLoading(false);
        return;
      }
      
      onSuccess({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // Forgot Password
  // ══════════════════════════════════════════
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validar(false)) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim() })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al procesar la solicitud.');

      setApiSuccess(data.message || 'Si el correo está registrado, recibirás una contraseña temporal.');
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // Change Password (forced after temp login)
  // ══════════════════════════════════════════
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!validar(false)) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ new_password: formData.newPassword })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Error al cambiar la contraseña.');

      // Contraseña cambiada exitosamente, completar el login
      localStorage.setItem('spingamma_user', JSON.stringify({ 
        nombre: tempUserData.nombre, 
        celular: tempUserData.celular, 
        is_admin: tempUserData.is_admin 
      }));
      onSuccess({ nombre: tempUserData.nombre, celular: tempUserData.celular, is_admin: tempUserData.is_admin });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // Completar Celular (Google flow)
  // ══════════════════════════════════════════
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

      const celularGuardado = formData.celular; 
      localStorage.setItem('spingamma_user', JSON.stringify({ nombre: tempUserData.nombre, celular: celularGuardado, is_admin: tempUserData.is_admin }));
      onSuccess({ nombre: tempUserData.nombre, celular: celularGuardado, is_admin: tempUserData.is_admin });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ══════════════════════════════════════════
  // Theme tokens
  // ══════════════════════════════════════════
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
  const requiredStar = isDarkTheme ? 'text-[#F67927]' : 'text-red-500';

  // ══════════════════════════════════════════
  // Helper: qué icono y título mostrar
  // ══════════════════════════════════════════
  const getHeaderInfo = () => {
    if (isCompletingPhone) return { icon: <Phone size={32} className={iconColor} />, title: 'Falta un paso más', subtitle: 'Hola, vincula tu número de WhatsApp para activar la opción de calificación en SpinJob.' };
    if (isChangingPassword) return { icon: <ShieldCheck size={32} className={iconColor} />, title: 'Crea tu Nueva Contraseña', subtitle: 'Tu contraseña temporal fue verificada. Por seguridad, elige una nueva contraseña permanente.' };
    if (isForgotMode) return { icon: <KeyRound size={32} className={iconColor} />, title: 'Recuperar Contraseña', subtitle: 'Ingresa el correo electrónico con el que te registraste y te enviaremos una contraseña temporal.' };
    if (isLoginMode) return { icon: <LogIn size={32} className={iconColor} />, title: 'Inicia Sesión', subtitle: 'Ingresa para guardar tus perfiles y dejar reseñas.' };
    return { icon: <UserPlus size={32} className={iconColor} />, title: 'Crea tu Cuenta', subtitle: 'Únete gratis y de forma segura a SpinJob en segundos.' };
  };

  const { icon, title, subtitle } = getHeaderInfo();

  // ══════════════════════════════════════════
  // Input helper
  // ══════════════════════════════════════════
  const renderInput = (field, label, type, placeholder, options = {}) => {
    const { required = true, inputMode, isPassword = false } = options;
    const showEye = isPassword;
    const currentShowState = field === 'newPassword' || field === 'confirmPassword' ? showNewPassword : showPassword;
    const toggleShow = () => {
      if (field === 'newPassword' || field === 'confirmPassword') setShowNewPassword(!showNewPassword);
      else setShowPassword(!showPassword);
    };

    return (
      <div>
        <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>
          {label} {required && <span className={requiredStar}>*</span>}
        </label>
        <div className={showEye ? 'relative' : ''}>
          <input
            required={required}
            type={showEye ? (currentShowState ? 'text' : 'password') : type}
            inputMode={inputMode}
            placeholder={placeholder}
            value={formData[field]}
            onChange={(e) => {
              setFormData({...formData, [field]: e.target.value});
              if (errores[field]) setErrores({...errores, [field]: ''});
            }}
            className={`w-full ${showEye ? 'pl-4 pr-12' : 'px-4'} py-3 rounded-xl outline-none focus:ring-1 transition-all ${showEye ? 'tracking-wider' : ''} ${inputBg} ${errores[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            disabled={isLoading}
          />
          {showEye && (
            <button
              type="button"
              onClick={toggleShow}
              className={`absolute inset-y-0 right-0 pr-3.5 flex items-center active:scale-95 transition-all ${eyeIconColor}`}
              aria-label={currentShowState ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              disabled={isLoading}
            >
              {currentShowState ? <EyeOff size={20} strokeWidth={2} /> : <Eye size={20} strokeWidth={2} />}
            </button>
          )}
        </div>
        {errores[field] && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores[field]}</p>}
      </div>
    );
  };

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${bgOverlay} backdrop-blur-sm transition-opacity`}>
      <div className={`${bgModal} border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300`}>
        
        <button onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${btnCloseBg}`} disabled={isLoading}>
          <X size={20} />
        </button>

        {/* ── Header ── */}
        <div className="text-center mb-6 mt-2">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-inner ${iconWrapBg}`}>
            {icon}
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${textTitle}`}>{title}</h2>
          <p className={`text-sm px-2 ${textSub}`}>{subtitle}</p>
        </div>

        {/* ══════════════════════════════════════ */}
        {/* VISTA: Completar Celular (Google)     */}
        {/* ══════════════════════════════════════ */}
        {isCompletingPhone ? (
           <form onSubmit={handleCompletarCelular} className="space-y-4">
             {renderInput('celular', 'Celular / WhatsApp (OBLIGATORIO)', 'tel', 'Ej. 71234567', { inputMode: 'numeric' })}
             
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

        /* ══════════════════════════════════════ */
        /* VISTA: Cambiar Contraseña (forzado)   */
        /* ══════════════════════════════════════ */
        ) : isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {renderInput('newPassword', 'Nueva Contraseña', 'password', 'Mínimo 4 caracteres', { isPassword: true })}
            {renderInput('confirmPassword', 'Confirmar Contraseña', 'password', 'Repite tu nueva contraseña', { isPassword: true })}
            
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
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Nueva Contraseña'}
            </button>
          </form>

        /* ══════════════════════════════════════ */
        /* VISTA: Forgot Password                 */
        /* ══════════════════════════════════════ */
        ) : isForgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {renderInput('email', 'Correo Electrónico', 'email', 'tucorreo@ejemplo.com')}

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in">
                {apiError}
              </div>
            )}

            {apiSuccess && (
              <div className={`${isDarkTheme ? 'bg-[#32698F]/50 border-[#F67927]/40 text-[#E6E2DF]' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in`}>
                <div className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{apiSuccess}</span>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading || !!apiSuccess}
              className={`w-full font-bold py-4 px-4 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2 ${(isLoading || apiSuccess) ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98]'} ${btnSubmitBg}`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (apiSuccess ? 'Correo Enviado ✓' : 'Enviar Contraseña Temporal')}
            </button>

            <p className={`text-center text-sm mt-5 ${textSub}`}>
              <button
                type="button"
                onClick={() => { setIsForgotMode(false); setApiError(''); setApiSuccess(''); setErrores({}); }}
                className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}
              >
                ← Volver al inicio de sesión
              </button>
            </p>
          </form>

        /* ══════════════════════════════════════ */
        /* VISTA: Login / Register                */
        /* ══════════════════════════════════════ */
        ) : (
          <>
            <form onSubmit={handleSubmitNormal} className="space-y-4">
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
                      window.google.accounts.id.renderButton(
                        document.createElement('div'),
                        { type: 'standard' }
                      );
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

              {/* ── Campos de registro ── */}
              {!isLoginMode && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput('nombre', 'Nombre', 'text', 'Ej. Ana')}
                    {renderInput('apellidos', 'Apellidos', 'text', 'Ej. Pérez')}
                  </div>
                  {renderInput('email', 'Correo Electrónico', 'email', 'tucorreo@ejemplo.com')}
                </>
              )}

              {/* ── Celular (login + register) ── */}
              {renderInput('celular', 'Celular / WhatsApp', 'tel', 'Ej. 71234567', { inputMode: 'numeric' })}

              {/* ── Password ── */}
              {renderInput('password', 'Contraseña', 'password', 'Mínimo 4 caracteres', { isPassword: true })}

              {/* ── ¿Olvidaste tu contraseña? (solo en login) ── */}
              {isLoginMode && (
              <div className="text-center -mt-1">
                  <button
                    type="button"
                    onClick={() => { setIsForgotMode(true); setApiError(''); setErrores({}); }}
                    className={`text-xs font-semibold transition-colors ${
                      isDarkTheme
                        ? 'text-[#E6E2DF]/70 hover:text-[#F67927]'
                        : 'text-gray-400 hover:text-[#B95221]'
                    }`}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

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

            <p className={`text-center text-sm mt-5 ${textSub}`}>
              {isLoginMode ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(false); setApiError(''); setErrores({}); }}
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
                    onClick={() => { setIsLoginMode(true); setApiError(''); setErrores({}); }}
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