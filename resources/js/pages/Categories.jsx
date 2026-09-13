import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Tag, Plus, Pencil, Trash2, Palette } from 'lucide-react';
import { categoryApi } from '../api/categories';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const COLORS = [
    { value: 'rose', label: 'Merah Muda', cls: 'bg-rose-400' },
    { value: 'amber', label: 'Kuning', cls: 'bg-amber-400' },
    { value: 'emerald', label: 'Hijau', cls: 'bg-emerald-400' },
    { value: 'sky', label: 'Biru', cls: 'bg-sky-400' },
    { value: 'violet', label: 'Ungu', cls: 'bg-violet-400' },
    { value: 'lavender', label: 'Lavender', cls: 'bg-lavender-400' },
];

const TYPE_LABEL = { reminder: 'Pengingat', note: 'Catatan', task: 'Tugas' };

const emptyForm = { name: '', type: 'reminder', color: 'lavender', icon: '' };

export default function Categories() {
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            setItems((await categoryApi.index()) ?? []);
        } catch {
            toast.error('Gagal memuat kategori.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setModalOpen(true);
    };

    const openEdit = (c) => {
        setEditing(c);
        setForm({ name: c.name, type: c.type, color: c.color ?? 'lavender', icon: c.icon ?? '' });
        setModalOpen(true);
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await categoryApi.update(editing.id, form);
                toast.success('Kategori diperbarui.');
            } else {
                await categoryApi.store(form);
                toast.success('Kategori ditambahkan.');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan kategori.');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (c) => {
        if (!window.confirm(`Hapus kategori "${c.name}"?`)) return;
        try {
            await categoryApi.destroy(c.id);
            toast.success('Kategori dihapus.');
            load();
        } catch {
            toast.error('Gagal menghapus.');
        }
    };

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6 flex flex-wrap items-center justify-between gap-3"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Kategori</h1>
                    <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Kelompokkan pengingat, catatan, dan tugas agar lebih rapi.</p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="h-4 w-4" /> Tambah Kategori
                </Button>
            </motion.header>

            {loading ? (
                <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : items.length === 0 ? (
                <EmptyState title="Belum ada kategori" description="Buat kategori untuk mengelompokkan aktivitasmu." icon={Tag} />
            ) : (
                <motion.div initial="hidden" animate="show" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((c, i) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: i * 0.04 }}
                        >
                            <Card className="p-4 transition-shadow hover:shadow-lifted hover" >
                                <div className="flex items-center gap-3">
                                    <span className={`h-3.5 w-3.5 shrink-0 rounded-full ${COLORS.find((x) => x.value === c.color)?.cls ?? 'bg-neutral-300'}`} />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-neutral-900 dark:text-white">{c.name}</p>
                                        <span className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            <Palette className="h-3 w-3" />
                                            {TYPE_LABEL[c.type] ?? c.type}
                                        </span>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button onClick={() => openEdit(c)} title="Edit" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-blush-600 dark:hover:bg-neutral-800">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => remove(c)} title="Hapus" className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-rose-600 dark:hover:bg-neutral-800">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Kategori' : 'Tambah Kategori'}>
                <form onSubmit={save} className="flex flex-col gap-4">
                    <Input label="Nama *" value={form.name} onChange={set('name')} required />
                    <Select label="Tipe" value={form.type} onChange={set('type')}>
                        <option value="reminder">Pengingat</option>
                        <option value="note">Catatan</option>
                        <option value="task">Tugas</option>
                    </Select>
                    <div>
                        <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Warna</p>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    title={c.label}
                                    onClick={() => setForm((f) => ({ ...f, color: c.value }))}
                                    className={`h-7 w-7 rounded-full ${c.cls} ${form.color === c.value ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
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
