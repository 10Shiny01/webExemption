import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import categoriaService from '../services/categoriaS.js';
import { ROTULO_TIPO, TIPOS_CATEGORIA, podeExcluir } from '../utils/estoque.js';

function CategoriaForm({ categoria, salvando, onSalvar, onClose }) {
  const [nome, setNome] = useState(categoria?.nome ?? '');
  const [tipo, setTipo] = useState(String(Math.max(TIPOS_CATEGORIA.indexOf(categoria?.tipo), 0)));
  const [erro, setErro] = useState('');

  function enviar(e) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro('Informe o nome da categoria.');
      return;
    }
    setErro('');
    onSalvar({ nome: nome.trim(), tipo: Number(tipo) }); // a API espera o índice: 0 = receita, 1 = venda
  }

  return (
    <Modal
      titulo={categoria ? 'Editar categoria' : 'Nova categoria'}
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-categoria" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-categoria" onSubmit={enviar} noValidate>
        <FormField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={erro} />
        <FormField label="Tipo" as="select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS_CATEGORIA.map((t, i) => (
            <option key={t} value={i}>
              {ROTULO_TIPO[t]}
            </option>
          ))}
        </FormField>
      </form>
    </Modal>
  );
}

export default function Categorias() {
  const { usuario } = useAuth();
  const categorias = useFetch(() => categoriaService.listar(), []);
  const { executando, executar } = useAcao();
  const [formulario, setFormulario] = useState(null);
  const [exclusao, setExclusao] = useState(null);

  async function salvar(dados) {
    const editando = formulario?.categoria;
    const { ok } = await executar(
      () => (editando ? categoriaService.atualizar(editando.categoria_id, dados) : categoriaService.criar(dados)),
      editando ? 'Categoria atualizada.' : 'Categoria cadastrada.'
    );
    if (ok) {
      setFormulario(null);
      categorias.recarregar();
    }
  }

  async function excluir() {
    const { ok } = await executar(() => categoriaService.excluir(exclusao.categoria_id), 'Categoria excluída.');
    if (ok) {
      setExclusao(null);
      categorias.recarregar();
    }
  }

  const colunas = [
    { key: 'nome', header: 'Categoria' },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (c) => <Badge tom={c.tipo === 'receita' ? 'vinho' : 'neutro'}>{ROTULO_TIPO[c.tipo] ?? c.tipo}</Badge>,
    },
    { key: 'total_produtos', header: 'Produtos', render: (c) => c.total_produtos ?? 0 },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'col-acoes',
      render: (c) => (
        <span className="acoes">
          <button type="button" className="btn-icone" onClick={() => setFormulario({ categoria: c })} aria-label={`Editar ${c.nome}`}>
            <Pencil size={18} aria-hidden="true" />
          </button>
          {podeExcluir(usuario) && (
            <button type="button" className="btn-icone btn-icone--perigo" onClick={() => setExclusao(c)} aria-label={`Excluir ${c.nome}`}>
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader titulo="Categorias" descricao="Organize os produtos por tipo de uso.">
        <Button icon={Plus} onClick={() => setFormulario({ categoria: null })}>
          Nova categoria
        </Button>
      </PageHeader>

      <DataTable
        legenda="Lista de categorias"
        columns={colunas}
        rows={Array.isArray(categorias.dados) ? categorias.dados : []}
        rowKey="categoria_id"
        carregando={categorias.carregando}
        erro={categorias.erro}
        onRetry={categorias.recarregar}
        vazio='Nenhuma categoria cadastrada ainda. Use "Nova categoria".'
      />

      {formulario && (
        <CategoriaForm categoria={formulario.categoria} salvando={executando} onSalvar={salvar} onClose={() => setFormulario(null)} />
      )}
      {exclusao && (
        <ConfirmDialog
          titulo="Excluir categoria"
          mensagem={`Deseja excluir a categoria "${exclusao.nome}"?`}
          carregando={executando}
          onConfirm={excluir}
          onClose={() => setExclusao(null)}
        />
      )}
    </>
  );
}
