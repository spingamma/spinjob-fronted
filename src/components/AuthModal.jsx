// Archivo: src/components/AuthModal.jsx
import { useEffect } from 'react';
import { UserPlus, LogIn, X, Loader2, Eye, EyeOff, Phone, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import PhoneInputWithCountry from './PhoneInputWithCountry';
import useAuthLogic from '../hooks/useAuthLogic';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  const {
    isLoginMode, isForgotMode, isChangingPassword, isCompletingPhone,
    isLoading, apiError, apiSuccess, showPassword, showNewPassword,
    setShowPassword, setShowNewPassword,
    formData, setFormData, errores, setErrores,
    handleGoogleSuccess, handleSubmitNormal, handleForgotPassword,
    handleChangePassword, handleCompletarCelular,
    switchToForgot, switchFromForgot, switchMode,
  } = useAuthLogic({ isOpen, onSuccess });

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // ── Render Google Button ──
  useEffect(() => {
    if (!isOpen || isForgotMode || isChangingPassword || isCompletingPhone) return;

    const timeoutId = setTimeout(() => {
      const btnContainer = document.getElementById('googleSignInContainer');
      if (btnContainer && window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleGoogleSuccess({ credential: response.credential }),
          ux_mode: 'popup',
        });
        
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          theme: isDarkTheme ? 'filled_black' : 'outline',
          size: 'large',
          type: 'standard',
          text: isLoginMode ? 'signin_with' : 'signup_with',
          locale: 'es',
        });
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [isOpen, isLoginMode, isForgotMode, isChangingPassword, isCompletingPhone, isDarkTheme, GOOGLE_CLIENT_ID]);

  if (!isOpen) return null;

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

  // ── Header info ──
  const getHeaderInfo = () => {
    if (isCompletingPhone) return { icon: <Phone size={32} className={iconColor} />, title: 'Falta un paso más', subtitle: 'Hola, vincula tu número de WhatsApp para activar la opción de calificación en Tarjetoso.' };
    if (isChangingPassword) return { icon: <ShieldCheck size={32} className={iconColor} />, title: 'Crea tu Nueva Contraseña', subtitle: 'Tu contraseña temporal fue verificada. Por seguridad, elige una nueva contraseña permanente.' };
    if (isForgotMode) return { icon: <KeyRound size={32} className={iconColor} />, title: 'Recuperar Contraseña', subtitle: 'Ingresa el correo electrónico con el que te registraste y te enviaremos una contraseña temporal.' };
    if (isLoginMode) return { icon: <LogIn size={32} className={iconColor} />, title: 'Inicia Sesión', subtitle: 'Ingresa para guardar tus perfiles y dejar reseñas.' };
    return { icon: <UserPlus size={32} className={iconColor} />, title: 'Crea tu Cuenta', subtitle: 'Únete gratis y de forma segura a Tarjetoso en segundos.' };
  };

  const { icon, title, subtitle } = getHeaderInfo();

  // ── Input helper ──
  const renderInput = (field, label, type, placeholder, options = {}) => {
    const { required = true, inputMode, isPassword = false } = options;
    const showEye = isPassword;
    const currentShowState = field === 'newPassword' || field === 'confirmPassword' ? showNewPassword : showPassword;
    const toggleShow = () => {
      if (field === 'newPassword' || field === 'confirmPassword') setShowNewPassword(!showNewPassword);
      else setShowPassword(!showPassword);
    };

    const isCelular = field === 'celular';

    return (
      <div>
        <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>
          {label} {required && <span className={requiredStar}>*</span>}
        </label>
        {isCelular ? (
          <PhoneInputWithCountry
            id={field}
            value={formData[field]}
            onChange={(val) => {
              setFormData({...formData, [field]: val});
              if (errores[field]) setErrores({...errores, [field]: ''});
            }}
            disabled={isLoading}
            isDarkTheme={isDarkTheme}
            className={errores[field] ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : ''}
          />
        ) : (
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
        )}
        {errores[field] && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores[field]}</p>}
      </div>
    );
  };

  // ── Error / Success alerts ──
  const renderError = () => apiError && (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in">
      {apiError}
    </div>
  );

  const renderSuccess = () => apiSuccess && (
    <div className={`${isDarkTheme ? 'bg-[#32698F]/50 border-[#F67927]/40 text-[#E6E2DF]' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in`}>
      <div className="flex items-start gap-2">
        <Mail size={16} className="mt-0.5 flex-shrink-0" />
        <span>{apiSuccess}</span>
      </div>
    </div>
  );

  const submitBtnClass = `w-full font-bold py-4 px-4 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98]'} ${btnSubmitBg}`;

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

        {/* VISTA: Completar Celular (Google) */}
        {isCompletingPhone ? (
           <form onSubmit={handleCompletarCelular} className="space-y-4">
             {renderInput('celular', 'Celular / WhatsApp (OBLIGATORIO)', 'tel', 'Ej. 71234567', { inputMode: 'numeric' })}
             {renderError()}
             <button type="submit" disabled={isLoading} className={submitBtnClass}>
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Completar Registro'}
             </button>
           </form>

        /* VISTA: Cambiar Contraseña (forzado) */
        ) : isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {renderInput('newPassword', 'Nueva Contraseña', 'password', 'Mínimo 4 caracteres', { isPassword: true })}
            {renderInput('confirmPassword', 'Confirmar Contraseña', 'password', 'Repite tu nueva contraseña', { isPassword: true })}
            {renderError()}
            <button type="submit" disabled={isLoading} className={submitBtnClass}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Guardar Nueva Contraseña'}
            </button>
          </form>

        /* VISTA: Forgot Password */
        ) : isForgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {renderInput('email', 'Correo Electrónico', 'email', 'tucorreo@ejemplo.com')}
            {renderError()}
            {renderSuccess()}

            <button type="submit" disabled={isLoading || !!apiSuccess} className={`${submitBtnClass} ${apiSuccess ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (apiSuccess ? 'Correo Enviado ✓' : 'Enviar Contraseña Temporal')}
            </button>

            <p className={`text-center text-sm mt-5 ${textSub}`}>
              <button
                type="button"
                onClick={switchFromForgot}
                className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}
              >
                ← Volver al inicio de sesión
              </button>
            </p>
          </form>

        /* VISTA: Login / Register */
        ) : (
          <>
            <form onSubmit={handleSubmitNormal} className="space-y-4">
              <div className="flex justify-center w-full min-h-[44px]">
                <div id="googleSignInContainer" className={isLoading ? 'opacity-50 pointer-events-none' : ''}></div>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300/50"></div>
                <span className={`mx-4 text-xs font-semibold ${textSub}`}>O usando tu número</span>
                <div className="flex-grow border-t border-gray-300/50"></div>
              </div>

              {!isLoginMode && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput('nombre', 'Nombre', 'text', 'Ej. Ana')}
                    {renderInput('apellidos', 'Apellidos', 'text', 'Ej. Pérez')}
                  </div>
                  {renderInput('email', 'Correo Electrónico', 'email', 'tucorreo@ejemplo.com')}
                </>
              )}

              {renderInput('celular', 'Celular / WhatsApp', 'tel', 'Ej. 71234567', { inputMode: 'numeric' })}
              {renderInput('password', 'Contraseña', 'password', 'Mínimo 4 caracteres', { isPassword: true })}

              {isLoginMode && (
                <div className="text-center -mt-1">
                  <button
                    type="button"
                    onClick={switchToForgot}
                    className={`text-xs font-semibold transition-colors ${isDarkTheme ? 'text-[#E6E2DF]/70 hover:text-[#F67927]' : 'text-gray-400 hover:text-[#B95221]'}`}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

              {renderError()}

              <button type="submit" disabled={isLoading} className={submitBtnClass}>
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Procesando...' : (isLoginMode ? 'Ingresar a mi cuenta' : 'Crear mi cuenta gratis')}
              </button>
            </form>

            <p className={`text-center text-sm mt-5 ${textSub}`}>
              {isLoginMode ? (
                <>
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={switchMode} className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}>
                    Crear tu cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" onClick={switchMode} className={`font-bold underline underline-offset-2 transition-colors ${isDarkTheme ? 'text-[#F67927] hover:text-[#ff9a52]' : 'text-[#B95221] hover:text-[#e06516]'}`}>
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