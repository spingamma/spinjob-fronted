// Archivo: src/components/PhoneInputWithCountry.jsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRIES, getCountryByName } from '../utils/phone';

export default function PhoneInputWithCountry({ 
  value = '', 
  onChange, 
  placeholder = 'Ej. 71234567', 
  disabled = false, 
  isDarkTheme = false,
  className = '',
  id,
  countryName
}) {
  // Si no se pasa countryName o no se encuentra, tomamos dinámicamente el primer país configurado en COUNTRIES
  const country = getCountryByName(countryName) || Object.values(COUNTRIES)[0];

  // Separar prefijo y número dinámicamente usando la configuración del país obtenido
  const getInitialPhoneState = (val) => {
    if (!val) return { code: country.code, number: '' };
    // Si ya empieza con el código de país (ej: +591)
    if (val.startsWith(country.code)) {
      return { code: country.code, number: val.substring(country.code.length) };
    }
    // Si empieza con el código de país limpio (ej: 591) y tiene longitud de celular válida
    if (val.startsWith(country.cleanCode) && val.length > country.length) {
      return { code: country.code, number: val.substring(country.cleanCode.length) };
    }
    return { code: country.code, number: val };
  };

  const [phoneState, setPhoneState] = useState(() => getInitialPhoneState(value));

  // Sincronizar cuando cambia la prop value o el país externamente
  useEffect(() => {
    setPhoneState(getInitialPhoneState(value));
  }, [value, countryName]);

  const handleNumberChange = (e) => {
    // Solo permitir números y máximo la longitud del país configurado
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const cleanVal = rawVal.substring(0, country.length);
    
    setPhoneState(prev => {
      const newState = { ...prev, number: cleanVal };
      // Notificar al padre con el formato unificado: +[CODIGO][NUMERO]
      const fullNumber = cleanVal ? `${newState.code}${cleanVal}` : '';
      onChange(fullNumber);
      return newState;
    });
  };

  // Clases premium según el tema
  const selectBg = isDarkTheme 
    ? 'bg-[#32698F] text-white border-[#32698F]' 
    : 'bg-gray-100 text-[#1E3D51] border-gray-200';
    
  const inputBg = isDarkTheme 
    ? 'bg-[#32698F] text-white border-[#32698F] placeholder-[#E6E2DF]/50 focus:border-[#F67927]' 
    : 'bg-transparent text-[#1E3D51] placeholder-gray-400 focus:border-[#F67927]';

  return (
    <div className={`flex items-stretch rounded-xl border transition-all overflow-hidden ${
      isDarkTheme 
        ? 'border-[#32698F] focus-within:border-[#F67927] focus-within:ring-1 focus-within:ring-[#F67927]' 
        : 'border-gray-200 focus-within:border-[#F67927] focus-within:ring-1 focus-within:ring-[#F67927]'
    } ${className}`}>
      
      {/* Selector de país dinámico */}
      <div 
        className={`flex items-center gap-1.5 px-3 select-none border-r ${
          isDarkTheme ? 'border-[#1E3D51]/30' : 'border-gray-200'
        } ${selectBg}`}
        title={`${country.flag} (País seleccionado)`}
      >
        <span className="text-base sm:text-lg">{country.flag}</span>
        <span className="text-sm font-bold tracking-wide">{phoneState.code}</span>
        <ChevronDown size={12} className="opacity-50" />
      </div>

      {/* Input de número */}
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={phoneState.number}
        onChange={handleNumberChange}
        disabled={disabled}
        className={`w-full px-3 py-3 outline-none transition-all ${inputBg}`}
      />
    </div>
  );
}
