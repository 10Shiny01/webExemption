
import DB from '../config/database.js';

const Pool = DB;

const unidade = ['g','ml','un'];

async function getProdutos() {
    const result = await Pool.query(`
        SELECT p.*, c.nome AS categoria_nome
        FROM produto p
        LEFT JOIN categoria c ON c.categoria_id = p.id_categoria
    `);
    return result.rows;
}
async function createProduto(produto) {
    const result = await Pool.query(
        'INSERT INTO produto (nome,quantidade,unidade,estoque_minimo,id_categoria) VALUES ($1,$2,$3,$4,$5) RETURNING *',[produto.nome, produto.quantidade, unidade[produto.unidade], produto.estoque_minimo, produto.id_categoria]
    );
    return result.rows[0];

}

async function updateProduto(id , produto) {
    const result = await Pool.query(
        'UPDATE produto SET nome=$1, quantidade=$2, unidade=$3, estoque_minimo=$4, id_categoria=$5 WHERE produto_id=$6 RETURNING *',[produto.nome, produto.quantidade, unidade[produto.unidade], produto.estoque_minimo, produto.id_categoria, id]
    );
    return result.rows[0];
}

async function deleteProduto(id) {
    const result = await Pool.query(
        'DELETE FROM produto WHERE produto_id=$1 RETURNING *',[id]
    );
    return result.rows[0];
}

export default {getProdutos, createProduto, updateProduto, deleteProduto};