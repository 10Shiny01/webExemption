import { criarRecurso } from './api.js';

// A API só permite listar, consultar e criar entradas.
const { listar, obter, criar } = criarRecurso('entrada');
export default { listar, obter, criar };
