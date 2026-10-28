import { useMemo, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import StatCard from '../components/StatCard.jsx';
import StateMessage from '../components/StateMessage.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import produtoService from '../services/produtoS.js';
import entradaService from '../services/entradaS.js';
import saidaService from '../services/saidaS.js';
import documentoService from '../services/documentoS.js';
import { formatarDataHora, formatarNumero, paraData } from '../utils/estoque.js';

const paraISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function periodoInicial() {
  const fim = new Date();
  const inicio = new Date();
  inicio.setDate(inicio.getDate() - 29);
  return { de: paraISO(inicio), ate: paraISO(fim) };
}

export default function Relatorios() {
  const { isAdmin } = useAuth();
  const [periodo, setPeriodo] = useState(periodoInicial);
  const [periodoPdf, setPeriodoPdf] = useState('semanal');
  const [valorE,setValorE] = useState();
  const [valorS,setValorS] = useState();
  const [valorTotal,setValorTotal] = useState();
  const produtos = useFetch(() => produtoService.listar(), []);
  const entradas = useFetch(() => entradaService.listar(), []);
  const saidas = useFetch(() => saidaService.listar(), []);

  const { executando, executar } = useAcao();

  const carregando = (produtos.carregando || entradas.carregando || saidas.carregando) && !entradas.dados;
  const erro = produtos.erro ?? entradas.erro ?? saidas.erro;

  const movimentos = useMemo(() => {
    const inicio = new Date(`${periodo.de}T00:00:00`);
    const fim = new Date(`${periodo.ate}T23:59:59`);
    const dentro = (valor) => {
      const data = paraData(valor);
      return data && data >= inicio && data <= fim;
    };
    const unidades = new Map((Array.isArray(produtos.dados) ? produtos.dados : []).map((p) => [p.produto_id, p.unidade]));
     const valorEntrada = new Map((Array.isArray(entradas.dados) ? entradas.dados : []).map((e) => [e.entrada_id, e.valor]));
     const valorSaida = new Map((Array.isArray(saidas.dados) ? saidas.dados : []).map((s) => [s.saida_id, s.valor]));


    const lista = [
      ...(Array.isArray(entradas.dados) ? entradas.dados : [])
        .filter((e) => dentro(e.data_entrada))
        .map((e) => ({
          chave: `e-${e.entrada_id}`,
          tipo: 'entrada',
          data: e.data_entrada,
          produto: e.produto_nome,
          quantidade: Number(e.quantidade),
          unidade: unidades.get(e.id_produto) ?? '',
          detalhe: e.fornecedor || '—',
          valorE: Number(e.valor),
        })),
      ...(Array.isArray(saidas.dados) ? saidas.dados : [])
        .filter((s) => dentro(s.data_saida))
        .map((s) => ({
          chave: `s-${s.saida_id}`,
          tipo: 'saida',
          data: s.data_saida,
          produto: s.produto_nome,
          quantidade: Number(s.quantidade),
          unidade: unidades.get(s.id_produto) ?? '',
          detalhe: s.observacao || s.usuario_nome || '—',
          valorS: Number(s.valor),
        })),
    ];
    return lista.sort((a, b) => paraData(b.data) - paraData(a.data));
  }, [entradas.dados, saidas.dados, produtos.dados, periodo]);

  const resumo = useMemo(() => {
    const porProduto = new Map();
    const porDia = new Map();
    movimentos.forEach((m) => {
      const item = porProduto.get(m.produto) ?? { produto: m.produto, unidade: m.unidade,valorEntrada:m.valorE,valorSaida:m.valorS ,entradas: 0, saidas: 0 ,valorE:0 ,valorS:0 ,valorTotal:0};
      if (m.tipo === 'entrada'){ 
        item.entradas += m.quantidade;
        item.valorE += m.valorE;
      }
      else{ 
        item.saidas += m.quantidade;
        item.valorS += m.valorS;
      }
      porProduto.set(m.produto, item);
      item.valorTotal = item.valorS - item.valorE;
     
      const dia = paraISO(paraData(m.data));
      const registro = porDia.get(dia) ?? { dia, entradas: 0, saidas: 0 };
      registro[m.tipo === 'entrada' ? 'entradas' : 'saidas'] += 1;
      porDia.set(dia, registro);
    });
    return {
      totalEntradas: movimentos.filter((m) => m.tipo === 'entrada').length,
      totalSaidas: movimentos.filter((m) => m.tipo === 'saida').length,
      produtos: [...porProduto.values()].sort((a, b) => a.produto.localeCompare(b.produto)),
      dias: [...porDia.values()].sort((a, b) => a.dia.localeCompare(b.dia)),
    };
  }, [movimentos]);

  const maiorDia = Math.max(1, ...resumo.dias.map((d) => Math.max(d.entradas, d.saidas)));
  const periodoInvalido = periodo.de > periodo.ate;

  const colunasProduto = [
    { key: 'produto', header: 'Produto' },
    { key: 'entradas', header: 'Entrou', render: (p) => `${formatarNumero(p.entradas)} ${p.unidade}` },
    { key: 'saidas', header: 'Saiu', render: (p) => `${formatarNumero(p.saidas)} ${p.unidade}` },
    { key: 'valorTotal', header:'Valor Total',render: (p) =>formatarNumero(p.valorTotal)},
  ];

  const colunasHistorico = [
    { key: 'data', header: 'Data', render: (m) => formatarDataHora(m.data) },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (m) => <Badge tom={m.tipo === 'entrada' ? 'ok' : 'aviso'}>{m.tipo === 'entrada' ? 'Entrada' : 'Saída'}</Badge>,
    },
    { key: 'produto', header: 'Produto' },
    { key: 'quantidade', header: 'Quantidade', render: (m) => `${formatarNumero(m.quantidade)} ${m.unidade}` },
    { key: 'detalhe', header: 'Fornecedor / observação' },
    { key: 'valorS', header:'Valor Saida'},
    { key: 'valorE', header:'Valor Entrada'},
  ];

  return (
    <>
      <PageHeader titulo="Relatórios" descricao="Movimentação do estoque por período." />

      <div className="barra">
        <FormField label="De" type="date" value={periodo.de} onChange={(e) => setPeriodo({ ...periodo, de: e.target.value })} />
        <FormField label="Até" type="date" value={periodo.ate} onChange={(e) => setPeriodo({ ...periodo, ate: e.target.value })} />
      </div>
      {periodoInvalido && <p className="campo__erro">A data inicial deve ser anterior à data final.</p>}

      {carregando && <StateMessage tipo="carregando" />}
      {erro && <StateMessage tipo="erro" mensagem={erro} onRetry={() => [produtos, entradas, saidas].forEach((f) => f.recarregar())} />}

      {!carregando && !erro && !periodoInvalido && (
        <>
          <div className="grade grade--indicadores">
            <StatCard icon={FileText} rotulo="Entradas no período" valor={resumo.totalEntradas} detalhe="registros" />
            <StatCard icon={FileText} rotulo="Saídas no período" valor={resumo.totalSaidas} detalhe="registros" />
          </div>

          {resumo.dias.length >= 2 && (
            <section className="secao" aria-labelledby="titulo-grafico">
              <h2 id="titulo-grafico">Registros por dia</h2>
              <div className="painel">
                <div className="grafico" role="img" aria-label="Gráfico de barras com o número de entradas e saídas por dia">
                  {resumo.dias.map((d) => (
                    <div className="grafico__dia" key={d.dia}>
                      <div className="grafico__barras">
                        <span className="grafico__barra grafico__barra--entrada" style={{ height: `${(d.entradas / maiorDia) * 100}%` }} />
                        <span className="grafico__barra grafico__barra--saida" style={{ height: `${(d.saidas / maiorDia) * 100}%` }} />
                      </div>
                      <span className="grafico__rotulo">{d.dia.slice(8, 10)}/{d.dia.slice(5, 7)}</span>
                    </div>
                  ))}
                </div>
                <p className="grafico__legenda">
                  <span className="grafico__chave grafico__chave--entrada" /> Entradas
                  <span className="grafico__chave grafico__chave--saida" /> Saídas
                </p>
              </div>
            </section>
          )}

          <section className="secao" aria-labelledby="titulo-por-produto">
            <h2 id="titulo-por-produto">Resumo por produto</h2>
            <DataTable
              legenda="Entradas e saídas por produto"
              columns={colunasProduto}
              rows={resumo.produtos.map((p) => ({ ...p, id: p.produto }))}
              rowKey="id"
              vazio="Nenhuma movimentação no período."
            />
          </section>

          <section className="secao" aria-labelledby="titulo-historico">
            <h2 id="titulo-historico">Histórico de movimentações</h2>
            <DataTable
              legenda="Histórico de movimentações"
              columns={colunasHistorico}
              rows={movimentos}
              rowKey="chave"
              vazio="Nenhuma movimentação no período."
            />
          </section>
        </>
      )}

      {isAdmin && (
        <section className="secao" aria-labelledby="titulo-pdf">
          <h2 id="titulo-pdf">Documentos em PDF</h2>
          <div className="painel">
            <FormField label="Período do documento" as="select" value={periodoPdf} onChange={(e) => setPeriodoPdf(e.target.value)}>
              <option value="semanal">Semanal (7 dias)</option>
              <option value="mensal">Mensal (30 dias)</option>
            </FormField>
            <div className="barra__botoes">
              <Button icon={Download} variant="secundario" loading={executando} onClick={() => executar(() => documentoService.relatorioEstoque(periodoPdf), 'Relatório de estoque baixado.')}>
                Relatório de estoque
              </Button>
              <Button icon={Download} variant="secundario" loading={executando} onClick={() => executar(() => documentoService.balanco(periodoPdf), 'Balanço geral baixado.')}>
                Balanço geral
              </Button>
            </div>
            <p className="texto-suave">O balanço em PDF usa a análise da IA e pode levar alguns segundos.</p>
          </div>
        </section>
      )}
    </>
  );
}
