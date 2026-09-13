import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getApiErrors } from '../lib/errors';

const fieldVariants = {
    hidden: { opacity: 0, y: 10 },
    show: (i) => ({
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 26, delay: i * 0.06 },
    }),
};

export default function Login() {
    const { login } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({ email: '', password: '' });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await login(form);
            toast.success('Selamat datang kembali!');
            navigate('/');
        } catch (err) {
            const api = getApiErrors(err, 'Gagal masuk.');
            setErrors(api.errors ?? {});
            toast.error(api.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Masuk"
            subtitle="Lanjutkan untuk mengelola pengingat & siklus Anda."
            footer={
                <>
                    Belum punya akun?{' '}
                    <Link to="/register" className="font-semibold text-blush-500 transition-colors hover:text-blush-600 hover:underline">
                        Daftar
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                <motion.div variants={fieldVariants} custom={0} initial="hidden" animate="show">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="nama@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email?.[0]}
                        required
                    />
                </motion.div>
                <motion.div variants={fieldVariants} custom={1} initial="hidden" animate="show" className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold tracking-tight text-neutral-700 dark:text-neutral-300">
                        Kata Sandi
                    </label>
                    <div className="relative">
                        <Input
                            type={show ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            error={errors.password?.[0]}
                            className="pr-11"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                        >
                            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </motion.div>
                <motion.div variants={fieldVariants} custom={2} initial="hidden" animate="show" className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-blush-500 transition-colors hover:text-blush-600 hover:underline">
                        Lupa kata sandi?
                    </Link>
                </motion.div>
                <motion.div variants={fieldVariants} custom={3} initial="hidden" animate="show">
                    <Button type="submit" loading={loading} className="mt-1 w-full">
                        <LogIn className="h-4 w-4" />
                        Masuk
                    </Button>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
