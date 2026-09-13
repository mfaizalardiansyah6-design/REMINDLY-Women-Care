import { useState } from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Save, KeyRound } from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

export default function Profile() {
    const toast = useToast();
    const { user, refreshUser } = useAuth();

    const [profile, setProfile] = useState({
        name: user?.name ?? '',
        gender: user?.gender ?? 'female',
        birthdate: user?.birthdate ?? '',
        period_notifications: user?.period_notifications ?? false,
    });
    const [savingProfile, setSavingProfile] = useState(false);

    const [password, setPassword] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [savingPassword, setSavingPassword] = useState(false);

    const setProfileField = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));
    const setPasswordField = (key) => (e) => setPassword((p) => ({ ...p, [key]: e.target.value }));

    const saveProfile = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await authApi.updateProfile({
                name: profile.name,
                gender: profile.gender,
                birthdate: profile.birthdate || null,
                period_notifications: profile.period_notifications,
            });
            await refreshUser();
            toast.success('Profil diperbarui.');
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal menyimpan profil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            await authApi.changePassword(password);
            setPassword({ current_password: '', password: '', password_confirmation: '' });
            toast.success('Kata sandi berhasil diubah.');
        } catch (err) {
            toast.error(err?.response?.data?.message ?? 'Gagal mengubah kata sandi.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Profil</h1>
                <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Perbarui informasi akun dan kata sandi Anda.</p>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
                className="flex flex-col gap-4"
            >
                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{profile.name || user?.name}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                        </div>
                    </div>

                    <form onSubmit={saveProfile} className="flex flex-col gap-4">
                        <Input label="Nama *" value={profile.name} onChange={setProfileField('name')} required />
                        <Select label="Jenis Kelamin" value={profile.gender} onChange={setProfileField('gender')}>
                            <option value="female">Perempuan</option>
                            <option value="male">Laki-laki</option>
                            <option value="other">Lainnya</option>
                        </Select>
                        <Input type="date" label="Tanggal Lahir" value={profile.birthdate} onChange={setProfileField('birthdate')} />
                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Notifikasi siklus menstruasi</span>
                            <input
                                type="checkbox"
                                checked={profile.period_notifications}
                                onChange={(e) => setProfile((p) => ({ ...p, period_notifications: e.target.checked }))}
                                className="h-4 w-4 accent-blush-500"
                            />
                        </label>
                        <div className="flex justify-end">
                            <Button type="submit" loading={savingProfile} disabled={savingProfile}>
                                <Save className="h-4 w-4" /> Simpan
                            </Button>
                        </div>
                    </form>
                </Card>

                <Card className="p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500 dark:bg-emerald-950/40">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900 dark:text-white">Keamanan</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Ganti kata sandi akun Anda.</p>
                        </div>
                    </div>

                    <form onSubmit={savePassword} className="flex flex-col gap-4">
                        <Input type="password" label="Kata sandi saat ini *" value={password.current_password} onChange={setPasswordField('current_password')} required />
                        <div className="grid grid-cols-2 gap-3">
                            <Input type="password" label="Kata sandi baru *" value={password.password} onChange={setPasswordField('password')} required minLength={8} />
                            <Input type="password" label="Ulangi kata sandi *" value={password.password_confirmation} onChange={setPasswordField('password_confirmation')} required minLength={8} />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="outline" loading={savingPassword} disabled={savingPassword}>
                                <KeyRound className="h-4 w-4" /> Ubah Kata Sandi
                            </Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
