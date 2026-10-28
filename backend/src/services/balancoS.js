import { aiConfig } from '../config/ai.js';
import { PERIODOS, DIAS_ALERTA_VALIDADE } from '../config/balanco.js';
import balancoModel from '../models/balancoM.js';

/* ---------- 1. Resumo estruturado (cálculos feitos aqui, não pela IA) ---------- */

function diasAteVencer(validade) {
    if (!validade) return null;
    const v = new Date(validade);
    const h = new Date();
    const dv = Date.UTC(v.getFullYear(), v.getMonth(), v.getDate());
    const dh = Date.UTC(h.getFullYear(), h.getMonth(), h.getDate());
    return Math.round((dv - dh) / 86400000);
}

export function montarResumo(produtos, movimentacao, periodo, validadeDisponivel = true) {
    const movPorId = new Map(
        movimentacao.map((m) => [
            m.produto_id,
            {
                entradas: Number(m.entradas),
                saidas: Number(m.saidas),
                valor_entradas: Number(m.valor_entradas),
                valor_saidas: Number(m.valor_saidas),
            },
        ])
    );

    const lista = produtos.map((p) => ({
        nome: p.nome,
        categoria: p.categoria ?? null,
        unidade: p.unidade,
        estoque: Number(p.estoque),
        estoque_minimo: Number(p.estoque_minimo ?? 0),
        dias_para_vencer: diasAteVencer(p.validade),
        ...(movPorId.get(p.produto_id) ?? { entradas: 0, saidas: 0, valor_entradas: 0, valor_saidas: 0 }),
    }));

    const gasto = lista.reduce((t, p) => t + p.valor_entradas, 0);
    const ganho = lista.reduce((t, p) => t + p.valor_saidas, 0);

    const slim = (p, extra = {}) => ({ nome: p.nome, unidade: p.unidade, estoque: p.estoque, ...extra });

    const zerados = lista
        .filter((p) => p.estoque === 0)
        .map((p) => slim(p, { estoque_minimo: p.estoque_minimo }));

    const abaixoMinimo = lista
        .filter((p) => p.estoque > 0 && p.estoque < p.estoque_minimo)
        .map((p) => slim(p, { estoque_minimo: p.estoque_minimo, falta: p.estoque_minimo - p.estoque }));

    const vencidos = lista
        .filter((p) => p.estoque > 0 && p.dias_para_vencer !== null && p.dias_para_vencer < 0)
        .map((p) => slim(p, { dias_vencido: Math.abs(p.dias_para_vencer) }));

    const proximosValidade = lista
        .filter(
            (p) =>
                p.estoque > 0 &&
                p.dias_para_vencer !== null &&
                p.dias_para_vencer >= 0 &&
                p.dias_para_vencer <= DIAS_ALERTA_VALIDADE
        )
        .sort((a, b) => a.dias_para_vencer - b.dias_para_vencer)
        .map((p) => slim(p, { dias_para_vencer: p.dias_para_vencer }));

    const maiorMovimentacao = lista
        .filter((p) => p.entradas + p.saidas > 0)
        .sort((a, b) => b.entradas + b.saidas - (a.entradas + a.saidas))
        .slice(0, 5)
        .map((p) =>
            slim(p, {
                entradas: p.entradas,
                saidas: p.saidas,
                valor_entradas: p.valor_entradas,
                valor_saidas: p.valor_saidas,
            })
        );

    const semMovimentacao = lista.filter((p) => p.estoque > 0 && p.entradas + p.saidas === 0);

    // Problemas detectados pelo backend (a IA apenas interpreta)
    const problemas = [];
    if (!validadeDisponivel)
        problemas.push('O sistema ainda não registra a validade dos produtos: não é possível avaliar vencimentos.');
    lista
        .filter((p) => p.estoque < 0)
        .forEach((p) =>
            problemas.push(`Estoque negativo em "${p.nome}" (${p.estoque}): possível inconsistência de registros.`)
        );
    lista
        .filter((p) => p.estoque === 0 && p.saidas > 0)
        .forEach((p) =>
            problemas.push(`"${p.nome}" está zerado e teve saídas no período: possível ruptura de estoque.`)
        );
    if (vencidos.length) problemas.push(`${vencidos.length} produto(s) vencido(s) ainda constam em estoque.`);
    if (semMovimentacao.length)
        problemas.push(`${semMovimentacao.length} produto(s) com estoque e nenhuma movimentação no período.`);

    return {
        periodo,
        dias_analisados: PERIODOS[periodo],
        validade_disponivel: validadeDisponivel,
        dias_alerta_validade: DIAS_ALERTA_VALIDADE,
        valores: { gasto_entradas: gasto, ganho_saidas: ganho, saldo: ganho - gasto },
        totais: {
            produtos_cadastrados: lista.length,
            produtos_disponiveis: lista.filter((p) => p.estoque > 0).length,
            produtos_zerados: zerados.length,
            produtos_abaixo_minimo: abaixoMinimo.length,
            produtos_vencidos: vencidos.length,
            produtos_proximos_validade: proximosValidade.length,
        },
        zerados,
        abaixo_minimo: abaixoMinimo,
        vencidos,
        proximos_validade: proximosValidade,
        maior_movimentacao: maiorMovimentacao,
        sem_movimentacao: semMovimentacao.slice(0, 10).map((p) => p.nome),
        problemas_detectados: problemas,
    };
}

