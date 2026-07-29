// Archivo: src/components/PhoneInputWithCountry.jsx
import { useState } from 'react';
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
  const [prevValue, setPrevValue] = useState(value);
  const [prevCountryName, setPrevCountryName] = useState(countryName);

  if (value !== prevValue || countryName !== prevCountryName) {
    setPrevValue(value);
    setPrevCountryName(countryName);
    setPhoneState(getInitialPhoneState(value));
  }

  const handleNumberChange = (e) => {
    // Solo permitir números y máximo la longitud del país configurado
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const cleanVal = rawVal.substring(0, country.length);
    
    const currentCode = phoneState.code;
    const fullNumber = cleanVal ? `${currentCode}${cleanVal}` : '';
    
    setPhoneState(prev => ({ ...prev, number: cleanVal }));
    onChange(fullNumber);
  };

  // Clases premium según el tema
  const selectBg = isDarkTheme 
    ? 'bg-[#32698F] text-white border-[#32698F]' 
    : 'bg-gray-100 text-[#1A535C] border-gray-200';
    
  const inputBg = isDarkTheme 
    ? 'bg-[#32698F] text-white border-[#32698F] placeholder-[#E6E2DF]/50 focus:border-[#F9842C]' 
    : 'bg-transparent text-[#1A535C] placeholder-gray-400 focus:border-[#F9842C]';

  return (
    <div className={`flex items-stretch rounded-xl border transition-all overflow-hidden ${
      isDarkTheme 
        ? 'border-[#32698F] focus-within:border-[#F9842C] focus-within:ring-1 focus-within:ring-[#F9842C]' 
        : 'border-gray-200 focus-within:border-[#F9842C] focus-within:ring-1 focus-within:ring-[#F9842C]'
    } ${className}`}>
      
      {/* Selector de país dinámico */}
      <div 
        className={`flex items-center gap-1.5 px-3 select-none border-r ${
          isDarkTheme ? 'border-[#1A535C]/30' : 'border-gray-200'
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
