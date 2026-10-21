import logo from "../assets/logo.png"

// Espaço para a logo da padaria. Para usar uma imagem, coloque o arquivo em src/assets
// e troque o ícone abaixo por <img src={...} alt="" />.
export default function Logo({ inverso = false }) {
  return (
    <span className={`logo ${inverso ? 'logo--inverso' : ''}`}>
     <img src={logo} alt="logo padaria" className="logo__marca"></img>
      <span className="logo__nome">WebExemption</span>
    </span>
  );
}