/* ---------- 2. Chamada à IA ---------- */

const SYSTEM_PROMPT = `Você é um analista de estoque de uma padaria. Escreva em português, com linguagem simples e objetiva.
REGRAS OBRIGATÓRIAS:
- Use SOMENTE os dados do JSON recebido. Não invente produtos, números, datas ou causas.
- Se um dado não estiver no JSON, não o mencione.
- Se "validade_disponivel" for false, não comente sobre vencimentos além de informar que a validade não é registrada.
- Você apenas analisa e recomenda. Não execute nem sugira alterações diretas no banco de dados.
- Em listas de produtos, use exatamente o nome que aparece no JSON.
Responda APENAS com um JSON válido, sem texto fora dele, neste formato:
{
  "resumo": "texto curto com o panorama geral",
  "situacao_atual": "texto curto (ex.: estável, atenção, crítica) com justificativa",
  "produtos_reposicao": [{"nome": "", "motivo": ""}],
  "produtos_criticos": [{"nome": "", "motivo": ""}],
  "produtos_proximos_validade": [{"nome": "", "motivo": ""}],
  "maior_movimentacao": [{"nome": "", "motivo": ""}],
  "problemas": ["texto"],
  "recomendacoes": ["texto"],
  "prioridades": ["ação 1 (mais urgente)", "ação 2"]
}`;

