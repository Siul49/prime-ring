import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'
import './Button.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn('glass-button', `button-${variant}`, `button-${size}`, className)}
                {...props}
            >
                {children}
            </button>
        )
    }
)

Button.displayName = 'Button'
