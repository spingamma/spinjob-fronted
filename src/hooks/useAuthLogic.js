import { useState, useEffect } from 'react';
import { parsePhoneNumber } from '../utils/phone';

/**
 * Custom hook que encapsula la lógica de autenticación (Google y completar celular).
 */
export default function useAuthLogic({ isOpen, onSuccess, onRequireVerification }) {
  const [isCompletingPhone, setIsCompletingPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [supportWhatsApp, setSupportWhatsApp] = useState('');

  const [tempToken, setTempToken] = useState(null);
  const [tempUserData, setTempUserData] = useState(null);

  const [formData, setFormData] = useState({ celular: '', country: '' });
  const [errores, setErrores] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // Obtener el WhatsApp de soporte desde el perfil de spingamma
  useEffect(() => {
    const fetchSupportWhatsApp = async () => {
      try {
        const res = await fetch(`${API_URL}/businesses/spingamma`);
        if (res.ok) {
          const data = await res.json();
          if (data.whatsapp_numbers) {
            const numbers = JSON.parse(data.whatsapp_numbers);
            if (numbers.length > 0) {
              setSupportWhatsApp(numbers[0]);
            } else if (data.phone) {
              setSupportWhatsApp(data.phone);
            }
          } else if (data.phone) {
            setSupportWhatsApp(data.phone);
          }
        }
      } catch (err) {
        console.error("Error fetching support WhatsApp:", err);
      }
    };
    fetchSupportWhatsApp();
  }, [API_URL]);

  useEffect(() => {
    if (isOpen) {
      let defaultCountry = localStorage.getItem('spingamma_selected_country');
      if (!defaultCountry) {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz.includes('La_Paz')) defaultCountry = 'Bolivia';
          else if (tz.includes('Bogota')) defaultCountry = 'Colombia';
          else if (tz.includes('Lima')) defaultCountry = 'Perú';
          else if (tz.includes('Argentina') || tz.includes('Buenos_Aires') || tz.includes('Cordoba') || tz.includes('Mendoza')) defaultCountry = 'Argentina';
        } catch (e) {}
      }
      if (!defaultCountry) {
        defaultCountry = 'Bolivia';
      }
      setFormData({ celular: '', country: defaultCountry });
      setErrores({});
      setApiError('');
      setIsCompletingPhone(false);
      setTempToken(null);
      setTempUserData(null);
    }
  }, [isOpen]);

  const validarCelular = () => {
    let valid = true;
    const nuevosErrores = {};
    const { country, number } = parsePhoneNumber(formData.celular);
    const regexCelular = new RegExp(`^[0-9]{${country.length}}$`);
    if (!regexCelular.test(number.trim())) {
      nuevosErrores.celular = `El celular debe tener exactamente ${country.length} dígitos numéricos.`;
      valid = false;
    }
    setErrores(nuevosErrores);
    return valid;
  };

  const _completeSession = (userData, isRegistrationForm = false) => {
    localStorage.setItem('spingamma_user', JSON.stringify(userData));
    if (isRegistrationForm && userData.is_verified === false) {
      if (onRequireVerification) {
        onRequireVerification(userData);
        return;
      }
    }
    onSuccess(userData);
  };

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
        setTempUserData({ nombre: data.nombre, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false, is_verified: data.is_verified || false });
        setIsCompletingPhone(true);
      } else {
        _completeSession({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false, is_verified: data.is_verified || false });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompletarCelular = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validarCelular()) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/usuarios/completar-celular`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ phone: formData.celular, country: formData.country })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al completar tu celular.');

      _completeSession({ 
        nombre: tempUserData.nombre, 
        celular: formData.celular, 
        country: formData.country || tempUserData.country,
        is_admin: tempUserData.is_admin, 
        is_vendedor: tempUserData.is_vendedor, 
        is_verified: tempUserData.is_verified || false 
      }, true);
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isCompletingPhone,
    isLoading, apiError, supportWhatsApp,
    formData, setFormData, errores, setErrores,
    handleGoogleSuccess, handleCompletarCelular
  };
}
