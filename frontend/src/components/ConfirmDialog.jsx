import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ titulo, mensagem, textoConfirmar = 'Excluir', carregando, onConfirm, onClose }) {
  return (
    <Modal
      titulo={titulo}
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={carregando}>
            Cancelar
          </Button>
          <Button variant="perigo" onClick={onConfirm} loading={carregando}>
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <p>{mensagem}</p>
      <p className="texto-suave">Esta ação não pode ser desfeita.</p>
    </Modal>
  );
}
