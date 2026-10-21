import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Usa o <dialog> nativo: o navegador cuida do foco preso e da tecla Esc.
export default function Modal({ titulo, onClose, children, rodape, largo = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (dialogo && !dialogo.open) dialogo.showModal();
    return () => dialogo?.close();
  }, []);

  function aoClicarFundo(e) {
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      className={`modal ${largo ? 'modal--largo' : ''}`}
      aria-labelledby="modal-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={aoClicarFundo}
    >
      <div className="modal__topo">
        <h2 id="modal-titulo">{titulo}</h2>
        <button type="button" className="btn-icone" onClick={onClose} aria-label="Fechar">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="modal__corpo">{children}</div>
      {rodape && <div className="modal__rodape">{rodape}</div>}
    </dialog>
  );
}
