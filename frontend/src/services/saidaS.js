import { criarRecurso } from './api.js';

// A API só permite listar, consultar e criar saídas.
const { listar, obter, criar } = criarRecurso('saida');
export default { listar, obter, criar };
