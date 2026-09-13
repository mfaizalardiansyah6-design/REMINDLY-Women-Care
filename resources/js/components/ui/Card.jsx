import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

export function Card({ className, children, interactive, hover, ...props }) {
    const Component = interactive || hover ? motion.div : 'div';
    return (
        <Component
            {...(interactive || hover
                ? {
                      whileHover: { y: -2, scale: 1.005 },
                      transition: { type: 'spring', stiffness: 400, damping: 28 },
                  }
                : {})}
            className={cn(
                'rounded-3xl border border-neutral-200/60 bg-white/75 shadow-soft backdrop-blur-sm',
                'dark:border-neutral-800/80 dark:bg-neutral-900/65',
                'transition-shadow duration-300',
                hover && 'hover:shadow-lifted dark:hover:shadow-elevated',
                className,
            )}
            {...props}
        >
            {children}
        </Component>
    );
}

export function CardHeader({ className, title, subtitle, action, icon: Icon, ...props }) {
    return (
        <div className={cn('flex items-start justify-between gap-3 px-5 pt-5 sm:px-6', className)} {...props}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blush-500/10 to-lavender-500/10 text-blush-500 ring-1 ring-inset ring-blush-500/10 dark:from-blush-500/20 dark:to-lavender-500/20 dark:text-blush-400">
                        <Icon className="h-4.5 w-4.5" />
                    </div>
                )}
                <div>
                    {title && (
                        <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">{subtitle}</p>
                    )}
                </div>
            </div>
            {action}
        </div>
    );
}

export function CardContent({ className, children, ...props }) {
    return (
        <div className={cn('px-5 py-4 sm:px-6', className)} {...props}>
            {children}
        </div>
    );
}
