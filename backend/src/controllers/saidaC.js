
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
}

export default {getSaida, createSaida, getById};