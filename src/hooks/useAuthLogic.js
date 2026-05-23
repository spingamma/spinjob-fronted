import { useState, useEffect } from 'react';
import { parsePhoneNumber } from '../utils/phone';

/**
 * Custom hook que encapsula toda la lógica de autenticación
 * (login, registro, Google, forgot password, change password, completar celular).
 * Retorna estados y handlers para que AuthModal solo se ocupe del renderizado.
 */
export default function useAuthLogic({ isOpen, onSuccess }) {
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

  // ══════════════════════════════════════════
  // Validación
  // ══════════════════════════════════════════
  const validar = (soloCelular = false) => {
    let valid = true;
    const nuevosErrores = {};

    if (!soloCelular) {
      if (isForgotMode) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(formData.email.trim())) {
          nuevosErrores.email = 'Ingresa un correo electrónico válido.';
          valid = false;
        }
        setErrores(nuevosErrores);
        return valid;
      }

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

    if (!isForgotMode && !isChangingPassword) {
      const { country, number } = parsePhoneNumber(formData.celular);
      const regexCelular = new RegExp(`^[0-9]{${country.length}}$`);
      if (!regexCelular.test(number.trim())) {
        nuevosErrores.celular = `El celular debe tener exactamente ${country.length} dígitos numéricos.`;
        valid = false;
      }
    }

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
  // Helpers para completar sesión
  // ══════════════════════════════════════════
  const _completeSession = (userData) => {
    localStorage.setItem('spingamma_user', JSON.stringify(userData));
    onSuccess(userData);
  };

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
        setTempUserData({ nombre: data.nombre, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false });
        setIsCompletingPhone(true);
      } else {
        _completeSession({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false });
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
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

      if (data.must_change_password) {
        setTempToken(data.access_token);
        setTempUserData({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false });
        setIsChangingPassword(true);
        setIsLoading(false);
        return;
      }

      _completeSession({ nombre: data.nombre, celular: data.celular, is_admin: data.is_admin || false, is_vendedor: data.is_vendedor || false });
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

      _completeSession({ nombre: tempUserData.nombre, celular: tempUserData.celular, is_admin: tempUserData.is_admin, is_vendedor: tempUserData.is_vendedor });
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

      _completeSession({ nombre: tempUserData.nombre, celular: formData.celular, is_admin: tempUserData.is_admin, is_vendedor: tempUserData.is_vendedor });
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers de navegación ──
  const switchToForgot = () => { setIsForgotMode(true); setApiError(''); setErrores({}); };
  const switchFromForgot = () => { setIsForgotMode(false); setApiError(''); setApiSuccess(''); setErrores({}); };
  const switchMode = () => { setIsLoginMode(!isLoginMode); setApiError(''); setErrores({}); };

  return {
    // Vista
    isLoginMode, isForgotMode, isChangingPassword, isCompletingPhone,
    // Estado
    isLoading, apiError, apiSuccess, showPassword, showNewPassword,
    setShowPassword, setShowNewPassword,
    // Formulario
    formData, setFormData, errores, setErrores,
    // Handlers
    handleGoogleSuccess, handleSubmitNormal, handleForgotPassword,
    handleChangePassword, handleCompletarCelular,
    // Navegación
    switchToForgot, switchFromForgot, switchMode,
  };
}
