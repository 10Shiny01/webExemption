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
import usuarioService from '../services/usuarioS.js';
import { PERFIS, ROTULO_PERFIL, formatarData } from '../utils/estoque.js';

function UsuarioForm({ usuario, salvando, onSalvar, onClose }) {
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState(String(Math.max(PERFIS.indexOf(usuario?.perfil), 0)));
  const [erros, setErros] = useState({});

  function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!nome.trim()) novos.nome = 'Informe o nome.';
    if (!email.trim()) novos.email = 'Informe o e-mail.';
    if (!usuario && !senha) novos.senha = 'Informe uma senha.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    const dados = { nome: nome.trim(), email: email.trim(), perfil: Number(perfil) }; // perfil: 0 = funcionário, 1 = adm
    if (!usuario) dados.senha = senha;
    onSalvar(dados);
  }

  return (
    <Modal
      titulo={usuario ? 'Editar usuário' : 'Novo usuário'}
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-usuario" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-usuario" onSubmit={enviar} noValidate>
        <FormField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} error={erros.nome} />
        <FormField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={erros.email} />
        {!usuario && (
          <FormField
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={erros.senha}
          />
        )}
        <FormField label="Perfil de acesso" as="select" value={perfil} onChange={(e) => setPerfil(e.target.value)}>
          {PERFIS.map((p, i) => (
            <option key={p} value={i}>
              {ROTULO_PERFIL[p]}
            </option>
          ))}
        </FormField>
      </form>
    </Modal>
  );
}

export default function Usuarios() {
  const { usuario: logado } = useAuth();
  const usuarios = useFetch(() => usuarioService.listar(), []);
  const { executando, executar } = useAcao();
  const [formulario, setFormulario] = useState(null);
  const [exclusao, setExclusao] = useState(null);

  async function salvar(dados) {
    const editando = formulario?.usuario;
    const { ok } = await executar(
      () => (editando ? usuarioService.atualizar(editando.usuario_id, dados) : usuarioService.criar(dados)),
      editando ? 'Usuário atualizado.' : 'Usuário cadastrado.'
    );
    if (ok) {
      setFormulario(null);
      usuarios.recarregar();
    }
  }

  async function excluir() {
    const { ok } = await executar(() => usuarioService.excluir(exclusao.usuario_id), 'Usuário excluído.');
    if (ok) {
      setExclusao(null);
      usuarios.recarregar();
    }
  }

  const colunas = [
    { key: 'nome', header: 'Nome' },
    { key: 'email', header: 'E-mail' },
    {
      key: 'perfil',
      header: 'Perfil',
      render: (u) => <Badge tom={u.perfil === 'adm' ? 'vinho' : 'neutro'}>{ROTULO_PERFIL[u.perfil] ?? u.perfil}</Badge>,
    },
    { key: 'data_cad', header: 'Cadastro', render: (u) => formatarData(u.data_cad) },
    {
      key: 'acoes',
      header: 'Ações',
      className: 'col-acoes',
      render: (u) => (
        <span className="acoes">
          <button type="button" className="btn-icone" onClick={() => setFormulario({ usuario: u })} aria-label={`Editar ${u.nome}`}>
            <Pencil size={18} aria-hidden="true" />
          </button>
          {u.usuario_id !== logado?.id && (
            <button type="button" className="btn-icone btn-icone--perigo" onClick={() => setExclusao(u)} aria-label={`Excluir ${u.nome}`}>
              <Trash2 size={18} aria-hidden="true" />
            </button>
          )}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader titulo="Usuários" descricao="Quem pode acessar o sistema e com qual perfil.">
        <Button icon={Plus} onClick={() => setFormulario({ usuario: null })}>
          Novo usuário
        </Button>
      </PageHeader>

      <DataTable
        legenda="Lista de usuários"
        columns={colunas}
        rows={Array.isArray(usuarios.dados) ? usuarios.dados : []}
        rowKey="usuario_id"
        carregando={usuarios.carregando}
        erro={usuarios.erro}
        onRetry={usuarios.recarregar}
        vazio="Nenhum usuário encontrado."
      />

      {formulario && (
        <UsuarioForm usuario={formulario.usuario} salvando={executando} onSalvar={salvar} onClose={() => setFormulario(null)} />
      )}
      {exclusao && (
        <ConfirmDialog
          titulo="Excluir usuário"
          mensagem={`Deseja excluir o usuário "${exclusao.nome}"?`}
          carregando={executando}
          onConfirm={excluir}
          onClose={() => setExclusao(null)}
        />
      )}
    </>
  );
}
