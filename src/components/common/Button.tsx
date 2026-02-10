import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
        const variants = {
            primary: 'bg-deep-navy text-white hover:bg-neutral-800 shadow-lg shadow-deep-navy/10',
            secondary: 'bg-white text-deep-navy ring-1 ring-deep-navy/5 hover:bg-neutral-50',
            ghost: 'bg-transparent text-serene-blue/60 hover:text-deep-navy hover:bg-neutral-100',
        }

        const sizes = {
            sm: 'px-4 py-1.5 text-[10px]',
            md: 'px-6 py-2 text-[11px]',
            lg: 'px-8 py-3 text-xs',
        }

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-bold uppercase tracking-widest rounded-full transition-all outline-none disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
