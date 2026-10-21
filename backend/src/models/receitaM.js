import DB from '../config/database.js';
import ingredienteModel from '../models/ingredienteM.js';

const Pool = DB;
 
async function getReceita() {
    const result = await Pool.query(`
        SELECT r.*, p.nome AS produto_nome
        FROM receita r
        JOIN produto p ON p.produto_id = r.id_produto
    `);
    return result.rows;
}

async function getById(id) {
    const result = await Pool.query(`
        SELECT r.*, p.nome AS produto_nome
        FROM receita r
        JOIN produto p ON p.produto_id = r.id_produto
        WHERE r.receita_id = $1
    `, [id]);
    return result.rows;
}

async function getByNome(nome) {
    const result = await Pool.query(`
        SELECT r.*, p.nome AS produto_nome
        FROM receita r
        JOIN produto p ON p.produto_id = r.id_produto
        WHERE r.nome = $1
    `, [nome]);
    return result.rows;
}

async function createReceita(receita) {
    const result = await Pool.query(
        'INSERT INTO receita (id_produto,nome,quantidade,validade) VALUES ($1,$2,$3,$4) RETURNING *',
        [receita.id_produto, receita.nome, receita.quantidade,receita.validade]
    );
    return result.rows[0];
}

async function updateReceita(id, receita) {
    const result = await Pool.query(
        'UPDATE receita SET id_produto=$1, nome=$2, quantidade=$3, validade=$4 WHERE receita_id=$5 RETURNING *',
        [receita.id_produto, receita.nome, receita.quantidade,receita.validade, id]
    );
    return result.rows[0];
}

async function deleteReceita(id) {
    const result = await Pool.query(
        'DELETE FROM receita WHERE receita_id=$1 RETURNING *',
        [id]
    );
    return result.rows[0];
}

async function usoReceita(receita,id,tokenUsuario) {
    
    const ingredientes = await ingredienteModel.getById(id);
    const receitaId = await getById(id);

    for (let i = 0; i < ingredientes.length; i++) {
        
         const produto_saida = await Pool.query(
        `INSERT INTO saida(id_produto, id_usuario, quantidade, observacao) VALUES ($1, $2, $3, $4) RETURNING *`,
        [ingredientes[i].id_produto, tokenUsuario, receita.mult*ingredientes[i].quantidade, "Uso na receita "+ receitaId[0].nome]
    );
       
    
   }
   const produto_entrada = await Pool.query(
        `INSERT INTO entrada (id_produto, quantidade, fornecedor,validade) VALUES ($1, $2, $3, $4) RETURNING *`,
        [ receitaId[0].id_produto, receita.mult*receitaId[0].quantidade, "receita de " + receitaId[0].nome,receitaId[0].validade]
    );
    return produto_entrada.rows[0];

}

export default { getReceita, getById, getByNome, createReceita, updateReceita, deleteReceita, usoReceita };