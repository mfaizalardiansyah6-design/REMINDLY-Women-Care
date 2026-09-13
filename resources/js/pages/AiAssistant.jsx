import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Send, Sparkles, User } from 'lucide-react';
import { aiApi } from '../api/ai';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const SUGGESTIONS = [
    'Halo',
    'Bagaimana cara buat pengingat?',
    'Info seputar siklus menstruasi',
    'Tips menjaga kesehatan',
];

export default function AiAssistant() {
    const toast = useToast();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: 'Halo! Saya asisten REMINDLY. Tanyakan apa saja seputar pengingat, catatan, siklus, atau keseharian Anda.',
        },
    ]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const scrollDown = () => {
        requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
    };

    const send = async (text) => {
        const message = (text ?? input).trim();
        if (!message || sending) return;
        setMessages((m) => [...m, { role: 'user', text: message }]);
        setInput('');
        setSending(true);
        scrollDown();
        try {
            const res = await aiApi.assistant(message);
            setMessages((m) => [...m, { role: 'assistant', text: res?.reply ?? 'Maaf, saya tidak bisa menjawab itu.' }]);
        } catch {
            toast.error('Gagal terhubung ke asisten.');
            setMessages((m) => [...m, { role: 'assistant', text: 'Maaf, terjadi kendala jaringan. Coba lagi ya.' }]);
        } finally {
            setSending(false);
            scrollDown();
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        initial={{ scale: 0.9, rotate: -6 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]"
                    >
                        <Bot className="h-6 w-6" />
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Asisten Cerdas</h1>
                        <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Tanya apa saja, saya siap membantu.</p>
                    </div>
                </div>
            </motion.header>

            <Card className="glass-strong flex h-[calc(100vh-230px)] min-h-[420px] flex-col overflow-hidden hairline">
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    <AnimatePresence initial={false}>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                    m.role === 'user'
                                        ? 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200'
                                        : 'bg-gradient-to-br from-blush-500 to-lavender-500 text-white'
                                }`}
                            >
                                {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                                    m.role === 'user'
                                        ? 'rounded-tr-sm bg-blush-500 text-white'
                                        : 'rounded-tl-sm bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100'
                                }`}
                            >
                                {m.text}
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                    {sending && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 text-white">
                                <Bot className="h-4 w-4" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm bg-neutral-100 px-4 py-2.5 dark:bg-neutral-800">
                                <Spinner size="sm" />
                            </div>
                        </motion.div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="border-t border-neutral-200 p-3 dark:border-neutral-700">
                    <div className="mb-2 flex flex-wrap gap-2">
                        {SUGGESTIONS.map((s) => (
                            <button
                                key={s}
                                onClick={() => send(s)}
                                className="inline-flex items-center gap-1.5 rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-xs text-lavender-700 transition hover:bg-lavender-100 dark:border-lavender-800 dark:bg-lavender-950/40 dark:text-lavender-300"
                            >
                                <Sparkles className="h-3 w-3" />
                                {s}
                            </button>
                        ))}
                    </div>
                    <form
                        onSubmit={(e) => { e.preventDefault(); send(); }}
                        className="flex items-center gap-2"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ketik pesan untuk asisten..."
                            className="flex-1"
                        />
                        <Button
                            type="submit"
                            disabled={sending || !input.trim()}
                            className="h-11 w-11 shrink-0 p-0"
                            title="Kirim"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
