import PDFDocument from 'pdfkit-table';

const MARGEM = 25;

/* ---------- utilidades ---------- */

const fmt = (v) => Number(v).toLocaleString('pt-BR');
const dataHora = (iso) => new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
const larguraUtil = (doc) => doc.page.width - MARGEM * 2;

function criarDocumento(dataCallback, endCallback) {
    // bufferPages permite numerar as páginas no final
    const doc = new PDFDocument({ size: 'A4', margin: MARGEM, bufferPages: true });
    doc.on('data', dataCallback);
    doc.on('end', endCallback);
    return doc;
}

function cabecalho(doc, titulo, subtitulo) {
    doc.font('Helvetica-Bold').fontSize(16).text(titulo, { align: 'center' });
    doc.font('Helvetica').fontSize(9).text(subtitulo, { align: 'center' });
    doc.moveDown(1);
}

function subtituloPeriodo(meta) {
    return `Período: ${meta.periodo} (últimos ${meta.dias_analisados} dias)  |  Gerado em ${dataHora(meta.gerado_em)}`;
}

function rodape(doc, texto) {
    const { start, count } = doc.bufferedPageRange();
    for (let i = start; i < start + count; i++) {
        doc.switchToPage(i);
        doc.page.margins.bottom = 0; // evita o pdfkit criar página nova ao escrever no rodapé
        doc.font('Helvetica').fontSize(8).fillColor('#555555').text(
            `${texto}  -  Página ${i - start + 1} de ${count}`,
            MARGEM,
            doc.page.height - 22,
            { width: larguraUtil(doc), align: 'center', lineBreak: false }
        );
    }
    doc.fillColor('black');
}

// pdfkit-table: doc.table() é assíncrono, por isso o await.
async function tabela(doc, headers, rows, columnsSize) {
    doc.x = MARGEM;
    await doc.table(
        { headers, rows },
        {
            x: MARGEM,
            width: larguraUtil(doc),
            columnsSize,
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
            prepareRow: () => doc.font('Helvetica').fontSize(8),
        }
    );
    doc.font('Helvetica').fontSize(10);
    doc.x = MARGEM;
    doc.moveDown(0.5);
}

function secaoTitulo(doc, texto) {
    if (doc.y > doc.page.height - 110) doc.addPage();
    doc.moveDown(0.8);
    doc.font('Helvetica-Bold').fontSize(11).text(texto, MARGEM, doc.y);
    doc.moveDown(0.4);
    doc.font('Helvetica').fontSize(10);
}

function paragrafo(doc, texto) {
    doc.font('Helvetica').fontSize(10).text(texto || '-', MARGEM, doc.y, { width: larguraUtil(doc) });
}

function lista(doc, itens, numerada = false) {
    if (!itens?.length) return paragrafo(doc, 'Nenhum item.');
    itens.forEach((t, i) => {
        doc.font('Helvetica').fontSize(10).text(`${numerada ? `${i + 1}.` : '•'} ${t}`, MARGEM, doc.y, {
            width: larguraUtil(doc),
        });
        doc.moveDown(0.2);
    });
}

async function tabelaProdutos(doc, titulo, itens) {
    secaoTitulo(doc, titulo);
    if (!itens?.length) return paragrafo(doc, 'Nenhum produto.');
    await tabela(doc, ['Produto', 'Motivo'], itens.map((i) => [i.nome, i.motivo || '-']), [180, larguraUtil(doc) - 180]);
}

/* ---------- 1) Relatório com todos os valores do estoque ---------- */

