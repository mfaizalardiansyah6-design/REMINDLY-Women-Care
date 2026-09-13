import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
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

export default function Register() {
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        try {
            await register(form);
            toast.success('Akun berhasil dibuat. Selamat datang!');
            navigate('/');
        } catch (err) {
            const api = getApiErrors(err, 'Gagal mendaftar.');
            setErrors(api.errors ?? {});
            toast.error(api.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Buat Akun"
            subtitle="Mulai atur pengingat, catatan, dan siklus Anda."
            footer={
                <>
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-semibold text-blush-500 transition-colors hover:text-blush-600 hover:underline">
                        Masuk
                    </Link>
                </>
            }
        >
            <form onSubmit={submit} className="flex flex-col gap-4">
                <motion.div variants={fieldVariants} custom={0} initial="hidden" animate="show">
                    <Input
                        label="Nama"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        error={errors.name?.[0]}
                        placeholder="Nama lengkap"
                        required
                    />
                </motion.div>
                <motion.div variants={fieldVariants} custom={1} initial="hidden" animate="show">
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email?.[0]}
                        placeholder="nama@email.com"
                        required
                    />
                </motion.div>
                <motion.div variants={fieldVariants} custom={2} initial="hidden" animate="show">
                    <Input
                        label="Kata Sandi"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        error={errors.password?.[0]}
                        placeholder="Minimal 8 karakter"
                        required
                    />
                </motion.div>
                <motion.div variants={fieldVariants} custom={3} initial="hidden" animate="show">
                    <Input
                        label="Konfirmasi Kata Sandi"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                        error={errors.password_confirmation?.[0]}
                        placeholder="Ulangi kata sandi"
                        required
                    />
                </motion.div>
                <motion.div variants={fieldVariants} custom={4} initial="hidden" animate="show">
                    <Button type="submit" loading={loading} className="mt-1">
                        <Sparkles className="h-4 w-4" />
                        Daftar
                    </Button>
                </motion.div>
            </form>
        </AuthLayout>
    );
}
