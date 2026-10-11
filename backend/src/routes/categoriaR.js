
import categoriaController from '../controllers/categoriaC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const categoriaRouter = router.Router();

categoriaRouter.get('/api/system/', authMiddleware.verificarToken, categoriaController.getCategoria);
categoriaRouter.post('/api/system/', authMiddleware.verificarToken, categoriaController.createCategoria);
categoriaRouter.put('/api/system/:id', authMiddleware.verificarToken, categoriaController.updateCategoria);
categoriaRouter.delete('/api/system/:id', authMiddleware.verificarToken, categoriaController.deleteCategoria);

export default categoriaRouter;
