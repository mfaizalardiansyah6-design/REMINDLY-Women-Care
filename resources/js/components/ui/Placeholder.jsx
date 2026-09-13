import { Construction } from 'lucide-react';
import { Card } from './Card';

export default function Placeholder({ title }) {
    return (
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
            <Card className="p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-lavender-100 text-lavender-500 dark:bg-lavender-950/40">
                    <Construction className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-neutral-500">Halaman ini sedang dibangun pada tahap berikutnya.</p>
            </Card>
        </div>
    );
}
