import { motion } from 'motion/react';
import { cn } from '../../lib/cn';

export default function Spinner({ size = 'md', className }) {
    const cls = size === 'lg' ? 'h-8 w-8 border-[3px]' : 'h-5 w-5 border-2';
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 0.6 }}
            className={cn(
                `${cls} inline-block rounded-full border-blush-400/40 border-t-blush-500`,
                className,
            )}
        />
    );
}
