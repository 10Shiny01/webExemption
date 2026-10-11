
import produtoController from '../controllers/produtoC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const produtoRouter = router.Router();

produtoRouter.get('/api/system/', authMiddleware.verificarToken,produtoController.getProduto);
produtoRouter.post('/api/system/', authMiddleware.verificarToken,produtoController.createProduto);
produtoRouter.put('/api/system/:id', authMiddleware.verificarToken, produtoController.updateProduto);
produtoRouter.delete('/api/system/:id', authMiddleware.verificarToken, produtoController.deleteProduto);

export default produtoRouter;