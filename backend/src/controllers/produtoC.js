
import produtoModel from '../models/produtoM.js';


async function getProduto(req, res) {

    const result = await produtoModel.getProdutos();
        res.json(result);
}

async function createProduto(req, res) {
    const produto = req.body;
    const result = await produtoModel.createProduto(produto);
    res.json(result);
}

async function updateProduto(req, res) {
    const id = req.params.id;
    const produto = req.body;
    const result = await produtoModel.updateProduto(id, produto);
    res.json(result);
}

async function deleteProduto(req, res) {
    const id = req.params.id;
    const result = await produtoModel.deleteProduto(id);
    res.json(result);
}


export default {getProduto, createProduto, updateProduto, deleteProduto};