export async function buildEstoquePDF(dados, dataCallback, endCallback) {
    const doc = criarDocumento(dataCallback, endCallback);

    try {
        const { itens, totais, meta } = dados;
        cabecalho(doc, 'RELATÓRIO DE ESTOQUE', subtituloPeriodo(meta));

        // --- bloco de informações (esquerda) e gráfico de status (direita) ---
        const linhas = [
            `Produtos cadastrados: ${fmt(totais.produtos_cadastrados)}`,
            `Com estoque: ${fmt(totais.com_estoque)}`,
            `Sem estoque: ${fmt(totais.sem_estoque)}`,
            `Abaixo do mínimo: ${fmt(totais.abaixo_minimo)}`,
            `Total em estoque: ${
                Object.entries(totais.por_unidade)
                    .map(([un, v]) => `${fmt(v)} ${un}`)
                    .join(' | ') || '0'
            }`,
        ];

        const blocoY = doc.y;
        const esqW = 260;
        const dirX = MARGEM + esqW + 15;
        const dirW = larguraUtil(doc) - esqW - 15;
        const altura = Math.max(135, 45 + linhas.length * 17);

        doc.rect(MARGEM, blocoY, esqW, altura).stroke();
        doc.font('Helvetica-Bold').fontSize(12).text('INFORMAÇÕES', MARGEM + 15, blocoY + 12, { lineBreak: false });
        doc.font('Helvetica').fontSize(10);
        linhas.forEach((l, i) =>
            doc.text(l, MARGEM + 15, blocoY + 38 + i * 17, { width: esqW - 25, lineBreak: false })
        );

        doc.rect(dirX, blocoY, dirW, altura).stroke();
        doc.font('Helvetica-Bold').fontSize(12).text('STATUS DOS PRODUTOS', dirX, blocoY + 12, {
            width: dirW,
            align: 'center',
            lineBreak: false,
        });

        const barras = [
            { rotulo: 'OK', valor: totais.ok, cor: '#9ad29a' },
            { rotulo: 'Abaixo do mínimo', valor: totais.abaixo_minimo, cor: '#f2c76e' },
            { rotulo: 'Sem estoque', valor: totais.sem_estoque, cor: '#e88a8a' },
        ];
        const barW = 50;
        const gap = 40;
        const baseY = blocoY + altura - 28;
        const maxH = altura - 28 - 60;
        const inicioX = dirX + (dirW - (barras.length * barW + (barras.length - 1) * gap)) / 2;
        const maxValor = Math.max(...barras.map((b) => b.valor), 1);

        barras.forEach((b, i) => {
            const x = inicioX + i * (barW + gap);
            const h = (b.valor / maxValor) * maxH;
            doc.rect(x, baseY - h, barW, h).fillAndStroke(b.cor, '#000000');
            doc.fillColor('black').font('Helvetica').fontSize(8).text(String(b.valor), x, baseY - h - 12, {
                width: barW,
                align: 'center',
                lineBreak: false,
            });
            doc.fontSize(7).text(b.rotulo, x - 20, baseY + 5, { width: barW + 40, align: 'center', lineBreak: false });
        });

        doc.x = MARGEM;
        doc.y = blocoY + altura + 15;

        // --- tabela com todos os produtos ---
        doc.font('Helvetica-Bold').fontSize(11).text('PRODUTOS', MARGEM, doc.y);
        doc.moveDown(0.5);

        const comValidade = meta.validade_disponivel;
        const headers = ['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Entradas', 'Saídas', 'Status'];
        if (comValidade) headers.push('Validade');
        const tamanhos = comValidade ? [120, 70, 60, 60, 60, 60, 60, 55] : [140, 80, 65, 65, 65, 65, 65];

        if (!itens.length) {
            paragrafo(doc, 'Nenhum produto cadastrado.');
        } else {
            const rows = itens.map((p) => {
                const r = [
                    p.nome,
                    p.categoria,
                    `${fmt(p.estoque)} ${p.unidade}`,
                    `${fmt(p.estoque_minimo)} ${p.unidade}`,
                    `${fmt(p.entradas)} ${p.unidade}`,
                    `${fmt(p.saidas)} ${p.unidade}`,
                    p.status,
                ];
                if (comValidade) r.push(p.validade);
                return r;
            });
            await tabela(doc, headers, rows, tamanhos);
        }

        // --- maior movimentação ---
        secaoTitulo(doc, `MAIOR MOVIMENTAÇÃO (últimos ${meta.dias_analisados} dias)`);
        const movimentados = [...itens]
            .filter((p) => p.entradas + p.saidas > 0)
            .sort((a, b) => b.entradas + b.saidas - (a.entradas + a.saidas))
            .slice(0, 5);

        if (!movimentados.length) {
            paragrafo(doc, 'Sem movimentação no período.');
        } else {
            await tabela(
                doc,
                ['Produto', 'Entradas', 'Saídas', 'Estoque atual'],
                movimentados.map((p) => [
                    p.nome,
                    `${fmt(p.entradas)} ${p.unidade}`,
                    `${fmt(p.saidas)} ${p.unidade}`,
                    `${fmt(p.estoque)} ${p.unidade}`,
                ]),
                [215, 110, 110, 110]
            );
        }

        rodape(doc, 'Relatório de Estoque');
    } finally {
        doc.end();
    }
}

/* ---------- 2) Documento do Balanço Geral (texto da IA) ---------- */

export async function buildBalancoPDF(balanco, dataCallback, endCallback) {
    const doc = criarDocumento(dataCallback, endCallback);

    try {
        const { meta } = balanco;
        cabecalho(doc, 'BALANÇO GERAL DO ESTOQUE', subtituloPeriodo(meta));

        secaoTitulo(doc, 'RESUMO GERAL');
        paragrafo(doc, balanco.resumo);

        secaoTitulo(doc, 'SITUAÇÃO ATUAL');
        paragrafo(doc, balanco.situacao_atual);

        await tabelaProdutos(doc, 'PRODUTOS QUE PRECISAM DE REPOSIÇÃO', balanco.produtos_reposicao);
        await tabelaProdutos(doc, 'PRODUTOS COM ESTOQUE CRÍTICO', balanco.produtos_criticos);
        await tabelaProdutos(doc, 'PRODUTOS VENCIDOS OU PRÓXIMOS DO VENCIMENTO', balanco.produtos_proximos_validade);
        await tabelaProdutos(doc, 'PRODUTOS COM MAIOR MOVIMENTAÇÃO', balanco.maior_movimentacao);

        secaoTitulo(doc, 'POSSÍVEIS PROBLEMAS');
        lista(doc, balanco.problemas);

        secaoTitulo(doc, 'RECOMENDAÇÕES DE GERENCIAMENTO');
        lista(doc, balanco.recomendacoes);

        secaoTitulo(doc, 'PRIORIDADES DE AÇÃO');
        lista(doc, balanco.prioridades, true);

        doc.moveDown(1.5);
        doc.font('Helvetica-Oblique').fontSize(8).fillColor('#555555').text(
            meta.gerado_por === 'ia'
                ? 'Texto gerado por inteligência artificial a partir dos dados do sistema. Confira os valores antes de tomar decisões.'
                : 'Análise automática simples (a inteligência artificial não estava disponível no momento).',
            MARGEM,
            doc.y,
            { width: larguraUtil(doc) }
        );
        doc.fillColor('black');

        rodape(doc, 'Balanço Geral do Estoque');
    } finally {
        doc.end();
    }
}