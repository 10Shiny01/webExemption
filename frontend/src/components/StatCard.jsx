export default function StatCard({ icon: Icon, rotulo, valor, detalhe }) {
  return (
    <div className="indicador">
      <span className="indicador__icone" aria-hidden="true">
        <Icon size={20} />
      </span>
      <div>
        <p className="indicador__rotulo">{rotulo}</p>
        <p className="indicador__valor">{valor}</p>
        {detalhe && <p className="indicador__detalhe">{detalhe}</p>}
      </div>
    </div>
  );
}
