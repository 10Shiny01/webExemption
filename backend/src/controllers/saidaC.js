
import saidaModel from '../models/saidaM.js';


async function getSaida(req, res) {
        const result = await saidaModel.getSaida();
        res.json(result);
}

async function getById(req, res) {
    const id = req.params.id;
    const result = await saidaModel.getById(id);
    res.json(result);
}

async function createSaida(req, res) {
    const saida = req.body;
    const result = await saidaModel.createSaida(saida);
    res.json(result);
    
if (!(Number(req.body.quantidade) > 0) || (req.body.valor != null && Number(req.body.valor) < 0)) {
    return res.status(400).json({ erro: 'quantidade deve ser maior que 0 e valor não pode ser negativo' });
}
}

export default {getSaida, createSaida, getById};