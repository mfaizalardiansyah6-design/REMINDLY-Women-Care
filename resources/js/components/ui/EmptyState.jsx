import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, icon: Icon = Inbox }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center justify-center gap-3 py-14 text-center"
        >
            <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-neutral-100 to-neutral-200/60 text-neutral-400 shadow-soft ring-1 ring-inset ring-neutral-200/60 dark:from-neutral-800 dark:to-neutral-800/60 dark:text-neutral-500 dark:ring-neutral-700/60"
            >
                <Icon className="h-7 w-7" />
            </motion.div>
            <div>
                <p className="text-[15px] font-semibold text-neutral-700 dark:text-neutral-200">{title}</p>
                {description && (
                    <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
