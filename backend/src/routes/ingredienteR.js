
import ingredienteControle from '../controllers/ingredienteC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';

const ingredienteRouter = router.Router();


ingredienteRouter.post('/api/system/', authMiddleware.verificarToken, ingredienteControle.createIngrediente);
ingredienteRouter.get('/api/system/', authMiddleware.verificarToken, ingredienteControle.getIngredientes);
ingredienteRouter.get('/api/system/:id', authMiddleware.verificarToken, ingredienteControle.getById);
ingredienteRouter.get('/api/system/nome/:nome', authMiddleware.verificarToken, ingredienteControle.getByNome);
ingredienteRouter.delete('/api/system/:id', authMiddleware.verificarToken, ingredienteControle.deleteIngrediente);
ingredienteRouter.put('/api/system/:id', authMiddleware.verificarToken, ingredienteControle.updateIngrediente);

export default ingredienteRouter;