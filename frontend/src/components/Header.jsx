import { Menu, UserCircle } from 'lucide-react';
import Badge from './Badge.jsx';
import { ROTULO_PERFIL } from '../utils/estoque.js';

export default function Header({ usuario, onAbrirMenu }) {
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  return (
    <header className="topo">
      <button type="button" className="topo__menu btn-icone" onClick={onAbrirMenu} aria-label="Abrir menu">
        <Menu size={22} aria-hidden="true" />
      </button>

      <p className="topo__saudacao">
        Bem-vindo(a), <strong>{primeiroNome}</strong>
      </p>

      <div className="topo__conta">
        <UserCircle size={32} aria-hidden="true" />
        <div className="topo__dados">
          <span className="topo__nome">{usuario?.nome}</span>
          <span className="topo__email">{usuario?.email}</span>
        </div>
        <Badge tom="vinho">{ROTULO_PERFIL[usuario?.perfil] ?? usuario?.perfil}</Badge>
      </div>
    </header>
  );
}
