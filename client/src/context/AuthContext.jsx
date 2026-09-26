import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('copart_token');
    if (!token) {
      setCargando(false);
      return;
    }
    api
      .me()
      .then(({ usuario }) => setUsuario(usuario))
      .catch(() => localStorage.removeItem('copart_token'))
      .finally(() => setCargando(false));
  }, []);

  function iniciarSesion({ token, usuario }) {
    localStorage.setItem('copart_token', token);
    setUsuario(usuario);
  }

  function cerrarSesion() {
    localStorage.removeItem('copart_token');
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
