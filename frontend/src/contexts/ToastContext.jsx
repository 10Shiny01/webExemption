import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Feedback from '../components/Feedback.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [mensagens, setMensagens] = useState([]);
  const proximoId = useRef(1);
  const contentor = useRef(null);

  const remover = useCallback((id) => {
    setMensagens((atuais) => atuais.filter((m) => m.id !== id));
  }, []);

  const mostrar = useCallback(
    (tipo, texto) => {
      const id = proximoId.current++;
      setMensagens((atuais) => [...atuais, { id, tipo, texto }]);
      setTimeout(() => remover(id), 6000);
    },
    [remover]
  );

  // O contêiner é um "popover" para ficar acima dos modais (<dialog>) abertos.
  useEffect(() => {
    const el = contentor.current;
    if (!el) return;
    try {
      el.hidePopover?.();
      if (mensagens.length > 0) el.showPopover?.();
    } catch {
      /* navegador sem suporte a popover: o contêiner continua visível normalmente */
    }
  }, [mensagens]);

  const api = useMemo(
    () => ({
      sucesso: (texto) => mostrar('sucesso', texto),
      erro: (texto) => mostrar('erro', texto),
      aviso: (texto) => mostrar('aviso', texto),
    }),
    [mostrar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" popover="manual" ref={contentor} aria-live="polite">
        {mensagens.map((m) => (
          <Feedback key={m.id} type={m.tipo} onClose={() => remover(m.id)}>
            {m.texto}
          </Feedback>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const contexto = useContext(ToastContext);
  if (!contexto) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return contexto;
}
