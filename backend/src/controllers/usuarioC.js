import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import usuarioModel from '../models/usuarioM.js';

const SALT_ROUNDS = 10;

function semSenha(usuario) {
    if (!usuario) {
        return usuario;
    }

    const { senha, ...dadosPublicos } = usuario;
    return dadosPublicos;
}

async function getUsuario(req, res) {
    const result = await usuarioModel.getUsuarios();
    res.json(result);
}

async function getNome(req, res) {
    const id = req.params.id;
    const result = await usuarioModel.getById(id);
    if (!result) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json(result);
}

async function createUsuario(req, res) {
    const usuario = req.body;
        
    if (!usuario.nome || !usuario.email || !usuario.senha) {
        return res.status(400).json({ erro: 'nome, email e senha são obrigatórios' });
    }

    const senhaHash = await bcrypt.hash(usuario.senha, SALT_ROUNDS);

    const result = await usuarioModel.createUsuario({
        ...usuario,
        senha: senhaHash
    });

    res.status(201).json(semSenha(result));
}

async function updateUsuario(req, res) {
    const id = req.params.id;
    const usuario = req.body;
    const result = await usuarioModel.updateUsuario(id, usuario);
    res.json(semSenha(result));
}

async function deleteUsuario(req, res) {
    const id = req.params.id;
    const result = await usuarioModel.deleteUsuario(id);
    res.json(semSenha(result));
}

async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'email e senha são obrigatórios' });
    }

    const usuario = await usuarioModel.getByEmail(email);

    if (!usuario) {
        
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const senhaConfere = await bcrypt.compare(senha, usuario.senha);

    if (!senhaConfere) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
        {
            id: usuario.usuario_id,
            perfil: usuario.perfil,
            
        },
        process.env.JWT_SECRET,
        { expiresIn: '10h' }
    );

    res.json({
        token,
        usuario: {
            id: usuario.usuario_id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil
        }
    });
}
async function logout(req, res) {
    jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '1ms' }); 
    res.json({ mensagem: 'Logout realizado com sucesso' });
}
export default { getUsuario, getNome, createUsuario, updateUsuario, deleteUsuario, login, logout };