async function chamarIA(resumo) {
    const { url, apiKey, model, timeoutMs } = aiConfig;
    if (!url || !apiKey || !model) throw new Error('API de IA não configurada (.env).');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
                model,
                temperature: 0.2,
                response_format: { type: 'json_object' },
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Dados do estoque:\n${JSON.stringify(resumo)}` },
                ],
            }),
            signal: controller.signal,
        });

        if (!resp.ok) throw new Error(`API de IA respondeu com status ${resp.status}.`);

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error('API de IA retornou resposta vazia.');
        return content;
    } finally {
        clearTimeout(timer);
    }
}

/* ---------- 3. Validação da resposta da IA ---------- */

export function validarBalanco(conteudo, resumo) {
    const limpo = conteudo.replace(/```json|```/g, '').trim();
    const raw = JSON.parse(limpo);

    if (typeof raw?.resumo !== 'string' || !raw.resumo.trim())
        throw new Error('Resposta da IA sem o campo "resumo".');

    const nomesValidos = new Set(
        [
            ...resumo.zerados,
            ...resumo.abaixo_minimo,
            ...resumo.vencidos,
            ...resumo.proximos_validade,
            ...resumo.maior_movimentacao,
        ].map((p) => p.nome)
    );

    const arr = (v) => (Array.isArray(v) ? v : []);
    const produtos = (v) =>
        arr(v)
            .filter((i) => typeof i?.nome === 'string' && nomesValidos.has(i.nome)) // descarta nomes inventados
            .map((i) => ({ nome: i.nome, motivo: String(i.motivo ?? '') }));
    const textos = (v) => arr(v).filter((t) => typeof t === 'string' && t.trim());
    const valoresPorNome = new Map(
        resumo.maior_movimentacao.map((p) => [p.nome, { valor_entradas: p.valor_entradas, valor_saidas: p.valor_saidas }])
    );

    return {
        resumo: raw.resumo,
        situacao_atual: String(raw.situacao_atual ?? ''),
        produtos_reposicao: produtos(raw.produtos_reposicao),
        produtos_criticos: produtos(raw.produtos_criticos),
        produtos_proximos_validade: produtos(raw.produtos_proximos_validade),
        maior_movimentacao: produtos(raw.maior_movimentacao).map((i) => ({ ...i, ...(valoresPorNome.get(i.nome) ?? {}) })),
        problemas: textos(raw.problemas),
        recomendacoes: textos(raw.recomendacoes),
        prioridades: textos(raw.prioridades),
    };
}

/* ---------- 4. Contingência (se a IA falhar) ---------- */

function balancoBasico(r) {
    const t = r.totais;
    const item = (txt) => (p) => ({ nome: p.nome, motivo: txt(p) });

    const prioridades = [];
    if (t.produtos_vencidos) prioridades.push('Retirar do estoque os produtos vencidos.');
    if (t.produtos_zerados) prioridades.push('Repor os produtos com estoque zerado.');
    if (t.produtos_abaixo_minimo) prioridades.push('Repor os produtos abaixo do estoque mínimo.');
    if (t.produtos_proximos_validade) prioridades.push('Priorizar o uso dos produtos próximos da validade.');

    const validade = r.validade_disponivel
        ? `${t.produtos_vencidos} vencido(s) e ${t.produtos_proximos_validade} próximo(s) do vencimento`
        : 'validade não registrada no sistema';

    return {
        resumo: `${t.produtos_disponiveis} de ${t.produtos_cadastrados} produtos disponíveis; ${t.produtos_zerados} zerado(s), ${t.produtos_abaixo_minimo} abaixo do mínimo; ${validade}.`,
        situacao_atual: 'Análise automática simples (a IA não estava disponível).',
        produtos_reposicao: r.abaixo_minimo.map(item((p) => `Faltam ${p.falta} ${p.unidade} para o mínimo.`)),
        produtos_criticos: r.zerados.map(item(() => 'Estoque zerado.')),
        produtos_proximos_validade: [
            ...r.vencidos.map(item((p) => `Vencido há ${p.dias_vencido} dia(s).`)),
            ...r.proximos_validade.map(item((p) => `Vence em ${p.dias_para_vencer} dia(s).`)),
        ],
        maior_movimentacao: r.maior_movimentacao.map((p) => ({
            nome: p.nome,
            motivo: `${p.entradas} ${p.unidade} de entrada e ${p.saidas} ${p.unidade} de saída.`,
            valor_entradas: p.valor_entradas,
            valor_saidas: p.valor_saidas,
        })),
        problemas: r.problemas_detectados,
        recomendacoes: [],
        prioridades,
    };
}

/* ---------- 5. Valores em reais (lista de textos, igual às outras listas) ---------- */

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function textosValores(v) {
    return [
        `Gasto com entradas: ${moeda(v.gasto_entradas)}`,
        `Ganho com saídas: ${moeda(v.ganho_saidas)}`,
        `Saldo (saídas - entradas): ${moeda(v.saldo)}`,
    ];
}

/* ---------- 6. Orquestração ---------- */

export async function gerarBalanco(periodo) {
    const dias = PERIODOS[periodo];

    const [{ produtos, validadeDisponivel }, movimentacao] = await Promise.all([
        balancoModel.buscarProdutos(),
        balancoModel.buscarMovimentacao(dias),
    ]);

    const resumo = montarResumo(produtos, movimentacao, periodo, validadeDisponivel);

    let balanco;
    let geradoPor = 'ia';
    try {
        balanco = validarBalanco(await chamarIA(resumo), resumo);
    } catch (error) {
        console.error('[BALANCO] Falha na IA, usando contingencia:', error.message);
        balanco = balancoBasico(resumo);
        geradoPor = 'contingencia';
    }

    return {
        ...balanco,
        valores: textosValores(resumo.valores),
        meta: {
            periodo,
            dias_analisados: dias,
            gerado_em: new Date().toISOString(),
            gerado_por: geradoPor,
        },
    };
}
