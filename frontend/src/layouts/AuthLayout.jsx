import { Outlet } from 'react-router-dom';

// Se existir uma imagem src/assets/fundo-login.(jpg|jpeg|png|webp), ela vira o fundo
// com uma sobreposição vinho. Sem imagem, usa fundo creme com formas discretas.
const imagens = import.meta.glob('../assets/fundo-login.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
const imagemFundo = Object.values(imagens)[0];

export default function AuthLayout() {
  return (
    <div
      className={`auth ${imagemFundo ? 'auth--imagem' : ''}`}
      style={imagemFundo ? { backgroundImage: `url(${imagemFundo})` } : undefined}
    >
      {!imagemFundo && (
        <>
          <span className="auth__forma auth__forma--1" aria-hidden="true" />
          <span className="auth__forma auth__forma--2" aria-hidden="true" />
        </>
      )}
      <Outlet />
    </div>
  );
}
