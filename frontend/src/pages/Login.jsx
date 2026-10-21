import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import FormField from '../components/FormField.jsx';
import Button from '../components/Button.jsx';
import Feedback from '../components/Feedback.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { autenticado, login, sessaoExpirou } = useAuth();
  const local = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [erroApi, setErroApi] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (autenticado) return <Navigate to={local.state?.de ?? '/'} replace />;

  async function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (!email.trim()) novos.email = 'Informe o e-mail.';
    if (!senha) novos.senha = 'Informe a senha.';
    setErros(novos);
    setErroApi('');
    if (Object.keys(novos).length) return;

    setCarregando(true);
    try {
      await login(email.trim(), senha);
    } catch (erro) {
      setErroApi(erro.message);
      setCarregando(false);
    }
  }

  return (
    <section className="auth__cartao" aria-labelledby="login-titulo">
      <div className="auth__topo">
        <Logo inverso />
      </div>

      <form className="auth__corpo" onSubmit={enviar} noValidate>
        <h1 id="login-titulo">Entrar</h1>
        <p className="texto-suave">Acesse o controle de estoque da padaria.</p>

        {sessaoExpirou && !erroApi && <Feedback type="aviso">Sua sessão expirou. Entre novamente.</Feedback>}
        {erroApi && <Feedback type="erro">{erroApi}</Feedback>}

        <div className="auth__campos">
          <FormField
            label="E-mail"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={erros.email}
          />
          <FormField
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            error={erros.senha}
          />
        </div>

        <Button type="submit" icon={LogIn} loading={carregando} block>
          Entrar
        </Button>
      </form>
    </section>
  );
}
