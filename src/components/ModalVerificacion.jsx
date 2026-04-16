import { useState, useEffect } from 'react';
import { Mail, CheckCircle2, Loader2, X, MessageCircle, AlertCircle } from 'lucide-react';

export default function ModalVerificacion({ isOpen, onClose, onSuccess, userName }) {
  const [step, setStep] = useState(1); // 1 = Info/Send, 2 = Enter Code
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCode('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('spingamma_token');
      const res = await fetch(`${API_URL}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'No se pudo enviar el código.');
      
      if (data.message === "Ya estás verificado.") {
        const userObj = JSON.parse(localStorage.getItem('spingamma_user') || '{}');
        userObj.is_verified = true;
        localStorage.setItem('spingamma_user', JSON.stringify(userObj));
        onSuccess();
        return;
      }
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('spingamma_token');
      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Código incorrecto o expirado.');
      
      // Verification successful
      const userObj = JSON.parse(localStorage.getItem('spingamma_user') || '{}');
      userObj.is_verified = true;
      localStorage.setItem('spingamma_user', JSON.stringify(userObj));
      onSuccess();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackWhatsapp = () => {
    const spingammaWhatsapp = "59164016676";
    const mensaje = `Hola SpinGamma, quiero verificar mi cuenta manualmente de forma opcional. Mi nombre es ${userName || 'un usuario'}.`;
    const url = `https://wa.me/${spingammaWhatsapp}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#1E3D51]/80 backdrop-blur-sm transition-opacity">
      <div className="bg-white border rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-in fade-in zoom-in duration-300">
        
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors" disabled={isLoading}>
          <X size={20} />
        </button>

        {step === 1 ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-50 border-2 border-[#B95221]">
              <CheckCircle2 size={36} className="text-[#B95221]" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3 text-[#1E3D51]">Verifica tu Cuenta</h2>
            <p className="text-sm text-gray-500 mb-6">
              Para garantizar la seguridad de nuestra comunidad y permitirte crear negocios o dejar reseñas, necesitamos validar tu correo electrónico.
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in mb-4 flex items-center gap-2 text-left">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleSendCode}
              disabled={isLoading}
              className={`w-full font-bold py-4 px-4 rounded-xl text-white transition-all shadow-md flex justify-center items-center gap-2 mb-4 
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F67927] hover:bg-[#e06516] hover:-translate-y-0.5'}`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Mail size={20} />}
              {isLoading ? 'Enviando...' : 'Enviar código a mi correo'}
            </button>

            <div className="flex items-center my-5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-4 text-xs font-semibold text-gray-400">¿Problemas con el correo?</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
              onClick={handleFallbackWhatsapp}
              type="button"
              className="w-full font-bold py-3 px-4 rounded-xl text-[#1E3D51] transition-all border-2 border-gray-200 hover:border-[#1E3D51] hover:bg-gray-50 flex justify-center items-center gap-2"
            >
              <MessageCircle size={20} className="text-green-600" />
              Opción opcional: Verifícame por WhatsApp
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-orange-50 border-2 border-[#B95221]">
              <Mail size={36} className="text-[#B95221]" />
            </div>
            <h2 className="text-2xl font-extrabold mb-3 text-[#1E3D51]">Ingresa el Código</h2>
            <p className="text-sm text-gray-500 mb-6">
              Te hemos enviado un código de 6 dígitos a tu correo. Por favor ingresalo a continuación:
            </p>

            {error && (
               <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium animate-in fade-in mb-4 flex items-center gap-2 text-left">
                 <AlertCircle size={18} className="flex-shrink-0" />
                 <span>{error}</span>
               </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength="6"
                  inputMode="numeric"
                  placeholder="Ej. 123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-extrabold bg-gray-50 border-gray-200 focus:border-[#B95221] focus:ring-[#B95221] px-4 py-4 rounded-xl outline-none"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoading || code.length !== 6}
                className={`w-full font-bold py-4 px-4 rounded-xl text-white transition-all shadow-md mt-4 flex justify-center items-center gap-2 
                  ${(isLoading || code.length !== 6) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F67927] hover:bg-[#e06516] hover:-translate-y-0.5'}`}
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Verificando...' : 'Verificar Cuenta'}
              </button>
            </form>

            <p className="text-center text-sm mt-5 text-gray-500">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-bold underline underline-offset-2 transition-colors text-[#B95221] hover:text-[#e06516]"
              >
                Reenviar código
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
