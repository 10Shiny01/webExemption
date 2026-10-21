import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 18, label = 'Carregando' }) {
  return <Loader2 className="spinner" size={size} aria-label={label} role="img" />;
}
