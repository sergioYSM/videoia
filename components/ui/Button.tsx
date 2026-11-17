import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cx } from './cx';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean };
const V = {
  primary: 'bg-accent text-on-accent hover:brightness-110 active:brightness-95',
  secondary: 'bg-surface-raised text-text hover:bg-surface-hover active:bg-surface-active',
  ghost: 'text-text-muted hover:bg-surface-hover hover:text-text',
  danger: 'bg-danger text-on-danger hover:brightness-110',
};
const S = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };
export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = 'primary', size = 'md', loading, disabled, className, children, type = 'button', ...rest }, ref) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
      className={cx('inline-flex items-center justify-center gap-2 rounded-md font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', V[variant], S[size], className)} {...rest}>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
