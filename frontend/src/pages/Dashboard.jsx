import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarClock, CalendarX, CheckCircle2, Package, PackageMinus, PackagePlus, TrendingDown } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import AlertCard from '../components/AlertCard.jsx';
import StatCard from '../components/StatCard.jsx';
import StateMessage from '../components/StateMessage.jsx';
import Feedback from '../components/Feedback.jsx';
import useFetch from '../hooks/useFetch.js';
import produtoService from '../services/produtoS.js';
import entradaService from '../services/entradaS.js';
import saidaService from '../services/saidaS.js';
import { DIAS_ALERTA, contarSituacoes, paraData } from '../utils/estoque.js';

const PERIODOS = [
  { dias: 7, rotulo: '7 dias' },
  { dias: 30, rotulo: '30 dias' },
];

function dentroDoPeriodo(valor, dias) {
  const data = paraData(valor);
  if (!data) return false;
  const limite = new Date();
  limite.setHours(0, 0, 0, 0);
  limite.setDate(limite.getDate() - dias);
  return data >= limite;
}

export default function Dashboard() {
  const [dias, setDias] = useState(7);
  const produtos = useFetch(() => produtoService.listar(), []);
  const entradas = useFetch(() => entradaService.listar(), []);
  const saidas = useFetch(() => saidaService.listar(), []);

  const lista = Array.isArray(produtos.dados) ? produtos.dados : [];
  const totais = useMemo(() => contarSituacoes(lista), [lista]);
  const semValidade = lista.length > 0 && lista.every((p) => !p.validade);

  const totalEntradas = useMemo(
    () => (Array.isArray(entradas.dados) ? entradas.dados : []).filter((e) => dentroDoPeriodo(e.data_entrada, dias)).length,
    [entradas.dados, dias]
  );
  const totalSaidas = useMemo(
    () => (Array.isArray(saidas.dados) ? saidas.dados : []).filter((s) => dentroDoPeriodo(s.data_saida, dias)).length,
    [saidas.dados, dias]
  );

  if (produtos.carregando && !produtos.dados) return <StateMessage tipo="carregando" />;
  if (produtos.erro) return <StateMessage tipo="erro" mensagem={produtos.erro} onRetry={produtos.recarregar} />;

  return (
    <>
      <PageHeader titulo="Visão geral" descricao="Situação do estoque da padaria hoje.">
        <div className="segmentos" role="group" aria-label="Período dos indicadores">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              className={`segmentos__item ${dias === p.dias ? 'segmentos__item--ativo' : ''}`}
              aria-pressed={dias === p.dias}
              onClick={() => setDias(p.dias)}
            >
              {p.rotulo}
            </button>
          ))}
        </div>
      </PageHeader>

      {semValidade && (
        <Feedback type="info">
          A API ainda não informa a validade dos produtos, por isso os alertas de vencimento aparecem zerados.
        </Feedback>
      )}

      <section aria-labelledby="titulo-alertas" className="secao">
        <h2 id="titulo-alertas">Alertas</h2>
        <div className="grade grade--alertas">
          <AlertCard
            icon={CalendarClock}
            tom="aviso"
            valor={totais.proximo}
            titulo="Próximos do vencimento"
            descricao={`Vencem em até ${DIAS_ALERTA} dias`}
            to="/produtos?situacao=proximo"
          />
          <AlertCard
            icon={CalendarX}
            tom="erro"
            valor={totais.vencido}
            titulo="Vencidos"
            descricao="Ainda constam em estoque"
            to="/produtos?situacao=vencido"
          />
          <AlertCard
            icon={TrendingDown}
            tom="aviso"
            valor={totais.baixo}
            titulo="Abaixo do estoque mínimo"
            descricao="Precisam de reposição"
            to="/produtos?situacao=baixo"
          />
          <AlertCard
            icon={CheckCircle2}
            tom="ok"
            valor={totais.normal}
            titulo="Estoque normal"
            descricao="Sem pendências"
            to="/produtos?situacao=normal"
          />
        </div>
      </section>

      <section aria-labelledby="titulo-indicadores" className="secao">
        <h2 id="titulo-indicadores">Indicadores</h2>
        <div className="grade grade--indicadores">
          <StatCard icon={Package} rotulo="Produtos cadastrados" valor={lista.length} />
          <StatCard
            icon={PackagePlus}
            rotulo={`Entradas (${dias} dias)`}
            valor={entradas.erro ? '—' : totalEntradas}
            detalhe={entradas.erro ? 'Não foi possível carregar' : 'registros'}
          />
          <StatCard
            icon={PackageMinus}
            rotulo={`Saídas (${dias} dias)`}
            valor={saidas.erro ? '—' : totalSaidas}
            detalhe={saidas.erro ? 'Não foi possível carregar' : 'registros'}
          />
          <StatCard icon={AlertTriangle} rotulo="Estoque baixo" valor={totais.baixo} detalhe="produtos" />
        </div>
      </section>
    </>
  );
}
