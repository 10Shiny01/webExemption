import { useMemo, useState } from 'react';
import { PackageMinus } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import FormField from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import produtoService from '../services/produtoS.js';
import saidaService from '../services/saidaS.js';
import { formatarDataHora, formatarNumero, quantidadeDe } from '../utils/estoque.js';

export default function Saidas() {
  const { usuario } = useAuth();
  const produtos = useFetch(() => produtoService.listar(), []);
  const saidas = useFetch(() => saidaService.listar(), []);
  const { executando, executar } = useAcao();

  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [observacao, setObservacao] = useState('');
  const [erros, setErros] = useState({});

  const listaProdutos = Array.isArray(produtos.dados) ? produtos.dados : [];
  const unidades = useMemo(() => new Map(listaProdutos.map((p) => [p.produto_id, p.unidade])), [listaProdutos]);
  const selecionado = listaProdutos.find((p) => String(p.produto_id) === produto);

  const historico = useMemo(
    () => [...(Array.isArray(saidas.dados) ? saidas.dados : [])].sort((a, b) => b.saida_id - a.saida_id),
    [saidas.dados]
  );

  async function registrar(e) {
    e.preventDefault();
    const novos = {};
    if (!produto) novos.produto = 'Selecione o produto.';
    if (!quantidade || Number(quantidade) <= 0) novos.quantidade = 'Informe uma quantidade maior que zero.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    const { ok } = await executar(
      () =>
        saidaService.criar({
          id_produto: Number(produto),
          id_usuario: usuario.id, // funcionário responsável = usuário autenticado
          quantidade: Number(quantidade),
          observacao: observacao.trim() || null,
        }),
      'Saída registrada.'
    );
    if (ok) {
      setProduto('');
      setQuantidade('');
      setObservacao('');
      saidas.recarregar();
      produtos.recarregar();
    }
  }

  const colunas = [
    { key: 'data_saida', header: 'Data', render: (s) => formatarDataHora(s.data_saida) },
    { key: 'produto_nome', header: 'Produto' },
    {
      key: 'quantidade',
      header: 'Quantidade',
      render: (s) => `${formatarNumero(s.quantidade)} ${unidades.get(s.id_produto) ?? ''}`,
    },
    { key: 'usuario_nome', header: 'Responsável' },
    { key: 'observacao', header: 'Observação', render: (s) => s.observacao || '—' },
  ];

  return (
    <>
      <PageHeader titulo="Saídas e retiradas" descricao="Registre os produtos retirados do estoque." />

      <form className="painel" onSubmit={registrar} noValidate aria-labelledby="titulo-nova-saida">
        <h2 id="titulo-nova-saida">Nova saída</h2>
        <div className="linha-campos linha-campos--3">
          <FormField label="Produto" as="select" value={produto} onChange={(e) => setProduto(e.target.value)} error={erros.produto}>
            <option value="">Selecione</option>
            {listaProdutos.map((p) => (
              <option key={p.produto_id} value={p.produto_id}>
                {p.nome} ({formatarNumero(quantidadeDe(p))} {p.unidade})
              </option>
            ))}
          </FormField>
          <FormField
            label={`Quantidade retirada${selecionado ? ` (${selecionado.unidade})` : ''}`}
            type="number"
            min="0"
            step="any"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            error={erros.quantidade}
          />
          <FormField label="Responsável" value={usuario?.nome ?? ''} disabled readOnly />
        </div>
        <FormField
          label="Observação"
          as="textarea"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          hint="Opcional. A data da saída é registrada automaticamente."
        />
        <Button type="submit" icon={PackageMinus} loading={executando}>
          Registrar saída
        </Button>
      </form>

      <section className="secao" aria-labelledby="titulo-hist-saidas">
        <h2 id="titulo-hist-saidas">Histórico de saídas</h2>
        <DataTable
          legenda="Histórico de saídas"
          columns={colunas}
          rows={historico}
          rowKey="saida_id"
          carregando={saidas.carregando}
          erro={saidas.erro}
          onRetry={saidas.recarregar}
          vazio="Nenhuma saída registrada ainda."
        />
      </section>
    </>
  );
}
