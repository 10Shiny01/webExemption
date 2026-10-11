// Erro com status HTTP (ex.: 400 para parâmetro inválido).
export class AppError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.status = status;
    }
}

// Deve ser registrado no app.js DEPOIS de todas as rotas.
function errorHandler(err, req, res, next) {
    const status = err.status || 500;
    if (status >= 500) console.error('[ERRO]', err);

    res.status(status).json({
        erro: status >= 500 ? 'Erro interno ao gerar o balanço.' : err.message,
    });
}

export default { errorHandler };
