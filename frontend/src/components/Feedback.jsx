import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const TIPOS = {
  sucesso: { icone: CheckCircle2, role: 'status' },
  erro: { icone: AlertCircle, role: 'alert' },
  aviso: { icone: AlertTriangle, role: 'status' },
  info: { icone: Info, role: 'status' },
};

// type: 'sucesso' | 'erro' | 'aviso' | 'info'
export default function Feedback({ type = 'info', children, onClose }) {
  const { icone: Icone, role } = TIPOS[type] ?? TIPOS.info;

  return (
    <div className={`feedback feedback--${type}`} role={role}>
      <Icone className="feedback__icone" size={20} aria-hidden="true" />
      <div className="feedback__texto">{children}</div>
      {onClose && (
        <button type="button" className="feedback__fechar" onClick={onClose} aria-label="Fechar mensagem">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
