
import receitaModel from '../models/receitaM.js';

 async function getReceita(req, res) {
    const result = await receitaModel.getReceita();
    res.json(result);
}

 async function getById(req, res) {
    const id = req.params.id;
    const result = await receitaModel.getById(id);
    res.json(result);
}

 async function getByNome(req, res) {
        const nome = req.params.nome;
        const result = await receitaModel.getByNome(nome);
        res.json(result);
    }
    
 async function createReceita(req, res) {
        const receita = req.body;
        const result = await receitaModel.createReceita(receita);
        res.json(result);
    }
 async function updateReceita(req, res) {
    const id = req.params.id;
    const receita = req.body;
    const result = await receitaModel.updateReceita(id, receita);
    res.json(result);
}

 async function deleteReceita(req, res) {
    const id = req.params.id;
    const result = await receitaModel.deleteReceita(id);
    res.json(result);
}

async function usoReceita(req,res){
    const id = req.params.id;
    const idUsuario = req.usuario.id;
    const result = await receitaModel.usoReceita(req.body,id,idUsuario);
    res.json(result);
}
   export default {usoReceita, getReceita, getById, getByNome, createReceita, updateReceita, deleteReceita}; 
