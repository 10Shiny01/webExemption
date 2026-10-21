import Spinner from './Spinner.jsx';

// variant: 'primario' | 'secundario' | 'discreto' | 'perigo'
export default function Button({
  variant = 'primario',
  icon: Icon,
  loading = false,
  block = false,
  type = 'button',
  disabled,
  children,
  className = '',
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--bloco', className]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={18} label="Aguarde" /> : Icon && <Icon size={18} aria-hidden="true" />}
      {children}
    </button>
  );
}
