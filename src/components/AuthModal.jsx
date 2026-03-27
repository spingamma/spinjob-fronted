import { useState, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onSuccess, isDarkTheme = false }) {
  const [formData, setFormData] = useState({ nombre: '', celular: '' });
  const [errores, setErrores] = useState({ nombre: '', celular: '' });

  useEffect(() => {
    if (isOpen) {
      setFormData({ nombre: '', celular: '' });
      setErrores({ nombre: '', celular: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validar = () => {
    let valid = true;
    const nuevosErrores = { nombre: '', celular: '' };

    // Validar nombre (al menos dos palabras separadas por espacio, sin números)
    const regexNombre = /^[A-Za-záéíóúÁÉÍÓÚñÑüÜ]+\s+[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/;
    if (!regexNombre.test(formData.nombre.trim())) {
      nuevosErrores.nombre = 'Ingresa al menos tu nombre y un apellido (solo letras).';
      valid = false;
    }

    // Validar celular (exactamente 8 dígitos, solo números)
    const regexCelular = /^[0-9]{8}$/;
    if (!regexCelular.test(formData.celular.trim())) {
      nuevosErrores.celular = 'El celular debe tener exactamente 8 dígitos numéricos.';
      valid = false;
    }

    setErrores(nuevosErrores);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      onSuccess(formData);
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

  return (
    <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${bgOverlay} backdrop-blur-sm transition-opacity`}>
      <div className={`${bgModal} border rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300`}>
        
        <button 
          onClick={onClose} 
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${btnCloseBg}`}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6 mt-2">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 shadow-inner ${iconWrapBg}`}>
            <UserPlus size={36} className={iconColor} />
          </div>
          <h2 className={`text-2xl font-extrabold mb-2 ${textTitle}`}>Comunidad Segura</h2>
          <p className={`text-sm px-2 ${textSub}`}>Para garantizar valoraciones reales y evitar spam, regístrate gratis en 10 segundos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.nombre}</p>}
          </div>
          
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wide mb-1 ${labelColor}`}>Celular / WhatsApp</label>
            <input 
              required 
              type="tel" 
              placeholder="Ej. 71234567" 
              value={formData.celular} 
              onChange={(e) => {
                setFormData({...formData, celular: e.target.value});
                if(errores.celular) setErrores({...errores, celular: ''});
              }} 
              className={`w-full px-4 py-3 rounded-xl outline-none focus:ring-1 transition-all ${inputBg} ${errores.celular ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errores.celular && <p className="text-red-500 text-xs mt-1.5 font-medium">{errores.celular}</p>}
          </div>

          <button 
            type="submit" 
            className={`w-full font-bold py-4 px-4 rounded-xl transition-all shadow-md hover:-translate-y-0.5 mt-4 ${btnSubmitBg}`}
          >
            Continuar
          </button>
        </form>

      </div>
    </div>
  );
}