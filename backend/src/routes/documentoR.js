import Router  from 'express';
import documentoController from '../controllers/documentoC.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import periodoMiddleware from '../middlewares/periodoMiddleware.js';

const documentoRouter = Router();

// Relatório com todos os valores do estoque (dados reais do banco)
documentoRouter.get('/api/system/',authMiddleware.verificarToken,authMiddleware.somenteAdm,periodoMiddleware.validarPeriodo,documentoController.getRelatorioEstoque);

// Balanço Geral (texto da IA) em PDF
documentoRouter.get('/api/system/balanco',authMiddleware.verificarToken,authMiddleware.somenteAdm,periodoMiddleware.validarPeriodo,documentoController.getBalancoPDF);

export default documentoRouter;