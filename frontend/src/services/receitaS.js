import { criarRecurso, request } from './api.js';

const receitas = criarRecurso('receita');
const ingredientes = criarRecurso('ingrediente');

export default {
  ...receitas,
  // Registra a produção: baixa os ingredientes (saídas) e dá entrada no produto final.
  produzir: (id, mult) => request(`/receita/api/system/uso/${id}`, { method: 'POST', body: { mult } }),
  ingredientes: {
    listar: () => ingredientes.listar(),
    criar: ingredientes.criar,
    atualizar: ingredientes.atualizar,
    excluir: ingredientes.excluir,
  },
};
