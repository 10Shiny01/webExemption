// Serviço central de requisições HTTP. Todas as chamadas à API passam por aqui.
// Rotas do backend: /<recurso>/api/system/...

const BASE_URL = (import.meta.env.VITE_API_URL ?? '/backend').replace(/\/$/, '');
const CHAVE_SESSAO = 'webexemption:sessao';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/* ---------- Sessão (token JWT + dados públicos do usuário) ---------- */

export function lerSessao() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_SESSAO));
  } catch {
    return null;
  }
}

export function salvarSessao(sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
}

/* ---------- Requisição ---------- */

const MENSAGENS_PADRAO = {
  400: 'Dados inválidos. Revise as informações e tente novamente.',
  401: 'Sessão expirada. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  409: 'Este registro já existe ou está em uso.',
};

async function lerCorpo(resposta) {
  const tipo = resposta.headers.get('content-type') ?? '';
  if (!tipo.includes('application/json')) return null;
  try {
    return await resposta.json();
  } catch {
    return null; // corpo vazio
  }
}

/**
 * @param {string} caminho  Ex.: "/produto/api/system/"
 * @param {object} opcoes   { method, body, params, blob, publica }
 */
export async function request(caminho, { method = 'GET', body, params, blob = false, publica = false } = {}) {
  const consulta = params ? `?${new URLSearchParams(params)}` : '';
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const sessao = lerSessao();
  if (!publica && sessao?.token) headers.Authorization = `Bearer ${sessao.token}`;

  let resposta;
  try {
    resposta = await fetch(`${BASE_URL}${caminho}${consulta}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão e se a API está em execução.');
  }

  if (!resposta.ok) {
    const dados = await lerCorpo(resposta);

    if (resposta.status === 401 && !publica) {
      limparSessao();
      window.dispatchEvent(new Event('auth:expirada'));
    }

    const mensagem =
      dados?.erro ??
      dados?.mensagem ??
      (resposta.status >= 500 ? 'Erro interno no servidor. Tente novamente em instantes.' : MENSAGENS_PADRAO[resposta.status]) ??
      `Falha na requisição (${resposta.status}).`;
    throw new ApiError(mensagem, resposta.status);
  }

  if (blob) {
    const arquivo = await resposta.blob();
    const disposicao = resposta.headers.get('content-disposition') ?? '';
    const nome = /filename="?([^";]+)"?/i.exec(disposicao)?.[1];
    return { arquivo, nome };
  }

  return lerCorpo(resposta);
}

/* ---------- Fábrica de recursos REST ---------- */

export function criarRecurso(nome) {
  const base = `/${nome}/api/system/`;
  return {
    listar: (params) => request(base, { params }),
    obter: (id) => request(`${base}${id}`),
    criar: (dados) => request(base, { method: 'POST', body: dados }),
    atualizar: (id, dados) => request(`${base}${id}`, { method: 'PUT', body: dados }),
    excluir: (id) => request(`${base}${id}`, { method: 'DELETE' }),
  };
}
