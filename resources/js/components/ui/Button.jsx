import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

const variants = {
    primary:
        'bg-gradient-to-br from-blush-500 to-blush-600 text-white shadow-[0_8px_24px_-6px_rgba(230,75,125,0.55)] hover:from-blush-600 hover:to-blush-700 hover:shadow-[0_12px_32px_-6px_rgba(230,75,125,0.65)]',
    secondary:
        'bg-gradient-to-br from-lavender-500 to-lavender-600 text-white shadow-[0_8px_24px_-6px_rgba(146,115,220,0.55)] hover:from-lavender-600 hover:to-lavender-700 hover:shadow-[0_12px_32px_-6px_rgba(146,115,220,0.65)]',
    outline:
        'border border-neutral-200/80 bg-white/60 text-neutral-700 backdrop-blur-sm hover:bg-white/90 hover:border-neutral-300 hover:shadow-soft dark:border-neutral-700/60 dark:bg-neutral-800/50 dark:text-neutral-200 dark:hover:bg-neutral-800/80 dark:hover:border-neutral-600',
    ghost:
        'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/50 dark:hover:text-white',
    danger:
        'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_8px_24px_-6px_rgba(244,63,94,0.55)] hover:from-rose-600 hover:to-rose-700 hover:shadow-[0_12px_32px_-6px_rgba(244,63,94,0.65)]',
};

const sizes = {
    sm: 'px-3.5 py-1.5 text-[13px] rounded-xl',
    md: 'px-4.5 py-2.5 text-sm rounded-2xl',
    lg: 'px-6 py-3 text-[15px] rounded-2xl',
    icon: 'p-2.5 rounded-xl',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className,
    loading,
    disabled,
    children,
    ...props
}) {
    return (
        <motion.button
            whileTap={disabled || loading ? undefined : { scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
                'inline-flex select-none items-center justify-center gap-2 font-semibold',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blush-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className,
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, ease: 'linear', duration: 0.6 }}
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                />
            )}
            {children}
        </motion.button>
    );
}
