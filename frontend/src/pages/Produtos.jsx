import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import produtoService from '../services/produtoS.js';
import categoriaService from '../services/categoriaS.js';
import {
  ROTULO_SITUACAO,
  TOM_SITUACAO,
  UNIDADES,
  formatarData,
  formatarNumero,
  podeExcluir,
  quantidadeDe,
  situacoesDe,
} from '../utils/estoque.js';

function ProdutoForm({ produto, categorias, salvando, onSalvar, onClose }) {
  const [nome, setNome] = useState(produto?.nome ?? '');
  const [unidade, setUnidade] = useState(String(Math.max(UNIDADES.indexOf(produto?.unidade), 0)));
  const [minimo, setMinimo] = useState(String(produto?.estoque_minimo ?? 0));
  const [categoria, setCategoria] = useState(produto?.id_categoria ? String(produto.id_categoria) : '');
  const [erros, setErros] = useState({});

  function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!nome.trim()) novos.nome = 'Informe o nome do produto.';
    if (minimo === '' || Number(minimo) < 0) novos.minimo = 'Informe um estoque mínimo válido.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    onSalvar({
      nome: nome.trim(),
      unidade: Number(unidade), // a API espera o índice: 0 = g, 1 = ml, 2 = un
      estoque_minimo: Number(minimo),
      id_categoria: categoria ? Number(categoria) : null,
    });
  }

  return (
    <Modal
      titulo={produto ? 'Editar produto' : 'Novo produto'}
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-produto" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-produto" onSubmit={enviar} noValidate>
        <FormField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={erros.nome} />
          <FormField label="Unidade" as="select" value={unidade} onChange={(e) => setUnidade(e.target.value)}>
            {UNIDADES.map((u, i) => (
              <option key={u} value={i}>
                {u}
              </option>
            ))}
          </FormField>
        <FormField
          label="Estoque mínimo"
          type="number"
          min="0"
          step="any"
          value={minimo}
          onChange={(e) => setMinimo(e.target.value)}
          error={erros.minimo}
        />
        <FormField label="Categoria" as="select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Sem categoria</option>
          {categorias.map((c) => (
            <option key={c.categoria_id} value={c.categoria_id}>
              {c.nome}
            </option>
          ))}
        </FormField>
      </form>
    </Modal>
  );
}

function DetalhesProduto({ produto, onClose }) {
  const situacoes = situacoesDe(produto);
  return (
    <Modal titulo={produto.nome} onClose={onClose}>
      <dl className="detalhes">
        <dt>Categoria</dt>
        <dd>{produto.categoria_nome ?? '—'}</dd>
        <dt>Em estoque</dt>
        <dd>
          {formatarNumero(quantidadeDe(produto))} {produto.unidade}
        </dd>
        <dt>Estoque mínimo</dt>
        <dd>
          {formatarNumero(produto.estoque_minimo)} {produto.unidade}
        </dd>
        <dt>Validade</dt>
        <dd>{formatarData(produto.validade)}</dd>
        <dt>Situação</dt>
        <dd className="selos">
          {situacoes.map((s) => (
            <Badge key={s} tom={TOM_SITUACAO[s]}>
              {ROTULO_SITUACAO[s]}
            </Badge>
          ))}
        </dd>
      </dl>
    </Modal>
  );
}

