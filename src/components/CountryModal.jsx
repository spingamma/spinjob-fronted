import React, { useState, useEffect } from 'react';
import { Globe, Check, Loader2, X, ChevronDown } from 'lucide-react';
import { API_URL } from '../config/api';

export default function CountryModal({ isOpen, isDismissable = false, onClose, onSave, initialCountry = '' }) {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);


  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchCountries() {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/countries/`);
        if (!res.ok) throw new Error("Error al obtener la lista de países");
        const data = await res.json();
        
        if (isMounted) {
          setCountries(data);
          
          // Establecer país inicial si no está definido
          if (!selectedCountry && data.length > 0) {
            // Preferir Bolivia si existe, sino el primero
            const boliviaExists = data.find(c => c.country.toLowerCase() === 'bolivia');
            setSelectedCountry(boliviaExists ? boliviaExists.country : data[0].country);
          }
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("No se pudo cargar la lista de países. Por favor, intenta de nuevo.");
          // Fallback en caso de fallo del backend
          setCountries([
            { country: "Bolivia" },
            { country: "Colombia" },
            { country: "Perú" },
            { country: "Argentina" }
          ]);
          setSelectedCountry("Bolivia");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchCountries();
    return () => { isMounted = false; };
  }, [isOpen, API_URL, setCountries, setError, setIsLoading, setSelectedCountry, selectedCountry]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedCountry) return;
    setIsSaving(true);
    try {
      await onSave(selectedCountry);
      if (onClose) onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => {
          if (isDismissable && onClose) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 z-10 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button (only if dismissable) */}
        {isDismissable && onClose && (
          <button 
            data-testid="close-country-modal-btn"
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-20"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        )}

        {/* Decorative Top Accent */}
        <div className="h-3 rounded-t-[2.5rem] bg-gradient-to-r from-[#1A535C] via-[#F9842C] to-[#1A535C]" />

        <div className="p-8 sm:p-10 text-center">
          {/* Header Icon */}
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#1A535C]/10 to-[#F9842C]/10 rounded-3xl flex items-center justify-center text-[#1A535C] mb-6">
            <Globe size={32} className="text-[#1A535C] animate-pulse" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-[#1A535C] mb-2 leading-tight">
            Selecciona tu País
          </h2>
          <p className="text-sm text-[#757778] mb-8 max-w-xs mx-auto">
            Para brindarte una experiencia personalizada y mostrarte los negocios correctos para tu región.
          </p>

          {/* Loading State */}
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center">
              <Loader2 className="animate-spin text-[#F9842C] mb-2" size={32} />
              <span className="text-xs font-bold text-[#1A535C]">Cargando países...</span>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                País de Residencia
              </label>

              {/* Selector de Países Personalizado Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  data-testid="country-dropdown-btn"
                  onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                  className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 text-[#1A535C] font-bold text-sm px-4 py-3.5 rounded-2xl outline-none focus:border-[#F9842C] focus:ring-1 focus:ring-[#F9842C]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[#1A535C]/60" />
                    <span>{selectedCountry || "Selecciona tu país..."}</span>
                  </div>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpenDropdown ? 'rotate-180' : ''}`} />
                </button>

                {isOpenDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsOpenDropdown(false)}
                    />
                    
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 max-h-52 overflow-y-auto py-2 overscroll-contain touch-pan-y animate-in fade-in slide-in-from-top-2 duration-150">
                      {countries.map(c => {
                        const isSelected = selectedCountry === c.country;
                        return (
                          <button
                            key={c.country}
                            type="button"
                            data-testid={`select-country-${c.country.toLowerCase().replace(/\s+/g, '-')}`}
                            onClick={() => {
                              setSelectedCountry(c.country);
                              setIsOpenDropdown(false);
                            }}
                            className={`flex items-center justify-between w-full px-5 py-3 text-left text-sm font-semibold transition-all hover:bg-gray-50 cursor-pointer ${
                              isSelected ? 'text-[#F9842C] bg-[#F9842C]/5 font-bold' : 'text-[#1A535C]'
                            }`}
                          >
                            <span>{c.country}</span>
                            {isSelected && <Check size={14} className="text-[#F9842C]" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="text-xs text-amber-600 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200/50 mt-2">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            data-testid="save-country-btn"
            onClick={handleSave}
            disabled={isLoading || isSaving || !selectedCountry}
            className="w-full mt-8 bg-[#1A535C] hover:bg-[#133d44] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Confirmar País</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
