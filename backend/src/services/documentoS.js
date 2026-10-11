import { PERIODOS } from '../config/balanco.js';
import balancoModel from '../models/balancoM.js';
import { gerarBalanco } from './balancoS.js';

function formatarData(valor) {
    if (!valor) return '-';
    const d = new Date(valor);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
}

function statusDoProduto(estoque, minimo) {
    if (estoque <= 0) return 'Sem estoque';
    if (estoque < minimo) return 'Abaixo do mínimo';
    return 'OK';
}

// Dados reais de TODOS os produtos, para o relatório de estoque em PDF.
export async function obterRelatorioEstoque(periodo) {
    const dias = PERIODOS[periodo];

    const [{ produtos, validadeDisponivel }, movimentacao] = await Promise.all([
        balancoModel.buscarProdutos(),
        balancoModel.buscarMovimentacao(dias),
    ]);

    const movPorId = new Map(
        movimentacao.map((m) => [m.produto_id, { entradas: Number(m.entradas), saidas: Number(m.saidas) }])
    );

    const itens = produtos.map((p) => {
        const estoque = Number(p.estoque);
        const estoqueMinimo = Number(p.estoque_minimo ?? 0);
        return {
            nome: p.nome,
            categoria: p.categoria ?? '-',
            unidade: p.unidade,
            estoque,
            estoque_minimo: estoqueMinimo,
            validade: formatarData(p.validade),
            status: statusDoProduto(estoque, estoqueMinimo),
            ...(movPorId.get(p.produto_id) ?? { entradas: 0, saidas: 0 }),
        };
    });

    // Somar unidades diferentes (g + un) não faz sentido, então o total é por unidade.
    const porUnidade = {};
    itens.filter((p) => p.estoque > 0).forEach((p) => {
        porUnidade[p.unidade] = (porUnidade[p.unidade] ?? 0) + p.estoque;
    });

    return {
        itens,
        totais: {
            produtos_cadastrados: itens.length,
            com_estoque: itens.filter((p) => p.estoque > 0).length,
            sem_estoque: itens.filter((p) => p.status === 'Sem estoque').length,
            abaixo_minimo: itens.filter((p) => p.status === 'Abaixo do mínimo').length,
            ok: itens.filter((p) => p.status === 'OK').length,
            por_unidade: porUnidade,
        },
        meta: {
            periodo,
            dias_analisados: dias,
            gerado_em: new Date().toISOString(),
            validade_disponivel: validadeDisponivel,
        },
    };
}

// Balanço Geral (o mesmo do GET /balanco), para virar PDF.
export async function obterBalancoDocumento(periodo) {
    return gerarBalanco(periodo);
}