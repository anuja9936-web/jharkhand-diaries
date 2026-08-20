import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseProps {
  className?: string;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: ButtonSize;
  asChild?: boolean;
  children?: ReactNode;
}) {
  const variants: Record<Variant, string> = {
    primary: 'bg-ink-900 text-white hover:bg-ink-800 shadow-lg shadow-ink-900/10 active:scale-[0.98]',
    secondary: 'bg-white text-ink-900 border border-ink-200 hover:bg-ink-50 active:scale-[0.98]',
    ghost: 'bg-transparent text-ink-900 hover:bg-ink-100 active:scale-[0.98]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3 text-base font-bold rounded-2xl',
  };

  const classes = cn(
    'inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-clay-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<{ className?: string }>, {
      className: cn(classes, (children.props as { className?: string }).className),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement> & BaseProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-[0_18px_70px_-40px_rgba(55,41,28,0.55)] backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  variant = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: 'neutral' | 'success' | 'warning' | 'accent' }) {
  const variants = {
    neutral: 'bg-ink-100 text-ink-700',
    success: 'bg-forest-100 text-forest-700',
    warning: 'bg-clay-100 text-clay-800',
    accent: 'bg-sand text-ink-800',
  };

  return <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', variants[variant], className)} {...props} />;
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-clay-400 focus:ring-2 focus:ring-clay-200',
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-clay-400 focus:ring-2 focus:ring-clay-200',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-[10rem] w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 outline-none transition focus:border-clay-400 focus:ring-2 focus:ring-clay-200',
        className
      )}
      {...props}
    />
  );
}

export function Modal({ className, ...props }: HTMLAttributes<HTMLDivElement> & BaseProps) {
  return (
    <div
      className={cn(
        'rounded-3xl border border-ink-200 bg-white p-6 shadow-glow',
        className
      )}
      {...props}
    />
  );
}
