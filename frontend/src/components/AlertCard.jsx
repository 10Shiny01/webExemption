import { Link } from 'react-router-dom';

// tom: 'erro' | 'aviso' | 'ok'. Todo o cartão é um link para a lista correspondente.
export default function AlertCard({ icon: Icon, titulo, valor, descricao, tom = 'aviso', to }) {
  return (
    <Link to={to} className={`alerta alerta--${tom}`}>
      <span className="alerta__icone" aria-hidden="true">
        <Icon size={24} />
      </span>
      <span className="alerta__texto">
        <span className="alerta__valor">{valor}</span>
        <span className="alerta__titulo">{titulo}</span>
        {descricao && <span className="alerta__descricao">{descricao}</span>}
      </span>
    </Link>
  );
}
