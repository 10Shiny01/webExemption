import { gerarBalanco } from '../services/balancoS.js';

async function getBalanco(req, res, next) {
    try {
        const balanco = await gerarBalanco(req.periodo);
        res.json(balanco);
    } catch (error) {
        next(error); // vai para o errorHandler
    }
}

export default { getBalanco };
