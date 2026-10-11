import DB from '../config/database.js';

// Hoje a tabela produto pode ainda não ter a coluna "validade".
// Verificamos no banco para o balanço não quebrar nos dois casos.
async function temColunaValidade() {
    const result = await DB.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'produto' AND column_name = 'validade'`
    );
    return result.rows.length > 0;
}

async function buscarProdutos() {
    const validadeDisponivel = await temColunaValidade();

    const result = await DB.query(`
        SELECT p.produto_id, p.nome, p.estoque, p.unidade, p.estoque_minimo,
               ${validadeDisponivel ? 'p.validade' : 'NULL::date AS validade'},
               c.nome AS categoria
        FROM produto p
        LEFT JOIN categoria c ON c.categoria_id = p.id_categoria
        ORDER BY p.nome
    `);

    return { produtos: result.rows, validadeDisponivel };
}

// Total de entradas e saídas por produto nos últimos N dias
async function buscarMovimentacao(dias) {
    const result = await DB.query(
        `
        WITH ent AS (
            SELECT id_produto, SUM(quantidade) AS total
            FROM entrada
            WHERE data_entrada >= CURRENT_DATE - $1::int
            GROUP BY id_produto
        ),
        sai AS (
            SELECT id_produto, SUM(quantidade) AS total
            FROM saida
            WHERE data_saida >= CURRENT_DATE - $1::int
            GROUP BY id_produto
        )
        SELECT p.produto_id, p.nome,
               COALESCE(ent.total, 0) AS entradas,
               COALESCE(sai.total, 0) AS saidas
        FROM produto p
        LEFT JOIN ent ON ent.id_produto = p.produto_id
        LEFT JOIN sai ON sai.id_produto = p.produto_id
        `,
        [dias]
    );
    return result.rows;
}

export default { buscarProdutos, buscarMovimentacao };
