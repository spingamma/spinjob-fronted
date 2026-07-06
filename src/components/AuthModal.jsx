import { useEffect, useState } from 'react';
import { UserPlus, X, Loader2, Phone, MessageCircleQuestion, ChevronDown } from 'lucide-react';
import PhoneInputWithCountry from './PhoneInputWithCountry';
import useAuthLogic from '../hooks/useAuthLogic';
import ModalVerificacion from './ModalVerificacion';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  const [showVerify, setShowVerify] = useState(false);
  const [userDataForVerify, setUserDataForVerify] = useState(null);
  const [countriesList, setCountriesList] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    async function loadCountries() {
      try {
        const res = await fetch(`${API_URL}/countries/`);
        if (res.ok) {
          const data = await res.json();
          setCountriesList(data);
        }
      } catch (err) {
        console.error("Error fetching countries in AuthModal:", err);
      }
    }
    loadCountries();
  }, [isOpen]);

  const handleRequireVerification = (userData) => {
    setUserDataForVerify(userData);
    setShowVerify(true);
  };
  
  const {
    isCompletingPhone,
    isLoading, apiError, supportWhatsApp,
    formData, setFormData, errores, setErrores,
    handleGoogleSuccess, handleCompletarCelular
  } = useAuthLogic({ isOpen, onSuccess, onRequireVerification: handleRequireVerification });

  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // ── Render Google Button ──
  useEffect(() => {
    if (!isOpen || isCompletingPhone) return;

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
          text: 'continue_with',
          locale: 'es',
          width: 280,
        });
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [isOpen, isCompletingPhone, isDarkTheme, GOOGLE_CLIENT_ID]);

  if (!isOpen) return null;

  if (showVerify) {
    return (
      <ModalVerificacion 
        isOpen={true} 
        onClose={() => {
          setShowVerify(false);
          onSuccess(userDataForVerify); // Continuar con la sesión no verificada si cierran
        }} 
        onSuccess={() => {
          setShowVerify(false);
          const updatedUser = { ...userDataForVerify, is_verified: true };
          onSuccess(updatedUser); // Continuar con sesión verificada
        }}
        userName={userDataForVerify?.nombre}
      />
    );
  }

  // ══════════════════════════════════════════
  // Theme tokens
  // ══════════════════════════════════════════
  const bgOverlay = isDarkTheme ? 'bg-[#152a38]/90' : 'bg-[#1A535C]/80';
  const bgModal = isDarkTheme ? 'bg-[#1A535C] border-[#32698F]' : 'bg-white border-gray-200';
  const textTitle = isDarkTheme ? 'text-white' : 'text-[#1A535C]';
  const textSub = isDarkTheme ? 'text-[#E6E2DF]' : 'text-[#757778]';
  const btnCloseBg = isDarkTheme ? 'bg-[#32698F] text-[#E6E2DF] hover:bg-[#F9842C] hover:text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-[#1A535C]';
  const iconWrapBg = isDarkTheme ? 'bg-[#32698F] border-[#F9842C]' : 'bg-orange-50 border-[#F9842C]';
  const iconColor = isDarkTheme ? 'text-[#F9842C]' : 'text-[#F9842C]';
  const labelColor = isDarkTheme ? 'text-[#F9842C]' : 'text-[#F9842C]';
  const btnSubmitBg = isDarkTheme ? 'bg-[#F9842C] hover:bg-[#e06516] text-white' : 'bg-[#F9842C] hover:bg-[#e06516] text-white';

  // ── Error alert ──
  const renderError = () => apiError && (
    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in text-center">
      {apiError}
    </div>
  );

  const submitBtnClass = `w-full font-bold py-4 px-4 rounded-xl transition-all shadow-md mt-4 flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:scale-[0.98]'} ${btnSubmitBg}`;

  const defaultWhatsApp = '59164016676'; // Fallback
  const contactNumber = supportWhatsApp || defaultWhatsApp;
  const whatsappLink = `https://wa.me/${contactNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hola tarjetoso tengo problemas ingresando a mi cuenta')}`;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════
  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${bgOverlay} backdrop-blur-sm transition-opacity`}>
      <div className={`${bgModal} border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300`}>
        
        <button data-testid="auth-close-btn" onClick={onClose} className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${btnCloseBg}`} disabled={isLoading}>
          <X size={20} />
        </button>

        {/* ── Header ── */}
        <div className="text-center mb-6 mt-2">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-inner ${iconWrapBg}`}>
            {isCompletingPhone ? <Phone size={32} className={iconColor} /> : <UserPlus size={32} className={iconColor} />}
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${textTitle}`}>
            {isCompletingPhone ? 'Falta un paso más' : 'Ingresa a Tarjetoso'}
          </h2>
          <p className={`text-sm px-2 ${textSub}`}>
            {isCompletingPhone 
              ? 'Hola, vincula tu número de WhatsApp para activar la opción de calificación en Tarjetoso.' 
              : 'Inicia sesión o crea tu cuenta gratis de forma segura y en segundos.'}
          </p>
        </div>

        {/* VISTA: Completar Celular (Google) */}
        {isCompletingPhone ? (
           <form onSubmit={handleCompletarCelular} className="space-y-4">
             <div>
               <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>
                 Celular / WhatsApp <span className="text-red-500">*</span>
               </label>
               <PhoneInputWithCountry
                 id="celular"
                 value={formData.celular}
                 onChange={(val) => {
                   setFormData({...formData, celular: val});
                   if (errores.celular) setErrores({...errores, celular: ''});
                 }}
                 disabled={isLoading}
                 isDarkTheme={isDarkTheme}
                 className={errores.celular ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500' : ''}
               />
               {errores.celular && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.celular}</p>}
             </div>

             <div>
               <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>
                 País de Residencia <span className="text-red-500">*</span>
               </label>
               <div className="relative">
                 <select
                   value={formData.country || ''}
                   onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                   disabled={isLoading}
                   className={`w-full text-sm rounded-xl py-3 pl-3 pr-10 border outline-none cursor-pointer appearance-none focus:ring-1 transition-all ${
                     isDarkTheme 
                       ? 'bg-[#32698F] border-[#32698F] text-white focus:border-[#F9842C] focus:ring-[#F9842C]/30' 
                       : 'bg-gray-100 border-gray-200 text-[#1A535C] focus:border-[#F9842C] focus:ring-[#F9842C]/30'
                   }`}
                   required
                 >
                   <option value="" disabled>Selecciona tu país...</option>
                   {countriesList.map(c => (
                     <option key={c.country} value={c.country} className={isDarkTheme ? 'bg-[#1A535C]' : 'bg-white'}>
                       {c.country}
                     </option>
                   ))}
                 </select>
                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                   <ChevronDown size={16} className={isDarkTheme ? 'text-white/60' : 'text-[#1A535C]/60'} />
                 </div>
               </div>
             </div>
             {renderError()}
             <button data-testid="auth-submit-btn-phone" type="submit" disabled={isLoading} className={submitBtnClass}>
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Completar Registro'}
             </button>
           </form>

        /* VISTA: Google Login */
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center w-full min-h-[44px]">
              <div id="googleSignInContainer" className={isLoading ? 'opacity-50 pointer-events-none w-full flex justify-center' : 'w-full flex justify-center'}></div>
            </div>

            {renderError()}

            <div className="text-center mt-6">
              <a 
                href={whatsappLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${isDarkTheme ? 'text-[#E6E2DF]/70 hover:text-[#F9842C]' : 'text-gray-500 hover:text-[#F9842C]'}`}
              >
                <MessageCircleQuestion size={18} />
                Necesito ayuda
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}