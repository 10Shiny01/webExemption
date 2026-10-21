// tom: 'erro' | 'aviso' | 'ok' | 'neutro' | 'vinho'
export default function Badge({ tom = 'neutro', children }) {
  return <span className={`selo selo--${tom}`}>{children}</span>;
}
