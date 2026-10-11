import DB from '../config/database.js';

 const Pool = DB;

async function getIngredientes() {
    const result = await Pool.query(`
        SELECT ru.*, r.nome AS receita_nome, p.nome AS produto_nome
        FROM receita_uso ru
        JOIN receita r ON r.receita_id = ru.id_receita
        JOIN produto p ON p.produto_id = ru.id_produto
    `);
    return result.rows;
}

async function getById(id) {
    const result = await Pool.query(`
        SELECT ru.*, r.nome AS receita_nome, p.nome AS produto_nome
        FROM receita_uso ru
        JOIN receita r ON r.receita_id = ru.id_receita
        JOIN produto p ON p.produto_id = ru.id_produto
        WHERE ru.id_receita = $1
    `, [id]);
    return result.rows;
}

async function getByNome(nome) {
    const result = await Pool.query(`
        SELECT ru.*, r.nome AS receita_nome, p.nome AS produto_nome
        FROM receita_uso ru
        JOIN receita r ON r.receita_id = ru.id_receita
        JOIN produto p ON p.produto_id = ru.id_produto
        WHERE r.nome = $1
    `, [nome]);
    return result.rows;
}

 async function createIngrediente(ingrediente) {
    const result = await Pool.query('INSERT INTO receita_uso (id_receita, id_produto, quantidade) VALUES ($1,$2,$3) RETURNING *',[ingrediente.id_receita, ingrediente.id_produto, ingrediente.quantidade]
    );
    return result.rows[0];
}
 async function updateIngrediente(id , ingrediente) {
    const result = await Pool.query('UPDATE receita_uso SET id_receita=$1, id_produto=$2, quantidade=$3 WHERE id_receita_uso=$4 RETURNING *',[ingrediente.id_receita, ingrediente.id_produto, ingrediente.quantidade, id]
    );
    return result.rows[0];
}
 async function deleteIngrediente(id) {
    const result = await Pool.query('DELETE FROM receita_uso WHERE id_receita_uso=$1 RETURNING *',[id]
    );
    return result.rows[0];
}


export default {getIngredientes, getById, getByNome, createIngrediente, updateIngrediente, deleteIngrediente};