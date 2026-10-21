import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

// perfis: lista de perfis permitidos (ex.: ['adm']). Sem lista, basta estar autenticado.
export default function ProtectedRoute({ perfis }) {
  const { autenticado, usuario } = useAuth();
  const local = useLocation();

  if (!autenticado) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (perfis && !perfis.includes(usuario.perfil)) return <Navigate to="/" replace />;
  return <Outlet />;
}
