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

// A validade pertence à entrada (lote), não ao produto. Só importam os lotes que ainda têm
// saldo em estoque. A API não informa o saldo de cada lote, então ele é estimado aqui:
// o estoque atual do produto é atribuído às entradas mais recentes (as mais antigas saem primeiro).
export function comSaldoEstimado(entradas, produtos) {
  const lista = Array.isArray(entradas) ? entradas : [];
  const estoque = new Map((Array.isArray(produtos) ? produtos : []).map((p) => [p.produto_id, quantidadeDe(p)]));
  const instante = (e) => new Date(e.data_entrada).getTime() || 0;
  const saldos = new Map();

  const porProduto = new Map();
  lista.forEach((e) => porProduto.set(e.id_produto, [...(porProduto.get(e.id_produto) ?? []), e]));
  porProduto.forEach((entradasDoProduto, id) => {
    let restante = estoque.get(id) ?? 0;
    [...entradasDoProduto]
      .sort((a, b) => instante(b) - instante(a) || b.entrada_id - a.entrada_id)
      .forEach((e) => {
        const saldo = Math.max(0, Math.min(Number(e.quantidade) || 0, restante));
        saldos.set(e.entrada_id, saldo);
        restante -= saldo;
      });
  });

  return lista.map((e) => ({ ...e, saldo: saldos.get(e.entrada_id) ?? 0 }));
}

// 'vencido' | 'proximo' | 'normal' para lotes com saldo e validade; null nos demais.
export function situacaoDoLote(entrada) {
  if (!(Number(entrada?.saldo) > 0)) return null;
  const dias = diasParaVencer(entrada.validade);
  if (dias === null) return null;
  if (dias < 0) return 'vencido';
  return dias <= DIAS_ALERTA ? 'proximo' : 'normal';
}

// Lotes em estoque por produto: Map(id_produto -> lotes), da validade mais próxima para a mais distante.
export function lotesPorProduto(entradas) {
  const mapa = new Map();
  (Array.isArray(entradas) ? entradas : []).forEach((e) => {
    const situacao = situacaoDoLote(e);
    if (!situacao) return;
    const lote = { ...e, saldo: Number(e.saldo), dias: diasParaVencer(e.validade), situacao };
    mapa.set(e.id_produto, [...(mapa.get(e.id_produto) ?? []), lote]);
  });
  mapa.forEach((lista) => lista.sort((a, b) => a.dias - b.dias));
  return mapa;
}

// Situações de um produto. Vencido e próximo do vencimento nunca se misturam
// (vencido tem prioridade) e vêm dos lotes que ainda estão em estoque.
export function situacoesDe(produto, lotes = []) {
  const quantidade = quantidadeDe(produto);
  const minimo = Number(produto.estoque_minimo ?? 0);
  const situacoes = [];

  if (lotes.some((l) => l.situacao === 'vencido')) situacoes.push('vencido');
  else if (lotes.some((l) => l.situacao === 'proximo')) situacoes.push('proximo');
  if (quantidade < minimo) situacoes.push('baixo');
  if (situacoes.length === 0) situacoes.push('normal');
  return situacoes;
}

// Texto curto para a validade de um lote: "vencido há 3 dias", "vence hoje", "vence em 5 dias".
export function descreverPrazo(dias) {
  if (dias === null || dias === undefined) return '';
  if (dias < 0) return `vencido há ${-dias} ${dias === -1 ? 'dia' : 'dias'}`;
  if (dias === 0) return 'vence hoje';
  return `vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
}

// Remove acentos e maiúsculas para a pesquisa ("pao" encontra "Pão").
export const normalizarBusca = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export const ROTULO_SITUACAO = {
  vencido: 'Vencido',
  proximo: 'Próximo do vencimento',
  baixo: 'Abaixo do mínimo',
  normal: 'Estoque normal',
};

export const TOM_SITUACAO = { vencido: 'erro', proximo: 'aviso', baixo: 'aviso', normal: 'ok' };

export function contarSituacoes(produtos, lotes = new Map()) {
  const total = { vencido: 0, proximo: 0, baixo: 0, normal: 0 };
  produtos.forEach((p) => situacoesDe(p, lotes.get(p.produto_id)).forEach((s) => (total[s] += 1)));
  return total;
}

// Permissões usadas só para mostrar ou esconder botões; o backend é quem decide de fato.
export const podeExcluir = (usuario) => usuario?.perfil === 'adm';
