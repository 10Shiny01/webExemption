import DB from '../config/database.js';

const Pool = DB;

async function getEntradas() {
    const result = await Pool.query(`
        SELECT e.*, p.nome AS produto_nome
        FROM entrada e
        JOIN produto p ON p.produto_id = e.id_produto
    `);
    return result.rows;
}

async function getById(id) {
    const result = await Pool.query(`
        SELECT e.*, p.nome AS produto_nome
        FROM entrada e
        JOIN produto p ON p.produto_id = e.id_produto
        WHERE e.entrada_id = $1
    `, [id]);
    return result.rows;
}



async function createEntrada(entrada) {
    const result = await Pool.query(
        `INSERT INTO entrada (id_produto, quantidade, fornecedor, validade, valor) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [ entrada.id_produto, entrada.quantidade, entrada.fornecedor, entrada.validade, entrada.valor ]
    );

    return result.rows[0];
}
export default {
    createEntrada,getEntradas,getById
}