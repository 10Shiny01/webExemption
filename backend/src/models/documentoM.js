import { buildEstoquePDF, buildBalancoPDF } from '../libs/documento.js';

// Cada função escreve o PDF direto na resposta (res) à medida que ele é gerado.
function gerarRelatorioEstoque(dados, res) {
    return buildEstoquePDF(
        dados,
        (data) => res.write(data),
        () => res.end()
    );
}

function gerarBalanco(balanco, res) {
    return buildBalancoPDF(
        balanco,
        (data) => res.write(data),
        () => res.end()
    );
}

export default { gerarRelatorioEstoque, gerarBalanco };