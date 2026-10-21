import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import FormField from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import Feedback from '../components/Feedback.jsx';
import StateMessage from '../components/StateMessage.jsx';
import balancoService from '../services/balancoS.js';
import { formatarDataHora } from '../utils/estoque.js';

function ListaProdutos({ titulo, itens }) {
  if (!itens?.length) return null;
  return (
    <section className="painel" aria-label={titulo}>
      <h3>{titulo}</h3>
      <ul className="lista-simples">
        {itens.map((i) => (
          <li key={i.nome}>
            <strong>{i.nome}</strong>
            {i.motivo && <span className="texto-suave"> {i.motivo}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ListaTextos({ titulo, itens, ordenada = false }) {
  if (!itens?.length) return null;
  const Lista = ordenada ? 'ol' : 'ul';
  return (
    <section className="painel" aria-label={titulo}>
      <h3>{titulo}</h3>
      <Lista className="lista-simples">
        {itens.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </Lista>
    </section>
  );
}

export default function BalancoGeral() {
  const [periodo, setPeriodo] = useState('semanal');
  const [balanco, setBalanco] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function gerar() {
    setCarregando(true);
    setErro('');
    try {
      setBalanco(await balancoService.gerar(periodo));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Balanço geral" descricao="Análise do estoque com sugestões de ação, gerada a partir dos dados do sistema." />

      <div className="barra">
        <FormField label="Período analisado" as="select" value={periodo} onChange={(e) => setPeriodo(e.target.value)} disabled={carregando}>
          <option value="semanal">Semanal (7 dias)</option>
          <option value="mensal">Mensal (30 dias)</option>
        </FormField>
        <div className="barra__botoes">
          <Button icon={Sparkles} onClick={gerar} loading={carregando}>
            Gerar balanço
          </Button>
        </div>
      </div>

      <Feedback type="info">
        A API gera o balanço por período. Perguntas livres sobre o estoque ainda não estão disponíveis.
      </Feedback>

      {carregando && <StateMessage tipo="carregando" mensagem="Gerando o balanço. A análise pode levar até 30 segundos." />}
      {erro && <StateMessage tipo="erro" mensagem={erro} onRetry={gerar} />}

      {balanco && !carregando && (
        <div className="balanco">
          {balanco.meta?.gerado_por === 'contingencia' && (
            <Feedback type="aviso">A IA não estava disponível. Este é um resumo automático simples dos dados do estoque.</Feedback>
          )}

          <section className="painel painel--destaque" aria-label="Resumo">
            <h2>Resumo</h2>
            <p>{balanco.resumo}</p>
            {balanco.situacao_atual && (
              <p>
                <strong>Situação atual:</strong> {balanco.situacao_atual}
              </p>
            )}
            {balanco.meta && (
              <p className="texto-suave">
                Período: {balanco.meta.periodo} ({balanco.meta.dias_analisados} dias) · gerado em {formatarDataHora(balanco.meta.gerado_em)}
              </p>
            )}
          </section>

          <ListaTextos titulo="Prioridades" itens={balanco.prioridades} ordenada />
          <div className="grade grade--balanco">
            <ListaProdutos titulo="Produtos críticos" itens={balanco.produtos_criticos} />
            <ListaProdutos titulo="Produtos para reposição" itens={balanco.produtos_reposicao} />
            <ListaProdutos titulo="Validade" itens={balanco.produtos_proximos_validade} />
            <ListaProdutos titulo="Maior movimentação" itens={balanco.maior_movimentacao} />
          </div>
          <ListaTextos titulo="Problemas detectados" itens={balanco.problemas} />
          <ListaTextos titulo="Recomendações" itens={balanco.recomendacoes} />
        </div>
      )}
    </>
  );
}
