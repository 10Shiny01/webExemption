import documentoModel from '../models/documentoM.js';
import { obterRelatorioEstoque, obterBalancoDocumento } from '../services/documentoS.js';

function cabecalhosPDF(res, nomeArquivo) {
    res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${nomeArquivo}`,
    });
}

// Os dados são buscados ANTES de enviar os cabeçalhos: se o banco falhar,
// ainda dá para responder um erro em JSON em vez de um PDF quebrado.
async function getRelatorioEstoque(req, res, next) {
    try {
        const dados = await obterRelatorioEstoque(req.periodo);
        cabecalhosPDF(res, `relatorio-estoque-${req.periodo}.pdf`);
        await documentoModel.gerarRelatorioEstoque(dados, res);
    } catch (error) {
        if (res.headersSent) {
            console.error('[PDF] Erro durante a geração:', error);
            return res.end();
        }
        next(error);
    }
}

async function getBalancoPDF(req, res, next) {
    try {
        const balanco = await obterBalancoDocumento(req.periodo);
        cabecalhosPDF(res, `balanco-geral-${req.periodo}.pdf`);
        await documentoModel.gerarBalanco(balanco, res);
    } catch (error) {
        if (res.headersSent) {
            console.error('[PDF] Erro durante a geração:', error);
            return res.end();
        }
        next(error);
    }
}

export default { getRelatorioEstoque, getBalancoPDF };