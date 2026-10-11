import saidaController from '../controllers/saidaC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const saidaRouter = router.Router();

saidaRouter.get('/api/system/', authMiddleware.verificarToken, saidaController.getSaida);
saidaRouter.get('/api/system/:id', authMiddleware.verificarToken, saidaController.getById);
saidaRouter.post('/api/system/', authMiddleware.verificarToken, saidaController.createSaida);


export default saidaRouter;