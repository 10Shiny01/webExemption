import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedR.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import Login from '../pages/Login.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Produtos from '../pages/Produtos.jsx';
import Entradas from '../pages/Entradas.jsx';
import Saidas from '../pages/Saidas.jsx';
import Receitas from '../pages/Receitas.jsx';
import Categorias from '../pages/Categorias.jsx';
import Relatorios from '../pages/Relatorios.jsx';
import Usuarios from '../pages/Usuarios.jsx';
import BalancoGeral from '../pages/BalancoGeral.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="entradas" element={<Entradas />} />
          <Route path="saidas" element={<Saidas />} />
          <Route path="receitas" element={<Receitas />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="balanco" element={<BalancoGeral />} />
          <Route element={<ProtectedRoute perfis={['adm']} />}>
            <Route path="usuarios" element={<Usuarios />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
