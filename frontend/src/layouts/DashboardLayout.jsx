import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function DashboardLayout() {
  const { usuario, isAdmin, logout } = useAuth();
  const [menuAberto, setMenuAberto] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  return (
    <div className="app">
      <Sidebar aberto={menuAberto} onFechar={() => setMenuAberto(false)} isAdmin={isAdmin} onSair={logout} />
      <div className="app__principal">
        <Header usuario={usuario} onAbrirMenu={() => setMenuAberto(true)} />
        <main className="conteudo" id="conteudo">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
