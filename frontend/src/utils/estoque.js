// Apoio à exibição dos dados de estoque. A regra de negócio continua no backend;
// aqui só classificamos os produtos para mostrar alertas e filtros.

// A API recebe estes campos como índice (posição) e devolve o texto.
export const UNIDADES = ['g', 'ml', 'un'];
export const PERFIS = ['funcionario', 'adm'];
export const TIPOS_CATEGORIA = ['receita', 'venda'];

export const ROTULO_PERFIL = { adm: 'Administrador', funcionario: 'Funcionário' };
export const ROTULO_TIPO = { receita: 'Insumo de receita', venda: 'Produto para venda' };

// Dias de antecedência para o alerta de validade (igual ao DIAS_ALERTA_VALIDADE do backend).
export const DIAS_ALERTA = Number(import.meta.env.VITE_DIAS_ALERTA_VALIDADE) || 7;

// O balanço do backend lê "estoque"; o cadastro grava "quantidade". Aceitamos os dois.
export function quantidadeDe(produto) {
  return Number(produto.estoque ?? produto.quantidade ?? 0);
}

export function paraData(valor) {
  if (!valor) return null;
  const texto = String(valor);
  // Datas puras (AAAA-MM-DD) ou ISO à meia-noite UTC: usa só o dia, sem deslocar o fuso.
  if (/^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(texto)) {
    const [a, m, d] = texto.slice(0, 10).split('-').map(Number);
    return new Date(a, m - 1, d);
  }
  const data = new Date(texto);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarData(valor) {
  const data = paraData(valor);
  return data ? data.toLocaleDateString('pt-BR') : '—';
}

export function formatarDataHora(valor) {
  const data = paraData(valor);
  if (!data) return '—';
  const temHora = String(valor).length > 10 && !/T00:00:00(\.000)?Z$/.test(String(valor));
  return temHora
    ? data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : data.toLocaleDateString('pt-BR');
}

export function formatarNumero(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

export function diasParaVencer(validade) {
  const data = paraData(validade);
  if (!data) return null;
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((data - inicioHoje) / 86400000);
}

// Situações de um produto. Vencido e próximo do vencimento nunca se misturam.
export function situacoesDe(produto) {
  const quantidade = quantidadeDe(produto);
  const minimo = Number(produto.estoque_minimo ?? 0);
  const dias = diasParaVencer(produto.validade);
  const situacoes = [];

  if (quantidade > 0 && dias !== null && dias < 0) situacoes.push('vencido');
  else if (quantidade > 0 && dias !== null && dias <= DIAS_ALERTA) situacoes.push('proximo');
  if (quantidade < minimo) situacoes.push('baixo');
  if (situacoes.length === 0) situacoes.push('normal');
  return situacoes;
}

export const ROTULO_SITUACAO = {
  vencido: 'Vencido',
  proximo: 'Próximo do vencimento',
  baixo: 'Abaixo do mínimo',
  normal: 'Estoque normal',
};

export const TOM_SITUACAO = { vencido: 'erro', proximo: 'aviso', baixo: 'aviso', normal: 'ok' };

export function contarSituacoes(produtos) {
  const total = { vencido: 0, proximo: 0, baixo: 0, normal: 0 };
  produtos.forEach((p) => situacoesDe(p).forEach((s) => (total[s] += 1)));
  return total;
}

// Permissões usadas só para mostrar ou esconder botões; o backend é quem decide de fato.
export const podeExcluir = (usuario) => usuario?.perfil === 'adm';
