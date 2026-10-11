
import categoriaModel from '../models/categoriaM.js';


async function getCategoria(req, res) {
    const result = await categoriaModel.getCategorias();
        res.json(result);
}

async function createCategoria(req, res) {
    const categoria = req.body;
    const result = await categoriaModel.createCategoria(categoria);
    res.json(result);
}

async function updateCategoria(req, res) {
    const id = req.params.id;
    const categoria = req.body;
    const result = await categoriaModel.updateCategoria(id, categoria);
    res.json(result);
}

async function deleteCategoria(req, res) {
    const id = req.params.id;
    const result = await categoriaModel.deleteCategoria(id);
    res.json(result);
}

export default {getCategoria, createCategoria, updateCategoria, deleteCategoria};