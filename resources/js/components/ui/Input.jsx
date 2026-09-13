import { cn } from '../../lib/cn';

const fieldClasses = cn(
    'w-full rounded-2xl border border-neutral-200/80 bg-white/70 px-4 py-2.5 text-sm text-neutral-900',
    'placeholder-neutral-400/80 backdrop-blur-sm',
    'shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]',
    'transition-all duration-200',
    'focus:border-blush-400 focus:outline-none focus:ring-4 focus:ring-blush-100/60 focus:shadow-[0_0_0_1px_rgba(230,75,125,0.1)]',
    'dark:border-neutral-700/70 dark:bg-neutral-800/60 dark:text-neutral-100',
    'dark:focus:border-blush-500 dark:focus:ring-blush-900/30',
);

export default function Input({ className, label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-[13px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
            )}
            <input
                className={cn(
                    fieldClasses,
                    error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30',
                    className,
                )}
                {...props}
            />
            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        </div>
    );
}

export { fieldClasses };
