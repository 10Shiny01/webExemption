export default function PageHeader({ titulo, descricao, children }) {
  return (
    <div className="pagina-topo">
      <div>
        <h1>{titulo}</h1>
        {descricao && <p className="texto-suave">{descricao}</p>}
      </div>
      {children && <div className="pagina-topo__acoes">{children}</div>}
    </div>
  );
}
