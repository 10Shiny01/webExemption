import { useCallback, useState } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';

// Executa uma ação (salvar, excluir...) com estado de carregamento e mensagens de sucesso/erro.
export default function useAcao() {
  const [executando, setExecutando] = useState(false);
  const toast = useToast();

  const executar = useCallback(
    async (acao, mensagemSucesso) => {
      setExecutando(true);
      try {
        const resultado = await acao();
        if (mensagemSucesso) toast.sucesso(mensagemSucesso);
        return { ok: true, resultado };
      } catch (e) {
        toast.erro(e.message);
        return { ok: false };
      } finally {
        setExecutando(false);
      }
    },
    [toast]
  );

  return { executando, executar };
}
