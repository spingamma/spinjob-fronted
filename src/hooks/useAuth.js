// Archivo: src/hooks/useAuth.js
// Contexto + hook de autenticación. El contexto se crea aquí para evitar
// problemas de react-refresh al co-exportar con AuthProvider.

import { createContext, useContext } from 'react';

// Interno — solo AuthProvider y useAuth lo usan
export const _AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(_AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
