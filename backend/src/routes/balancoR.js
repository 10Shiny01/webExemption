import { Router } from 'express';
import balancoController from '../controllers/balancoC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import periodoMiddleware from '../middlewares/periodoMiddleware.js';

const balancoRouter = Router();

// Para liberar só para administradores, adicione authMiddleware.somenteAdm
// depois de verificarToken (igual está na rota de documento).
balancoRouter.get( '/api/system/', authMiddleware.verificarToken, periodoMiddleware.validarPeriodo, balancoController.getBalanco);

export default balancoRouter;
