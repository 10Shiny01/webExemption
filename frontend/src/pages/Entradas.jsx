import { useMemo, useState } from 'react';
import { PackagePlus } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import Badge from '../components/Badge.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import produtoService from '../services/produtoS.js';
import entradaService from '../services/entradaS.js';
import {
  comSaldoEstimado,
  diasParaVencer,
  formatarData,
  formatarDataHora,
  formatarNumero,
  quantidadeDe,
  situacaoDoLote,
} from '../utils/estoque.js';

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const TOM_LOTE = { vencido: 'erro', proximo: 'aviso' };
const ROTULO_LOTE = { vencido: 'Vencido', proximo: 'Próximo do vencimento' };

export default function Entradas() {
  const produtos = useFetch(() => produtoService.listar(), []);
  const entradas = useFetch(() => entradaService.listar(), []);
  const { executando, executar } = useAcao();

  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [validade, setValidade] = useState('');
  const [valor, setValor] = useState('');
  const [erros, setErros] = useState({});

  const listaProdutos = useMemo(
    () =>
      [...(Array.isArray(produtos.dados) ? produtos.dados : [])].sort((a, b) =>
        String(a.nome).localeCompare(String(b.nome), 'pt-BR')
      ),
    [produtos.dados]
  );
  const unidades = useMemo(() => new Map(listaProdutos.map((p) => [p.produto_id, p.unidade])), [listaProdutos]);
  const selecionado = listaProdutos.find((p) => String(p.produto_id) === produto);

  const historico = useMemo(
    () => comSaldoEstimado(entradas.dados, produtos.dados).sort((a, b) => b.entrada_id - a.entrada_id),
    [entradas.dados, produtos.dados]
  );

  // Aviso (não bloqueia): a validade informada já passou.
  const validadeVencida = validade !== '' && diasParaVencer(validade) < 0;

  async function registrar(e) {
    e.preventDefault();
    const novos = {};
    if (!produto) novos.produto = 'Selecione o produto.';
    if (!quantidade || Number(quantidade) <= 0) novos.quantidade = 'Informe uma quantidade maior que zero.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    const { ok } = await executar(
      () =>
        entradaService.criar({
          id_produto: Number(produto),
          quantidade: Number(quantidade),
          fornecedor: fornecedor.trim() || null,
          validade: validade || null,
          valor: valor || null,
        }),
      'Entrada registrada.'
    );
    if (ok) {
      setProduto('');
      setQuantidade('');
      setFornecedor('');
      setValidade('');
      setValor('');
      entradas.recarregar();
      produtos.recarregar();
    }
  }

  const colunas = [
    { key: 'data_entrada', header: 'Data', render: (e) => formatarDataHora(e.data_entrada) },
    { key: 'produto_nome', header: 'Produto', render: (e) => <strong>{e.produto_nome}</strong> },
    {
      key: 'quantidade',
      header: 'Quantidade',
      className: 'col-num',
      render: (e) => `${formatarNumero(e.quantidade)} ${unidades.get(e.id_produto) ?? ''}`,
    },
    {
      key: 'saldo',
      header: 'Ainda em estoque',
      className: 'col-num',
      render: (e) => `${formatarNumero(e.saldo)} ${unidades.get(e.id_produto) ?? ''}`,
    },
    { key: 'fornecedor', header: 'Fornecedor', render: (e) => e.fornecedor || '—' },
    {
      key: 'validade',
      header: 'Validade',
      render: (e) => {
        const situacao = situacaoDoLote(e); // só avisa enquanto o lote ainda tem saldo
        return (
          <span className="selos">
            {formatarData(e.validade)}
            {TOM_LOTE[situacao] && <Badge tom={TOM_LOTE[situacao]}>{ROTULO_LOTE[situacao]}</Badge>}
          </span>
        );
      },
    },
    {
      key: 'valor',
      header: 'Valor',
      className: 'col-num',
      render: (e) =>
        e.valor != null ? <span style={{ color: 'var(--cor-erro)', fontWeight: 600 }}>{moeda(e.valor)}</span> : '—',
    },
  ];

  return (
    <>
      <PageHeader titulo="Entradas" descricao="Registre a chegada de produtos ao estoque. Cada entrada tem a sua própria validade." />

      <form className="painel" onSubmit={registrar} noValidate aria-labelledby="titulo-nova-entrada">
        <h2 id="titulo-nova-entrada">Nova entrada</h2>
        <div className="linha-campos linha-campos--4">
          <FormField label="Produto" as="select" value={produto} onChange={(e) => setProduto(e.target.value)} error={erros.produto}>
            <option value="">Selecione</option>
            {listaProdutos.map((p) => (
              <option key={p.produto_id} value={p.produto_id}>
                {p.nome} ({formatarNumero(quantidadeDe(p))} {p.unidade})
              </option>
            ))}
          </FormField>
          <FormField
            label={`Quantidade adicionada${selecionado ? ` (${selecionado.unidade})` : ''}`}
            type="number"
            min="0"
            step="any"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            error={erros.quantidade}
          />
          <FormField
            label="Valor (R$)"
            type="number"
            min="0"
            step="0.01"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            error={erros.valor}
          />
          <FormField
            label="Validade deste lote"
            type="date"
            value={validade}
            onChange={(e) => setValidade(e.target.value)}
            hint={
              validadeVencida
                ? 'Atenção: esta data já passou.'
                : 'Deixe em branco só se o item não tem prazo de validade.'
            }
          />
        </div>
        <FormField
          label="Fornecedor"
          value={fornecedor}
          onChange={(e) => setFornecedor(e.target.value)}
          hint="Opcional. A data da entrada é registrada automaticamente."
        />

        <Button type="submit" icon={PackagePlus} loading={executando}>
          Registrar entrada
        </Button>
      </form>

      <section className="secao" aria-labelledby="titulo-hist-entradas">
        <h2 id="titulo-hist-entradas">Histórico de entradas</h2>
        <DataTable
          legenda="Histórico de entradas"
          columns={colunas}
          rows={historico}
          rowKey="entrada_id"
          rowClassName={(e) => {
            const s = situacaoDoLote(e);
            return s === 'vencido' ? 'linha--erro' : s === 'proximo' ? 'linha--aviso' : '';
          }}
          carregando={entradas.carregando}
          erro={entradas.erro}
          onRetry={entradas.recarregar}
          vazio="Nenhuma entrada registrada ainda."
        />
      </section>
    </>
  );
}
