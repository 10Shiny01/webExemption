import { useCallback, useEffect, useRef, useState } from 'react';

// Executa uma função assíncrona (normalmente um serviço) e controla carregando/erro/dados.
export default function useFetch(buscar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null });
  const [tentativa, setTentativa] = useState(0);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  useEffect(() => {
    let ativo = true;
    setEstado((atual) => ({ ...atual, carregando: true, erro: null }));
    buscarRef
      .current()
      .then((dados) => ativo && setEstado({ dados, carregando: false, erro: null }))
      .catch((e) => ativo && setEstado({ dados: null, carregando: false, erro: e.message }));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa]);

  const recarregar = useCallback(() => setTentativa((t) => t + 1), []);

  return { ...estado, recarregar };
}
