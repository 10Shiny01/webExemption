import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authS.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => authService.sessaoAtual());
  const [sessaoExpirou, setSessaoExpirou] = useState(false);

  useEffect(() => {
    const aoExpirar = () => {
      setSessao(null);
      setSessaoExpirou(true);
    };
    window.addEventListener('auth:expirada', aoExpirar);
    return () => window.removeEventListener('auth:expirada', aoExpirar);
  }, []);

  const login = useCallback(async (email, senha) => {
    const nova = await authService.login(email, senha);
    setSessaoExpirou(false);
    setSessao(nova);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSessao(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario: sessao?.usuario ?? null,
      autenticado: Boolean(sessao),
      isAdmin: sessao?.usuario?.perfil === 'adm',
      sessaoExpirou,
      login,
      logout,
    }),
    [sessao, sessaoExpirou, login, logout]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return contexto;
}
