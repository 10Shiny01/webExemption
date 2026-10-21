import StateMessage from './StateMessage.jsx';

// columns: [{ key, header, render?(linha), className? }]
// Em telas estreitas, cada linha vira um bloco com "rótulo: valor" (via data-label).
export default function DataTable({ columns, rows, rowKey, carregando, erro, onRetry, vazio, legenda }) {
  if (carregando && !rows?.length) return <StateMessage tipo="carregando" />;
  if (erro) return <StateMessage tipo="erro" mensagem={erro} onRetry={onRetry} />;
  if (!rows?.length) return <StateMessage tipo="vazio" mensagem={vazio} />;

  return (
    <div className="tabela-wrap">
      <table className="tabela">
        {legenda && <caption className="so-leitor">{legenda}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((linha) => (
            <tr key={linha[rowKey]}>
              {columns.map((c) => (
                <td key={c.key} data-label={c.header} className={c.className}>
                  {c.render ? c.render(linha) : (linha[c.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
