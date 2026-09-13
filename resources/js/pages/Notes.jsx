import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StickyNote, Plus, Search, Pin, PinOff, Trash2, Pencil, Tag } from 'lucide-react';
import { noteApi } from '../api/notes';
import { categoryApi } from '../api/categories';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const colors = ['bg-blush-100', 'bg-lavender-100', 'bg-amber-100', 'bg-emerald-100', 'bg-sky-100'];

const emptyForm = { title: '', content: '', color: 'bg-lavender-100', category_id: '' };

const itemVariants = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 26, delay: i * 0.04 },
    }),
};

export default function Notes() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showPinned, setShowPinned] = useState(false);
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        categoryApi.index('note').then(setCategories).catch(() => setCategories([]));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await noteApi.index({ search: search || undefined, pinned: showPinned ? '1' : undefined, category_id: categoryId || undefined });
            setItems(res.data ?? []);
        } catch {
            toast.error('Gagal memuat catatan.');
        } finally {
            setLoading(false);
        }
    }, [search, showPinned, categoryId, toast]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (n) => {
        setEditing(n);
        setForm({ title: n.title, content: n.content ?? '', color: n.color ?? 'bg-lavender-100', category_id: n.category_id ?? '' });
        setModalOpen(true);
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await noteApi.update(editing.id, form);
                toast.success('Catatan diperbarui.');
            } else {
                await noteApi.store(form);
                toast.success('Catatan dibuat.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan catatan.');
        } finally {
            setSaving(false);
        }
    };

    const togglePin = async (n) => {
        try {
            await noteApi.pin(n.id);
            load();
        } catch {
            toast.error('Gagal.');
        }
    };

    const remove = async (n) => {
        if (!window.confirm(`Hapus catatan "${n.title}"?`)) return;
        try {
            await noteApi.destroy(n.id);
            toast.success('Catatan dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <div className="glass-strong hairline flex items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lavender-500 to-blush-500 text-white shadow-[0_4px_16px_-2px_rgba(146,115,220,0.45)]">
                            <StickyNote className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">Catatan</h1>
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">Simpan ide dan pemikiran Anda.</p>
                        </div>
                    </div>
                    <Button onClick={openCreate} className="hidden sm:inline-flex">
                        <Plus className="h-4 w-4" /> Catatan Baru
                    </Button>
                </div>
            </motion.header>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.08 }}
                className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari catatan..."
                        className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 py-2.5 pl-11 pr-3 text-sm text-neutral-900 placeholder-neutral-400/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200 focus:border-blush-400 focus:outline-none focus:ring-4 focus:ring-blush-100/60 dark:border-neutral-700/70 dark:bg-neutral-800/60 dark:text-neutral-100 dark:focus:border-blush-500 dark:focus:ring-blush-900/30"
                    />
                </div>
                <button
                    onClick={() => setShowPinned((v) => !v)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        showPinned
                            ? 'bg-gradient-to-br from-lavender-500 to-blush-500 text-white shadow-[0_4px_12px_-2px_rgba(146,115,220,0.45)]'
                            : 'glass-strong hairline text-neutral-600 dark:text-neutral-300'
                    }`}
                >
                    <Pin className="h-4 w-4" /> Disematkan
                </button>
                {categories.length > 0 && (
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-44">
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                )}
            </motion.div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState
                    title="Belum ada catatan"
                    description="Buat catatan pertama Anda."
                    icon={StickyNote}
                />
            ) : (
                <motion.div
                    variants={{ hidden: {}, show: {} }}
                    initial="hidden"
                    animate="show"
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <AnimatePresence>
                        {items.map((n, i) => (
                            <motion.div
                                key={n.id}
                                variants={itemVariants}
                                custom={i}
                                layout
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            >
                                <Card className={`group relative overflow-hidden p-4 transition-all duration-200 hover:shadow-lifted ${n.color} border-transparent dark:bg-neutral-800/70`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">{n.title}</h3>
                                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            <button onClick={() => togglePin(n)} className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                                                {n.pinned ? <Pin className="h-4 w-4 fill-current" /> : <PinOff className="h-4 w-4" />}
                                            </button>
                                            <button onClick={() => openEdit(n)} className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => remove(n)} className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-black/5 dark:hover:bg-white/10">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {n.content && (
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 line-clamp-4">
                                            {n.content}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center justify-between">
                                        {n.category ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-200/70 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
                                                <Tag className="h-3 w-3" /> {n.category.name}
                                            </span>
                                        ) : <span />}
                                        <p className="text-xs text-neutral-500">
                                            {new Date(n.updated_at ?? n.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Mobile FAB */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.3 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={openCreate}
                className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-lavender-500 to-blush-500 text-white shadow-[0_8px_24px_-4px_rgba(146,115,220,0.5)] sm:hidden"
            >
                <Plus className="h-6 w-6" />
            </motion.button>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Catatan' : 'Catatan Baru'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Judul *" value={form.title} onChange={set('title')} required />
                    <Textarea label="Isi" value={form.content} onChange={set('content')} rows={6} placeholder="Mulai menulis..." />
                    <div className="flex flex-wrap gap-2">
                        {colors.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, color: c }))}
                                className={`h-8 w-8 rounded-full ${c} border-2 transition-all duration-200 ${
                                    form.color === c ? 'border-blush-500 scale-110 shadow-[0_2px_8px_-2px_rgba(230,75,125,0.4)]' : 'border-transparent hover:scale-110'
                                }`}
                            />
                        ))}
                    </div>
                    <Select label="Kategori" value={form.category_id} onChange={set('category_id')}>
                        <option value="">Tidak ada</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-800/50">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" loading={saving} disabled={saving}>
                            {editing ? 'Simpan' : 'Buat'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
