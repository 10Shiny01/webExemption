import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Feedback from '../components/Feedback.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import produtoService from '../services/produtoS.js';
import categoriaService from '../services/categoriaS.js';
import entradaService from '../services/entradaS.js';
import {
  ROTULO_SITUACAO,
  TOM_SITUACAO,
  UNIDADES,
  descreverPrazo,
  formatarData,
  formatarNumero,
  comSaldoEstimado,
  lotesPorProduto,
  normalizarBusca,
  podeExcluir,
  quantidadeDe,
  situacoesDe,
} from '../utils/estoque.js';

const TOM_LOTE = { vencido: 'erro', proximo: 'aviso', normal: 'ok' };
const ROTULO_LOTE = { vencido: 'Vencido', proximo: 'Próximo do vencimento', normal: 'No prazo' };

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

function DetalhesProduto({ produto, lotes, onClose }) {
  const situacoes = situacoesDe(produto, lotes);
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
        <dd>
          {lotes.length === 0 ? (
            'Nenhum lote com validade em estoque.'
          ) : (
            <>
              <ul className="lista-lotes">
                {lotes.map((l) => (
                  <li key={l.entrada_id}>
                    <span>
                      <strong>{formatarData(l.validade)}</strong> · {formatarNumero(l.saldo)} {produto.unidade}
                      <span className="tabela__sub">
                        Entrada de {formatarData(l.data_entrada)} · {descreverPrazo(l.dias)}
                      </span>
                    </span>
                    <Badge tom={TOM_LOTE[l.situacao]}>{ROTULO_LOTE[l.situacao]}</Badge>
                  </li>
                ))}
              </ul>
              <p className="lista-lotes__nota">Cada entrada tem a sua validade. O saldo por lote é estimado: as entradas mais antigas saem primeiro.</p>
            </>
          )}
        </dd>
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
  const entradas = useFetch(() => entradaService.listar(), []);
  const { executando, executar } = useAcao();

  const [formulario, setFormulario] = useState(null); // { produto } ao abrir
  const [detalhe, setDetalhe] = useState(null);
  const [exclusao, setExclusao] = useState(null);

  const listaCategorias = Array.isArray(categorias.dados) ? categorias.dados : [];

  // A validade vem das entradas (lotes que ainda têm saldo), não do cadastro do produto.
  const lotes = useMemo(
    () => lotesPorProduto(comSaldoEstimado(entradas.dados, produtos.dados)),
    [entradas.dados, produtos.dados]
  );

  const filtrados = useMemo(() => {
    const lista = Array.isArray(produtos.dados) ? produtos.dados : [];
    const termo = normalizarBusca(busca);
    return lista
      .filter(
        (p) =>
          (!termo || normalizarBusca(`${p.nome} ${p.categoria_nome ?? ''}`).includes(termo)) &&
          (!categoria || String(p.id_categoria) === categoria) &&
          (!situacao || situacoesDe(p, lotes.get(p.produto_id)).includes(situacao))
      )
      .sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  }, [produtos.dados, busca, categoria, situacao, lotes]);

  const filtrando = Boolean(busca.trim() || categoria || situacao);
  const totalProdutos = Array.isArray(produtos.dados) ? produtos.dados.length : 0;

  function limparFiltros() {
    setBusca('');
    setCategoria('');
    mudarSituacao('');
  }

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
    { key: 'nome', header: 'Produto', render: (p) => <strong>{p.nome}</strong> },
    { key: 'categoria_nome', header: 'Categoria', render: (p) => p.categoria_nome ?? '—' },
    {
      key: 'quantidade',
      header: 'Em estoque',
      className: 'col-num',
      render: (p) => `${formatarNumero(quantidadeDe(p))} ${p.unidade ?? ''}`,
    },
    {
      key: 'estoque_minimo',
      header: 'Mínimo',
      className: 'col-num',
      render: (p) => `${formatarNumero(p.estoque_minimo)} ${p.unidade ?? ''}`,
    },
    {
      key: 'validade',
      header: 'Validade',
      render: (p) => {
        const proximo = lotes.get(p.produto_id)?.[0]; // lote com a validade mais próxima
        if (!proximo) return '—';
        return (
          <>
            {formatarData(proximo.validade)}
            <span className="tabela__sub">{descreverPrazo(proximo.dias)}</span>
          </>
        );
      },
    },
    {
      key: 'situacao',
      header: 'Situação',
      render: (p) => (
        <span className="selos">
          {situacoesDe(p, lotes.get(p.produto_id)).map((s) => (
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
              placeholder="Nome ou categoria"
              autoComplete="off"
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
        {filtrando && (
          <Button variant="discreto" icon={X} onClick={limparFiltros}>
            Limpar filtros
          </Button>
        )}
      </div>

      {entradas.erro && (
        <Feedback type="aviso">
          Não foi possível carregar as validades das entradas. Os alertas de vencimento podem estar incompletos.
        </Feedback>
      )}
      {!produtos.carregando && !produtos.erro && totalProdutos > 0 && (
        <p className="barra__resumo" aria-live="polite">
          {filtrando ? `${filtrados.length} de ${totalProdutos} produtos` : `${totalProdutos} ${totalProdutos === 1 ? 'produto' : 'produtos'}`}
        </p>
      )}

      <DataTable
        legenda="Lista de produtos"
        columns={colunas}
        rows={filtrados}
        rowKey="produto_id"
        rowClassName={(p) => {
          const s = situacoesDe(p, lotes.get(p.produto_id));
          return s.includes('vencido') ? 'linha--erro' : s.includes('proximo') || s.includes('baixo') ? 'linha--aviso' : '';
        }}
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
      {detalhe && <DetalhesProduto produto={detalhe} lotes={lotes.get(detalhe.produto_id) ?? []} onClose={() => setDetalhe(null)} />}
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
