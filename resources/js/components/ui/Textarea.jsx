import { cn } from '../../lib/cn';
import { fieldClasses } from './Input';

export default function Textarea({ className, label, error, ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-[13px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
            )}
            <textarea
                className={cn(
                    fieldClasses,
                    'min-h-[2.75rem] resize-y leading-relaxed',
                    error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-900/30',
                    className,
                )}
                {...props}
            />
            {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        </div>
    );
}
