import { motion } from 'motion/react';
import { Sun, Moon, User, ShieldCheck, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();

    const toggle = { type: 'spring', stiffness: 500, damping: 30 };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-neutral-900 dark:text-white">Pengaturan</h1>
                <p className="mt-1 text-[15px] text-neutral-500 dark:text-neutral-400">Kelola preferensi akun dan tampilan aplikasi.</p>
            </motion.header>

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
                className="flex flex-col gap-4"
            >
                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blush-500 to-lavender-500 text-white shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]">
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-neutral-900 dark:text-white">{user?.name}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-950/40">
                                {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                            </div>
                            <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Mode Gelap</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">Sesuaikan tampilan sesuai preferensimu.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-gradient-to-r from-blush-500 to-lavender-500' : 'bg-neutral-300'}`}
                            title="Ganti tema"
                        >
                            <motion.span
                                layout
                                transition={toggle}
                                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm ${theme === 'dark' ? 'left-6' : 'left-1'}`}
                            />
                        </button>
                    </div>
                </Card>

                <Card className="p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-500 dark:bg-emerald-950/40">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium text-neutral-900 dark:text-white">Keamanan</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Sesi login Anda diamankan dengan autentikasi cookie Sanctum.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5">
                    <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                    >
                        <LogOut className="h-4 w-4" /> Keluar
                    </Button>
                </Card>
            </motion.div>
        </div>
    );
}