export default function Produtos() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const situacao = params.get('situacao') ?? '';
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('');

  const produtos = useFetch(() => produtoService.listar(), []);
  const categorias = useFetch(() => categoriaService.listar(), []);
  const { executando, executar } = useAcao();

  const [formulario, setFormulario] = useState(null); // { produto } ao abrir
  const [detalhe, setDetalhe] = useState(null);
  const [exclusao, setExclusao] = useState(null);

  const listaCategorias = Array.isArray(categorias.dados) ? categorias.dados : [];

  const filtrados = useMemo(() => {
    const lista = Array.isArray(produtos.dados) ? produtos.dados : [];
    const termo = busca.trim().toLowerCase();
    return lista.filter(
      (p) =>
        (!termo || p.nome?.toLowerCase().includes(termo)) &&
        (!categoria || String(p.id_categoria) === categoria) &&
        (!situacao || situacoesDe(p).includes(situacao))
    );
  }, [produtos.dados, busca, categoria, situacao]);

  function mudarSituacao(valor) {
    const novos = new URLSearchParams(params);
    if (valor) novos.set('situacao', valor);
    else novos.delete('situacao');
    setParams(novos, { replace: true });
  }

  async function salvar(dados) {
    const editando = formulario?.produto;
    const { ok } = await executar(
      () => (editando ? produtoService.atualizar(editando.produto_id, dados) : produtoService.criar(dados)),
      editando ? 'Produto atualizado.' : 'Produto cadastrado.'
    );
    if (ok) {
      setFormulario(null);
      produtos.recarregar();
    }
  }

  async function excluir() {
    const { ok } = await executar(() => produtoService.excluir(exclusao.produto_id), 'Produto excluído.');
    if (ok) {
      setExclusao(null);
      produtos.recarregar();
    }
  }

  const colunas = [
    { key: 'nome', header: 'Produto' },
    { key: 'categoria_nome', header: 'Categoria', render: (p) => p.categoria_nome ?? '—' },
    {
      key: 'quantidade',
      header: 'Em estoque',
      render: (p) => `${formatarNumero(quantidadeDe(p))} ${p.unidade ?? ''}`,
    },
    { key: 'estoque_minimo', header: 'Mínimo', render: (p) => `${formatarNumero(p.estoque_minimo)} ${p.unidade ?? ''}` },
    
    {
      key: 'situacao',
      header: 'Situação',
      render: (p) => (
        <span className="selos">
          {situacoesDe(p).map((s) => (
            <Badge key={s} tom={TOM_SITUACAO[s]}>
              {ROTULO_SITUACAO[s]}
            </Badge>
          ))}
        </span>
      ),
    },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'col-acoes',
      render: (p) => (
        <span className="acoes">
          <button type="button" className="btn-icone" onClick={() => setDetalhe(p)} aria-label={`Ver ${p.nome}`}>
            <Eye size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-icone"
            onClick={() => setFormulario({ produto: p })}
            aria-label={`Editar ${p.nome}`}
          >
            <Pencil size={18} aria-hidden="true" />
          </button>
          {podeExcluir(usuario) && (
            <button
              type="button"
              className="btn-icone btn-icone--perigo"
              onClick={() => setExclusao(p)}
              aria-label={`Excluir ${p.nome}`}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader titulo="Produtos" descricao="Cadastro e situação do estoque.">
        <Button icon={Plus} onClick={() => setFormulario({ produto: null })}>
          Novo produto
        </Button>
      </PageHeader>

      <div className="barra">
        <div className="campo barra__busca">
          <label className="campo__rotulo" htmlFor="busca-produto">
            Pesquisar
          </label>
          <div className="busca">
            <Search size={18} aria-hidden="true" />
            <input
              id="busca-produto"
              className="campo__controle"
              type="search"
              placeholder="Nome do produto"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
        <FormField label="Categoria" as="select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas</option>
          {listaCategorias.map((c) => (
            <option key={c.categoria_id} value={c.categoria_id}>
              {c.nome}
            </option>
          ))}
        </FormField>
        <FormField label="Situação" as="select" value={situacao} onChange={(e) => mudarSituacao(e.target.value)}>
          <option value="">Todas</option>
          {Object.entries(ROTULO_SITUACAO).map(([valor, rotulo]) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </FormField>
      </div>

      <DataTable
        legenda="Lista de produtos"
        columns={colunas}
        rows={filtrados}
        rowKey="produto_id"
        carregando={produtos.carregando}
        erro={produtos.erro}
        onRetry={produtos.recarregar}
        vazio={
          produtos.dados?.length ? 'Nenhum produto corresponde aos filtros.' : 'Nenhum produto cadastrado ainda. Use "Novo produto".'
        }
      />

      {formulario && (
        <ProdutoForm
          produto={formulario.produto}
          categorias={listaCategorias}
          salvando={executando}
          onSalvar={salvar}
          onClose={() => setFormulario(null)}
        />
      )}
      {detalhe && <DetalhesProduto produto={detalhe} onClose={() => setDetalhe(null)} />}
      {exclusao && (
        <ConfirmDialog
          titulo="Excluir produto"
          mensagem={`Deseja excluir "${exclusao.nome}"?`}
          carregando={executando}
          onConfirm={excluir}
          onClose={() => setExclusao(null)}
        />
      )}
    </>
  );
}
