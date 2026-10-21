import { useId } from 'react';

// as: 'input' (padrão) | 'select' | 'textarea'
// Para select, passe as <option> como children.
export default function FormField({
  label,
  as: Tag = 'input',
  error,
  hint,
  className = '',
  children,
  ...rest
}) {
  const id = useId();
  const idAjuda = hint ? `${id}-ajuda` : undefined;
  const idErro = error ? `${id}-erro` : undefined;
  const descricao = [idAjuda, idErro].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`campo ${error ? 'campo--erro' : ''} ${className}`.trim()}>
      <label className="campo__rotulo" htmlFor={id}>
        {label}
      </label>
      <Tag
        id={id}
        className="campo__controle"
        aria-invalid={error ? true : undefined}
        aria-describedby={descricao}
        {...rest}
      >
        {children}
      </Tag>
      {hint && (
        <span id={idAjuda} className="campo__ajuda">
          {hint}
        </span>
      )}
      {error && (
        <span id={idErro} className="campo__erro">
          {error}
        </span>
      )}
    </div>
  );
}
