import DB from '../config/database.js';

const Pool = DB;

async function getSaida() {
    const result = await Pool.query(`
        SELECT s.*, p.nome AS produto_nome, u.nome AS usuario_nome
        FROM saida s
        JOIN produto p ON p.produto_id = s.id_produto
        JOIN usuario u ON u.usuario_id = s.id_usuario
    `);
    return result.rows;
}

async function getById(id) {
    const result = await Pool.query(`
        SELECT s.*, p.nome AS produto_nome, u.nome AS usuario_nome
        FROM saida s
        JOIN produto p ON p.produto_id = s.id_produto
        JOIN usuario u ON u.usuario_id = s.id_usuario
        WHERE s.saida_id = $1
    `, [id]);
    return result.rows;
}


async function createSaida(saida) {
    const result = await Pool.query(
        `INSERT INTO saida(id_produto, id_usuario, quantidade, observacao, valor) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [saida.id_produto, saida.id_usuario, saida.quantidade,  saida.observacao, saida.valor ]
    );
    return result.rows[0];
}

export default {
    createSaida,getSaida,getById
}