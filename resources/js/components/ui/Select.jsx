import { cn } from '../../lib/cn';
import { fieldClasses } from './Input';

export default function Select({ className, label, error, children, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-[13px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
            )}
            <select
                className={cn(
                    fieldClasses,
                    'cursor-pointer appearance-none bg-no-repeat pr-9',
                    error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30',
                    className,
                )}
                style={{
                    backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                    backgroundPosition: 'right 0.75rem center',
                    backgroundSize: '1rem',
                }}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        </div>
    );
}
