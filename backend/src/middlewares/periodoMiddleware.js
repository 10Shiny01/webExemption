import { PERIODOS } from '../config/balanco.js';
import { AppError } from './errorMiddleware.js';

// Valida ?periodo= (padrão: semanal) e deixa o valor em req.periodo.
function validarPeriodo(req, res, next) {
    const periodo = String(req.query.periodo ?? 'semanal').toLowerCase();

    if (!PERIODOS[periodo]) {
        return next(
            new AppError(`Período inválido. Use: ${Object.keys(PERIODOS).join(' ou ')}.`, 400)
        );
    }

    req.periodo = periodo;
    next();
}

export default { validarPeriodo };
