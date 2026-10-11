import DB from '../config/database.js';

const Pool = DB;

const perfil = ['funcionario', 'adm'];

async function getUsuarios() {
    const result = await Pool.query(
        `SELECT usuario_id, nome, email, perfil, data_cad FROM usuario`
    );
    return result.rows;
}

async function getById(id) {
    const result = await Pool.query(
        `SELECT usuario_id, nome, email, perfil, data_cad FROM usuario WHERE usuario_id = $1`,
        [id]
    );
    return result.rows[0];
}

async function getByEmail(email) {
    const result = await Pool.query(
        `SELECT * FROM usuario WHERE email = $1`,
        [email]
    );
    return result.rows[0];
}

async function createUsuario(usuario) {
    const result = await Pool.query(
        `INSERT INTO usuario (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING *`,
        [usuario.nome, usuario.email, usuario.senha, perfil[usuario.perfil]]
    );
    return result.rows[0];
}

async function updateUsuario(id, usuario) {
    const result = await Pool.query(
        `UPDATE usuario SET nome=$1, email=$2, perfil=$3 WHERE usuario_id=$4 RETURNING *`,
        [usuario.nome, usuario.email, perfil[usuario.perfil], id]
    );
    return result.rows[0];
}

async function deleteUsuario(id) {
    const result = await Pool.query(
        `DELETE FROM usuario WHERE usuario_id=$1 RETURNING *`,
        [id]
    );
    return result.rows[0];
}

export default { getUsuarios, getById, getByEmail, createUsuario, updateUsuario, deleteUsuario };
