import entradaController from '../controllers/entradaC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const entradaRouter = router.Router();

entradaRouter.get('/api/system/', authMiddleware.verificarToken,entradaController.getEntrada);
entradaRouter.get('/api/system/:id', authMiddleware.verificarToken,entradaController.getById);
entradaRouter.post('/api/system/', authMiddleware.verificarToken,entradaController.createEntrada);


export default entradaRouter;