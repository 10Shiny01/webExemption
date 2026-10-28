
import entradaModel from '../models/entradaM.js';


async function getEntrada(req, res) {

    const result = await entradaModel.getEntradas();
        res.json(result);
}

async function getById(req, res) {
    const id = req.params.id;
    const result = await entradaModel.getById(id);
    res.json(result);
}

async function createEntrada(req, res) {
    const entrada = req.body;
    const result = await entradaModel.createEntrada(entrada);
    res.json(result);
    
    if (!(Number(req.body.quantidade) > 0) || (req.body.valor != null && Number(req.body.valor) < 0)) {
     return res.status(400).json({ erro: 'quantidade deve ser maior que 0 e valor não pode ser negativo' });
     }

}




export default {getEntrada, createEntrada,getById};