import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

const styles = {
    low: 'bg-emerald-50/80 text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-950/40 dark:text-emerald-300',
    medium:
        'bg-amber-50/80 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/40 dark:text-amber-300',
    high: 'bg-rose-50/80 text-rose-700 ring-1 ring-inset ring-rose-600/10 dark:bg-rose-950/40 dark:text-rose-300',
};

export default function Badge({ priority, className }) {
    return (
        <motion.span
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize backdrop-blur-sm',
                styles[priority],
                className,
            )}
        >
            {priority}
        </motion.span>
    );
}
