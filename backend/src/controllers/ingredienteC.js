import ingredienteModel from '../models/ingredienteM.js';

 async function getIngredientes(req, res) {
     const result = await ingredienteModel.getIngredientes();
     res.json(result);
}

async function getById(req, res) {
    const id = req.params.id;
    const result = await ingredienteModel.getById(id);
    res.json(result);
}

async function getByNome(req, res) {
    const nome = req.params.nome;
    const result = await ingredienteModel.getByNome(nome);
    res.json(result);
}

async function createIngrediente(req, res) {
    const ingrediente = req.body;
    const result = await ingredienteModel.createIngrediente(ingrediente);
    res.json(result);
}

async function updateIngrediente(req, res) {
    const id = req.params.id;
    const ingrediente = req.body;
    const result = await ingredienteModel.updateIngrediente(id, ingrediente);
    res.json(result);
}

async function deleteIngrediente(req, res) {
    const id = req.params.id;
    const result = await ingredienteModel.deleteIngrediente(id);
    res.json(result);
}

export default {getIngredientes, getById, getByNome, createIngrediente, updateIngrediente, deleteIngrediente};