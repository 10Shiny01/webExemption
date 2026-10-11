import receitaControle from '../controllers/receitaC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const receitaRouter = router.Router();
//rotas para receitas

receitaRouter.get('/api/system/',authMiddleware.verificarToken, receitaControle.getReceita);
receitaRouter.get('/api/system/:id', authMiddleware.verificarToken, receitaControle.getById);
receitaRouter.get('/api/system/nome/:nome', authMiddleware.verificarToken, receitaControle.getByNome);
receitaRouter.post('/api/system/', authMiddleware.verificarToken, receitaControle.createReceita);
receitaRouter.delete('/api/system/:id', authMiddleware.verificarToken, receitaControle.deleteReceita);
receitaRouter.put('/api/system/:id', authMiddleware.verificarToken, receitaControle.updateReceita);

//rotas de uso

receitaRouter.post('/api/system/uso/:id', authMiddleware.verificarToken, receitaControle.usoReceita);

export default receitaRouter;