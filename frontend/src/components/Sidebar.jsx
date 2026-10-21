import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Package,
  PackageMinus,
  PackagePlus,
  Sparkles,
  Tags,
  Users,
  X,
} from 'lucide-react';
import Logo from './Logo.jsx';

const ITENS = [
  { to: '/', rotulo: 'Dashboard', icone: LayoutDashboard, fim: true },
  { to: '/entradas', rotulo: 'Entradas', icone: PackagePlus },
  { to: '/saidas', rotulo: 'Saídas e retiradas', icone: PackageMinus },
  { to: '/receitas', rotulo: 'Receitas', icone: BookOpen },
  { to: '/produtos', rotulo: 'Produtos', icone: Package },
  { to: '/categorias', rotulo: 'Categorias', icone: Tags },
  { to: '/relatorios', rotulo: 'Relatórios', icone: BarChart3 },
  { to: '/balanco', rotulo: 'Balanço geral', icone: Sparkles },
  { to: '/usuarios', rotulo: 'Usuários', icone: Users, somenteAdmin: true },
];

export default function Sidebar({ aberto, onFechar, isAdmin, onSair }) {
  return (
    <>
      {aberto && <div className="menu-fundo" onClick={onFechar} aria-hidden="true" />}
      <aside className={`menu ${aberto ? 'menu--aberto' : ''}`} aria-label="Menu principal">
        <div className="menu__topo">
          <Logo inverso />
          <button type="button" className="menu__fechar btn-icone btn-icone--claro" onClick={onFechar} aria-label="Fechar menu">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav className="menu__nav">
          {ITENS.filter((i) => !i.somenteAdmin || isAdmin).map(({ to, rotulo, icone: Icone, fim }) => (
            <NavLink key={to} to={to} end={fim} className="menu__item" onClick={onFechar}>
              <Icone size={20} aria-hidden="true" />
              <span>{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="menu__item menu__sair" onClick={onSair}>
          <LogOut size={20} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </aside>
    </>
  );
}
