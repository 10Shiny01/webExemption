import usuarioController from '../controllers/usuarioC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import router from 'express';
import rateLimit from 'express-rate-limit';

const limiteLogin = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { erro: 'Muitas tentativas. Tente de novo em 15 minutos.' } });
const usuarioRouter = router.Router();

// Rota pública: login
usuarioRouter.post('/api/system/login', limiteLogin, usuarioController.login);
usuarioRouter.get('/api/system/login', usuarioController.logout);
// Rotas protegidas: exigem token válido.
// Cadastro de usuário é feito apenas pelo estabelecimento (usuário adm autenticado),
// por isso createUsuario também exige token + perfil adm.
usuarioRouter.get('/api/system/', authMiddleware.verificarToken, usuarioController.getUsuario);
usuarioRouter.post('/api/system/', authMiddleware.verificarToken, authMiddleware.somenteAdm,usuarioController.createUsuario);
usuarioRouter.put('/api/system/:id', authMiddleware.verificarToken, authMiddleware.somenteAdm, usuarioController.updateUsuario);
usuarioRouter.delete('/api/system/:id', authMiddleware.verificarToken, authMiddleware.somenteAdm, usuarioController.deleteUsuario);
usuarioRouter.get('/api/system/:id', authMiddleware.verificarToken, usuarioController.getNome);



export default usuarioRouter;
