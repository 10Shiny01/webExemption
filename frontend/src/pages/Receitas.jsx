import { useMemo, useState } from 'react';
import { ChefHat, Pencil, Plus, Trash2, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StateMessage from '../components/StateMessage.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import FormField from '../components/FormField.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import useFetch from '../hooks/useFetch.js';
import useAcao from '../hooks/useAcao.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import receitaService from '../services/receitaS.js';
import produtoService from '../services/produtoS.js';
import { formatarNumero, podeExcluir, quantidadeDe } from '../utils/estoque.js';

let contadorLinhas = 0;
const novaLinha = (dados = {}) => ({ chave: ++contadorLinhas, id_receita_uso: null, id_produto: '', quantidade: '', ...dados });

function ReceitaForm({ receita, ingredientesAtuais, produtos, salvando, onSalvar, onClose }) {
  const [nome, setNome] = useState(receita?.nome ?? '');
  const [produtoFinal, setProdutoFinal] = useState(receita ? String(receita.id_produto) : '');
  const [quantidade, setQuantidade] = useState(receita ? String(receita.quantidade) : '');
  const [linhas, setLinhas] = useState(() =>
    ingredientesAtuais.map((i) =>
      novaLinha({ id_receita_uso: i.id_receita_uso, id_produto: String(i.id_produto), quantidade: String(i.quantidade) })
    )
  );
  const [erros, setErros] = useState({});

  function alterarLinha(chave, campo, valor) {
    setLinhas((atuais) => atuais.map((l) => (l.chave === chave ? { ...l, [campo]: valor } : l)));
  }

  function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!nome.trim()) novos.nome = 'Informe o nome da receita.';
    if (!produtoFinal) novos.produtoFinal = 'Selecione o produto que a receita produz.';
    if (!quantidade || Number(quantidade) <= 0) novos.quantidade = 'Informe a quantidade produzida.';
    if (linhas.some((l) => !l.id_produto || !l.quantidade || Number(l.quantidade) <= 0)) {
      novos.ingredientes = 'Preencha o produto e a quantidade de todos os ingredientes.';
    }
    setErros(novos);
    if (Object.keys(novos).length) return;

    onSalvar(
      { id_produto: Number(produtoFinal), nome: nome.trim(), quantidade: Number(quantidade) },
      linhas
    );
  }

  return (
    <Modal
      titulo={receita ? 'Editar receita' : 'Nova receita'}
      largo
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button type="submit" form="form-receita" loading={salvando}>
            Salvar
          </Button>
        </>
      }
    >
      <form id="form-receita" onSubmit={enviar} noValidate>
        <FormField label="Nome da receita" value={nome} onChange={(e) => setNome(e.target.value)} error={erros.nome} />
        <div className="linha-campos">
          <FormField
            label="Produto que a receita produz"
            as="select"
            value={produtoFinal}
            onChange={(e) => setProdutoFinal(e.target.value)}
            error={erros.produtoFinal}
          >
            <option value="">Selecione</option>
            {produtos.map((p) => (
              <option key={p.produto_id} value={p.produto_id}>
                {p.nome}
              </option>
            ))}
          </FormField>
          <FormField
            label="Quantidade produzida"
            type="number"
            min="0"
            step="any"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            error={erros.quantidade}
          />
        </div>

        <fieldset className="ingredientes">
          <legend>Ingredientes</legend>
          {linhas.length === 0 && <p className="texto-suave">Nenhum ingrediente adicionado.</p>}
          {linhas.map((linha, indice) => (
            <div className="ingredientes__linha" key={linha.chave}>
              <FormField
                label={`Ingrediente ${indice + 1}`}
                as="select"
                value={linha.id_produto}
                onChange={(e) => alterarLinha(linha.chave, 'id_produto', e.target.value)}
              >
                <option value="">Selecione</option>
                {produtos.map((p) => (
                  <option key={p.produto_id} value={p.produto_id}>
                    {p.nome} ({p.unidade})
                  </option>
                ))}
              </FormField>
              <FormField
                label="Quantidade"
                type="number"
                min="0"
                step="any"
                value={linha.quantidade}
                onChange={(e) => alterarLinha(linha.chave, 'quantidade', e.target.value)}
              />
              <button
                type="button"
                className="btn-icone btn-icone--perigo ingredientes__remover"
                onClick={() => setLinhas((atuais) => atuais.filter((l) => l.chave !== linha.chave))}
                aria-label={`Remover ingrediente ${indice + 1}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
          {erros.ingredientes && <p className="campo__erro">{erros.ingredientes}</p>}
          <Button variant="secundario" icon={Plus} onClick={() => setLinhas((atuais) => [...atuais, novaLinha()])}>
            Adicionar ingrediente
          </Button>
        </fieldset>
      </form>
    </Modal>
  );
}

function ProducaoForm({ receita, ingredientes, produtos, salvando, onConfirmar, onClose }) {
  const [mult, setMult] = useState('1');
  const multiplicador = Number(mult);
  const valido = multiplicador > 0;

  return (
    <Modal
      titulo={`Registrar produção: ${receita.nome}`}
      onClose={onClose}
      rodape={
        <>
          <Button variant="secundario" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button icon={ChefHat} onClick={() => onConfirmar(multiplicador)} loading={salvando} disabled={!valido}>
            Registrar produção
          </Button>
        </>
      }
    >
      <FormField
        label="Quantas vezes a receita foi feita?"
        type="number"
        min="1"
        step="any"
        value={mult}
        onChange={(e) => setMult(e.target.value)}
        hint="Cada ingrediente sai do estoque e o produto final entra."
      />
      {valido && ingredientes.length > 0 && (
        <ul className="lista-consumo">
          {ingredientes.map((i) => {
            const produto = produtos.find((p) => p.produto_id === i.id_produto);
            const necessario = Number(i.quantidade) * multiplicador;
            const falta = produto && necessario > quantidadeDe(produto);
            return (
              <li key={i.id_receita_uso}>
                <span>
                  {i.produto_nome}: {formatarNumero(necessario)} {produto?.unidade ?? ''}
                </span>
                {falta && <Badge tom="aviso">Estoque atual: {formatarNumero(quantidadeDe(produto))}</Badge>}
              </li>
            );
          })}
        </ul>
      )}
      {valido && ingredientes.length === 0 && <p className="texto-suave">Esta receita ainda não tem ingredientes.</p>}
    </Modal>
  );
}

export default function Receitas() {
  const { usuario } = useAuth();
  const receitas = useFetch(() => receitaService.listar(), []);
  const ingredientes = useFetch(() => receitaService.ingredientes.listar(), []);
  const produtos = useFetch(() => produtoService.listar(), []);
  const { executando, executar } = useAcao();

  const [formulario, setFormulario] = useState(null);
  const [producao, setProducao] = useState(null);
  const [exclusao, setExclusao] = useState(null);

  const listaProdutos = Array.isArray(produtos.dados) ? produtos.dados : [];
  const porReceita = useMemo(() => {
    const mapa = new Map();
    (Array.isArray(ingredientes.dados) ? ingredientes.dados : []).forEach((i) => {
      mapa.set(i.id_receita, [...(mapa.get(i.id_receita) ?? []), i]);
    });
    return mapa;
  }, [ingredientes.dados]);
  const unidade = (idProduto) => listaProdutos.find((p) => p.produto_id === idProduto)?.unidade ?? '';

  function recarregarTudo() {
    receitas.recarregar();
    ingredientes.recarregar();
  }

  async function salvar(dados, linhas) {
    const editando = formulario?.receita;
    const { ok } = await executar(async () => {
      let receitaId;
      if (editando) {
        await receitaService.atualizar(editando.receita_id, dados);
        receitaId = editando.receita_id;
      } else {
        const nova = await receitaService.criar(dados);
        receitaId = nova?.receita_id;
        if (!receitaId) throw new Error('A API não retornou o código da receita criada.');
      }

      const originais = porReceita.get(receitaId) ?? [];
      const mantidos = new Set(linhas.filter((l) => l.id_receita_uso).map((l) => l.id_receita_uso));

      for (const antigo of originais) {
        if (!mantidos.has(antigo.id_receita_uso)) await receitaService.ingredientes.excluir(antigo.id_receita_uso);
      }
      for (const linha of linhas) {
        const corpo = { id_receita: receitaId, id_produto: Number(linha.id_produto), quantidade: Number(linha.quantidade) };
        if (linha.id_receita_uso) await receitaService.ingredientes.atualizar(linha.id_receita_uso, corpo);
        else await receitaService.ingredientes.criar(corpo);
      }
    }, 'Receita salva.');

    recarregarTudo(); // recarrega mesmo em caso de falha parcial, para mostrar o que foi gravado
    if (ok) setFormulario(null);
  }

  async function produzir(mult) {
    const { ok } = await executar(() => receitaService.produzir(producao.receita_id, mult), 'Produção registrada.');
    if (ok) {
      setProducao(null);
      produtos.recarregar();
    }
  }

  async function excluir() {
    const { ok } = await executar(async () => {
      // remove os ingredientes antes da receita, para não deixar registros órfãos
      for (const i of porReceita.get(exclusao.receita_id) ?? []) {
        await receitaService.ingredientes.excluir(i.id_receita_uso);
      }
      await receitaService.excluir(exclusao.receita_id);
    }, 'Receita excluída.');
    recarregarTudo();
    if (ok) setExclusao(null);
  }

  const lista = Array.isArray(receitas.dados) ? receitas.dados : [];

  return (
    <>
      <PageHeader titulo="Receitas" descricao="Ingredientes de cada receita e registro de produção.">
        <Button icon={Plus} onClick={() => setFormulario({ receita: null })}>
          Nova receita
        </Button>
      </PageHeader>

      {receitas.carregando && !receitas.dados && <StateMessage tipo="carregando" />}
      {receitas.erro && <StateMessage tipo="erro" mensagem={receitas.erro} onRetry={receitas.recarregar} />}
      {!receitas.carregando && !receitas.erro && lista.length === 0 && (
        <StateMessage tipo="vazio" mensagem='Nenhuma receita cadastrada ainda. Use "Nova receita".' />
      )}
      {ingredientes.erro && <p className="campo__erro">Não foi possível carregar os ingredientes: {ingredientes.erro}</p>}

      <div className="grade grade--receitas">
        {lista.map((r) => {
          const itens = porReceita.get(r.receita_id) ?? [];
          return (
            <article className="receita" key={r.receita_id}>
              <h2>{r.nome}</h2>
              <p className="texto-suave">
                Rende {formatarNumero(r.quantidade)} {unidade(r.id_produto)} de {r.produto_nome}
              </p>

              <h3>Ingredientes</h3>
              {itens.length === 0 ? (
                <p className="texto-suave">Nenhum ingrediente cadastrado.</p>
              ) : (
                <ul className="receita__ingredientes">
                  {itens.map((i) => (
                    <li key={i.id_receita_uso}>
                      <span>{i.produto_nome}</span>
                      <span>
                        {formatarNumero(i.quantidade)} {unidade(i.id_produto)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="receita__acoes">
                <Button icon={ChefHat} onClick={() => setProducao(r)}>
                  Produzir
                </Button>
                <button type="button" className="btn-icone" onClick={() => setFormulario({ receita: r })} aria-label={`Editar ${r.nome}`}>
                  <Pencil size={18} aria-hidden="true" />
                </button>
                {podeExcluir(usuario) && (
                  <button type="button" className="btn-icone btn-icone--perigo" onClick={() => setExclusao(r)} aria-label={`Excluir ${r.nome}`}>
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {formulario && (
        <ReceitaForm
          receita={formulario.receita}
          ingredientesAtuais={formulario.receita ? (porReceita.get(formulario.receita.receita_id) ?? []) : []}
          produtos={listaProdutos}
          salvando={executando}
          onSalvar={salvar}
          onClose={() => setFormulario(null)}
        />
      )}
      {producao && (
        <ProducaoForm
          receita={producao}
          ingredientes={porReceita.get(producao.receita_id) ?? []}
          produtos={listaProdutos}
          salvando={executando}
          onConfirmar={produzir}
          onClose={() => setProducao(null)}
        />
      )}
      {exclusao && (
        <ConfirmDialog
          titulo="Excluir receita"
          mensagem={`Deseja excluir a receita "${exclusao.nome}" e seus ingredientes?`}
          carregando={executando}
          onConfirm={excluir}
          onClose={() => setExclusao(null)}
        />
      )}
    </>
  );
}
