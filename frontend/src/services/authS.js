import { request, lerSessao, salvarSessao, limparSessao } from './api.js';

function lerPayload(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(parte));
  } catch {
    return null;
  }
}

export function tokenExpirado(token) {
  const exp = lerPayload(token)?.exp;
  return !exp || exp * 1000 <= Date.now();
}

// Retorna a sessão salva se o token ainda for válido.
export function sessaoAtual() {
  const sessao = lerSessao();
  if (!sessao?.token || tokenExpirado(sessao.token)) {
    limparSessao();
    return null;
  }
  return sessao;
}

export async function login(email, senha) {
  const dados = await request('/usuario/api/system/login', {
    method: 'POST',
    body: { email, senha },
    publica: true,
  });
  const sessao = { token: dados.token, usuario: dados.usuario };
  salvarSessao(sessao);
  return sessao;
}

// O endpoint de logout do backend não invalida o token; encerramos a sessão no navegador.
export function logout() {
  limparSessao();
}
