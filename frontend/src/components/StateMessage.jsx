import { AlertCircle, Inbox } from 'lucide-react';
import Spinner from './Spinner.jsx';
import Button from './Button.jsx';

// tipo: 'carregando' | 'erro' | 'vazio'
export default function StateMessage({ tipo, mensagem, onRetry }) {
  if (tipo === 'carregando') {
    return (
      <div className="estado" role="status">
        <Spinner size={28} />
        <p>{mensagem ?? 'Carregando...'}</p>
      </div>
    );
  }

  if (tipo === 'erro') {
    return (
      <div className="estado estado--erro" role="alert">
        <AlertCircle size={28} aria-hidden="true" />
        <p>{mensagem ?? 'Não foi possível carregar os dados.'}</p>
        {onRetry && (
          <Button variant="secundario" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="estado">
      <Inbox size={28} aria-hidden="true" />
      <p>{mensagem ?? 'Nenhum registro encontrado.'}</p>
    </div>
  );
}
