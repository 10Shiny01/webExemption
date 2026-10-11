
import DB from '../config/database.js';

const Pool = DB;

const categoria = ["receita","venda"];

async function getCategorias() {
    const result = await Pool.query(`
        SELECT c.*, COUNT(p.produto_id)::int AS total_produtos
        FROM categoria c
        LEFT JOIN produto p ON p.id_categoria = c.categoria_id
        GROUP BY c.categoria_id
    `);
    return result.rows;
}

async function createCategoria(produto) {
    const result = await Pool.query(
        'INSERT INTO categoria (nome,tipo) VALUES ($1,$2) RETURNING *',[produto.nome, categoria[produto.tipo]]
    );
    return result.rows[0];
}

async function updateCategoria(id , produto) {
    const result = await Pool.query(
        'UPDATE categoria SET nome=$1, tipo=$2 WHERE categoria_id=$3 RETURNING *',[produto.nome,categoria[produto.tipo], id]
    );
    return result.rows[0];
}

async function deleteCategoria(id) {
    const result = await Pool.query(
        'DELETE FROM categoria WHERE categoria_id=$1 RETURNING *',[id]
    );
    return result.rows[0];
}

export default {getCategorias, createCategoria, updateCategoria, deleteCategoria};