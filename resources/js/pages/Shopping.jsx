import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Plus, Trash2, Pencil, Check, X, ListRestart } from 'lucide-react';
import { shoppingApi } from '../api/shopping';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const COLORS = [
    { value: 'rose', cls: 'bg-rose-400' },
    { value: 'amber', cls: 'bg-amber-400' },
    { value: 'emerald', cls: 'bg-emerald-400' },
    { value: 'sky', cls: 'bg-sky-400' },
    { value: 'violet', cls: 'bg-violet-400' },
    { value: 'lavender', cls: 'bg-lavender-400' },
];

export default function Shopping() {
    const toast = useToast();
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [color, setColor] = useState('lavender');
    const [saving, setSaving] = useState(false);
    const [itemInputs, setItemInputs] = useState({});

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setLists((await shoppingApi.index()) ?? []);
        } catch {
            toast.error('Gagal memuat daftar belanja.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => {
        setEditing(null);
        setName('');
        setColor('lavender');
        setModalOpen(true);
    };

    const openEdit = (l) => {
        setEditing(l);
        setName(l.name);
        setColor(l.color ?? 'lavender');
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await shoppingApi.update(editing.id, { name, color });
                toast.success('Daftar diperbarui.');
            } else {
                await shoppingApi.store({ name, color });
                toast.success('Daftar belanja dibuat.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan daftar.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (l) => {
        if (!window.confirm(`Hapus daftar "${l.name}"?`)) return;
        try {
            await shoppingApi.destroy(l.id);
            toast.success('Daftar dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    const itemValue = (id) => itemInputs[id] ?? '';

    const addItem = async (listId) => {
        const value = itemValue(listId);
        if (!value.trim()) return;
        try {
            await shoppingApi.addItem(listId, { name: value.trim() });
            setItemInputs((s) => ({ ...s, [listId]: '' }));
            load();
        } catch {
            toast.error('Gagal menambah item.');
        }
    };

    const toggleItem = async (item) => {
        try {
            await shoppingApi.toggleItem(item.id);
            load();
        } catch {
            toast.error('Gagal mengubah item.');
        }
    };

    const removeItem = async (item) => {
        try {
            await shoppingApi.destroyItem(item.id);
            load();
        } catch {
            toast.error('Gagal menghapus item.');
        }
    };

    const progress = (l) => (l.total_items ? Math.round((l.checked_items / l.total_items) * 100) : 0);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Daftar Belanja</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Kelola daftar belanja dan centang item saat selesai.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Buat Daftar
                </Button>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : lists.length === 0 ? (
                <EmptyState title="Belum ada daftar" description="Buat daftar belanja pertama kamu." icon={ShoppingCart} />
            ) : (
                <motion.div initial="hidden" animate="show" className="flex flex-col gap-4">
                    {lists.map((l, i) => (
                        <motion.div
                            key={l.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.04 }}
                        >
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${COLORS.find((x) => x.value === l.color)?.cls ?? 'bg-neutral-300'}`} />
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-neutral-900 dark:text-white">{l.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                        {l.checked_items}/{l.total_items} item
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <button onClick={() => openEdit(l)} title="Edit" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-blush-600 dark:hover:bg-neutral-800">
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => remove(l)} title="Hapus" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            {l.total_items > 0 && (
                                <div className="mt-3 mb-3 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blush-500 to-lavender-500 transition-all"
                                        style={{ width: `${progress(l)}%` }}
                                    />
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                {(l.items ?? []).map((item) => (
                                    <div key={item.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                                        <button
                                            onClick={() => toggleItem(item)}
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                                item.checked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-300 text-transparent hover:border-lavender-400'
                                            }`}
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <span className={`flex-1 text-sm ${item.checked ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-200'}`}>
                                            {item.name}
                                        </span>
                                        <button onClick={() => removeItem(item)} className="rounded p-1 text-neutral-300 hover:text-rose-500">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex gap-2">
                                <Input
                                    value={itemValue(l.id)}
                                    onChange={(e) => setItemInputs((s) => ({ ...s, [l.id]: e.target.value }))}
                                    placeholder="Tambah item..."
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(l.id); } }}
                                    className="flex-1"
                                />
                                <Button variant="outline" onClick={() => addItem(l.id)} title="Tambah item">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Daftar' : 'Buat Daftar Belanja'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Nama *" value={name} onChange={(e) => setName(e.target.value)} required />
                    <div>
                        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Warna</p>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`h-7 w-7 rounded-full ${c.cls} ${color === c.value ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
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
