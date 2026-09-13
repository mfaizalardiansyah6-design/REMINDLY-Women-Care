import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListTodo, Plus, Check, Trash2, Pencil, CalendarDays, Search, Filter, Tag } from 'lucide-react';
import { taskApi } from '../api/tasks';
import { categoryApi } from '../api/categories';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = { title: '', description: '', due_at: '', priority: 'medium', category_id: '' };

const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 280, damping: 26, delay: i * 0.04 },
    }),
};

export default function Tasks() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        categoryApi.index('task').then(setCategories).catch(() => setCategories([]));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await taskApi.index({ search: search || undefined, filter: filter || undefined, category_id: categoryId || undefined });
            setItems(res ?? []);
        } catch {
            toast.error('Gagal memuat tugas.');
        } finally {
            setLoading(false);
        }
    }, [search, filter, categoryId, toast]);

    useEffect(() => {
        const t = setTimeout(load, 250);
        return () => clearTimeout(t);
    }, [load]);

    const stats = useMemo(() => {
        const total = items.length;
        const done = items.filter((t) => t.completed).length;
        return { total, done, active: total - done };
    }, [items]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (t) => {
        setEditing(t);
        setForm({
            title: t.title,
            description: t.description ?? '',
            due_at: t.due_at ? t.due_at.slice(0, 10) : '',
            priority: t.priority,
            category_id: t.category_id ?? '',
        });
        setModalOpen(true);
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await taskApi.update(editing.id, form);
                toast.success('Tugas diperbarui.');
            } else {
                await taskApi.store(form);
                toast.success('Tugas ditambahkan.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan tugas.');
        } finally {
            setSaving(false);
        }
    };

    const toggle = async (t) => {
        try {
            if (t.completed) {
                await taskApi.reopen(t.id);
            } else {
                await taskApi.complete(t.id);
                toast.success('Tugas selesai!');
            }
            load();
        } catch {
            toast.error('Gagal mengubah status.');
        }
    };

    const remove = async (t) => {
        if (!window.confirm(`Hapus tugas "${t.title}"?`)) return;
        try {
            await taskApi.destroy(t.id);
            toast.success('Tugas dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const filters = [
        { value: '', label: 'Semua' },
        { value: 'overdue', label: 'Terlewat' },
        { value: 'due-today', label: 'Hari Ini' },
    ];

    const progress = stats.total ? (stats.done / stats.total) * 100 : 0;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <div className="glass-strong hairline flex items-center justify-between gap-4 rounded-3xl px-5 py-4 shadow-soft sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-blush-500 text-white shadow-[0_4px_16px_-2px_rgba(245,158,11,0.45)]">
                            <ListTodo className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white sm:text-3xl">To-Do</h1>
                            <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
                                {stats.done} dari {stats.total} tugas selesai ({stats.active} aktif)
                            </p>
                        </div>
                    </div>
                    <Button onClick={openCreate} className="hidden sm:inline-flex">
                        <Plus className="h-4 w-4" /> Tambah Tugas
                    </Button>
                </div>
            </motion.header>

            {/* Progress */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 28, delay: 0.1 }}
                className="mb-4 h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: 'spring', stiffness: 100, damping: 22, delay: 0.25 }}
                    className="h-full rounded-full bg-gradient-to-r from-blush-500 to-lavender-500"
                />
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.12 }}
                className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari tugas..."
                        className="w-full rounded-2xl border border-neutral-200/80 bg-white/70 py-2.5 pl-11 pr-3 text-sm text-neutral-900 placeholder-neutral-400/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur transition-all duration-200 focus:border-blush-400 focus:outline-none focus:ring-4 focus:ring-blush-100/60 dark:border-neutral-700/70 dark:bg-neutral-800/60 dark:text-neutral-100 dark:focus:border-blush-500 dark:focus:ring-blush-900/30"
                    />
                </div>
                <div className="relative w-full sm:w-40">
                    <Filter className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-9">
                        {filters.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </Select>
                </div>
                {categories.length > 0 && (
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-44">
                        <option value="">Semua Kategori</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                )}
            </motion.div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState title="Tidak ada tugas" description="Tambahkan tugas untuk mulai produktif." icon={ListTodo} />
            ) : (
                <motion.div
                    variants={{ hidden: {}, show: {} }}
                    initial="hidden"
                    animate="show"
                    className="flex flex-col gap-2.5"
                >
                    <AnimatePresence>
                        {items.map((t, i) => (
                            <motion.div
                                key={t.id}
                                variants={itemVariants}
                                custom={i}
                                layout
                                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            >
                                <Card className={`p-4 transition-opacity duration-200 hover:shadow-lifted ${t.completed ? 'opacity-60' : ''}`}>
                                    <div className="flex items-start gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => toggle(t)}
                                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                                                t.completed
                                                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-[0_2px_8px_-2px_rgba(16,185,129,0.5)]'
                                                    : 'border-neutral-300 text-transparent hover:border-lavender-400 dark:border-neutral-600'
                                            }`}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.button>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className={`text-base font-medium tracking-tight ${t.completed ? 'line-through text-neutral-400' : ''}`}>{t.title}</p>
                                                <Badge priority={t.priority} />
                                                {t.category && (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                                                        <Tag className="h-3 w-3" /> {t.category.name}
                                                    </span>
                                                )}
                                            </div>
                                            {t.description && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{t.description}</p>}
                                            {t.due_at && (
                                                <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    {new Date(t.due_at).toLocaleDateString('id-ID', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                    })}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button onClick={() => openEdit(t)} title="Edit" className="pressable rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-blush-600 dark:hover:bg-neutral-800">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => remove(t)} title="Hapus" className="pressable rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
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
                className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-blush-500 text-white shadow-[0_8px_24px_-4px_rgba(245,158,11,0.5)] sm:hidden"
            >
                <Plus className="h-6 w-6" />
            </motion.button>

            {/* Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Tugas' : 'Tambah Tugas'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Judul *" value={form.title} onChange={set('title')} required />
                    <Textarea label="Deskripsi" value={form.description} onChange={set('description')} rows={2} />
                    <Input type="date" label="Jatuh tempo" value={form.due_at} onChange={set('due_at')} />
                    <Select label="Prioritas" value={form.priority} onChange={set('priority')}>
                        <option value="low">Rendah</option>
                        <option value="medium">Sedang</option>
                        <option value="high">Tinggi</option>
                    </Select>
                    <Select label="Kategori" value={form.category_id} onChange={set('category_id')}>
                        <option value="">Tidak ada</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Select>
                    <div className="mt-2 flex justify-end gap-2 border-t border-neutral-200/50 pt-4 dark:border-neutral-800/50">
                        <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
                        <Button type="submit" loading={saving} disabled={saving}>
                            {editing ? 'Simpan' : 'Tambah'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
