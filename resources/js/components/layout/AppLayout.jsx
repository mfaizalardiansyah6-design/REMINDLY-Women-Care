import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    BellRing,
    Bot,
    Cake,
    CalendarDays,
    Droplets,
    Home,
    MapPin,
    Mic,
    Receipt,
    ShoppingCart,
    StickyNote,
    Tag,
    User,
    Sparkles,
    Settings,
    LogOut,
    Moon,
    Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { notificationApi } from '../../api/notifications';
import { cn } from '../../lib/cn';

const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/calendar', label: 'Kalender', icon: CalendarDays },
    { to: '/period', label: 'Siklus', icon: Droplets },
    { to: '/notes', label: 'Catatan', icon: StickyNote },
    { to: '/profile', label: 'Profil', icon: User },
];

const sidebarItems = [
    ...navItems,
    { to: '/reminders', label: 'Pengingat', icon: BellRing },
    { to: '/tasks', label: 'To-Do', icon: Sparkles },
    { to: '/notifications', label: 'Notifikasi', icon: BellRing },
    { to: '/shopping', label: 'Belanja', icon: ShoppingCart },
    { to: '/bills', label: 'Tagihan', icon: Receipt },
    { to: '/birthdays', label: 'Ulang Tahun', icon: Cake },
    { to: '/categories', label: 'Kategori', icon: Tag },
    { to: '/locations', label: 'Lokasi', icon: MapPin },
    { to: '/voice', label: 'Suara', icon: Mic },
    { to: '/assistant', label: 'Asisten', icon: Bot },
];

const bottomNav = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/calendar', label: 'Kalender', icon: CalendarDays },
    { to: '/period', label: 'Siklus', icon: Droplets },
    { to: '/notes', label: 'Catatan', icon: StickyNote },
    { to: '/profile', label: 'Profil', icon: User },
];

export default function AppLayout() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const toast = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        let cancelled = false;
        const fetchCount = async () => {
            try {
                const res = await notificationApi.unreadCount();
                if (!cancelled) setUnread(res.count ?? 0);
            } catch {
                /* ignore */
            }
        };
        fetchCount();
        const id = setInterval(fetchCount, 30000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        toast.info('Anda telah keluar.');
        navigate('/login');
    };

    const initials = (user?.name ?? '?')
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const SidebarLink = ({ to, label, icon: Icon, end }) => (
        <NavLink
            end={end}
            to={to}
            className={({ isActive }) =>
                cn(
                    'group relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-200',
                    isActive
                        ? 'text-white'
                        : 'text-neutral-600 hover:bg-neutral-100/60 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800/40 dark:hover:text-white',
                )
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 shadow-[0_4px_16px_-2px_rgba(230,75,125,0.45)]"
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                    )}
                    <Icon
                        className={cn(
                            'relative z-10 h-5 w-5 transition-transform duration-200 group-hover:scale-110',
                            isActive ? 'text-white' : 'text-neutral-500 dark:text-neutral-400',
                        )}
                    />
                    <span className="relative z-10">{label}</span>
                </>
            )}
        </NavLink>
    );

    return (
        <div className="app-bg min-h-screen lg:pl-[17rem]">
            {/* Desktop sidebar */}
            <aside className="glass hairline fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-neutral-200/50 lg:flex dark:border-neutral-800/60">
                <div className="flex items-center gap-3 px-6 pb-4 pt-6">
                    <motion.div
                        initial={{ scale: 0.9, rotate: -6 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                        whileHover={{ scale: 1.05, rotate: 3 }}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-500 to-lavender-500 shadow-[0_4px_16px_-2px_rgba(230,75,125,0.5)]"
                    >
                        <BellRing className="h-5 w-5 text-white" />
                    </motion.div>
                    <div>
                        <span className="block text-[17px] font-bold tracking-tight text-neutral-900 dark:text-white">
                            REMINDLY
                        </span>
                        <span className="block text-[11px] font-medium tracking-wide text-blush-500">Women Care</span>
                    </div>
                </div>

                <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-3">
                    <p className="px-3.5 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400/80">
                        Utama
                    </p>
                    {navItems.map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                    <p className="px-3.5 pb-1.5 pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400/80">
                        Kelola
                    </p>
                    {sidebarItems.slice(5).map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                </nav>

                <div className="border-t border-neutral-200/60 p-3 dark:border-neutral-800/60">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="pressable group flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100/60 dark:text-neutral-300 dark:hover:bg-neutral-800/40"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100/80 transition-colors group-hover:bg-neutral-200/80 dark:bg-neutral-800/70 dark:group-hover:bg-neutral-700/70">
                            {theme === 'dark' ? (
                                <Sun className="h-4 w-4 text-amber-500" />
                            ) : (
                                <Moon className="h-4 w-4 text-lavender-600" />
                            )}
                        </span>
                        {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                    </button>
                    <NavLink
                        to="/settings"
                        className="pressable group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100/60 dark:text-neutral-300 dark:hover:bg-neutral-800/40"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100/80 transition-colors group-hover:bg-neutral-200/80 dark:bg-neutral-800/70 dark:group-hover:bg-neutral-700/70">
                            <Settings className="h-4 w-4" />
                        </span>
                        Pengaturan
                    </NavLink>
                    <div className="mt-2 flex items-center gap-3 rounded-2xl bg-neutral-100/50 p-2.5 ring-1 ring-inset ring-neutral-200/50 dark:bg-neutral-800/40 dark:ring-neutral-700/50">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-lavender-400 text-sm font-bold text-white shadow-[0_2px_8px_-2px_rgba(230,75,125,0.5)]">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                                {user?.name}
                            </p>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 text-xs font-medium text-neutral-400 transition-colors hover:text-rose-500"
                            >
                                <LogOut className="h-3 w-3" />
                                Keluar
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="min-h-screen pb-24 lg:pb-10">
                {/* Notification bell */}
                <NavLink
                    to="/notifications"
                    className="glass hairline fixed right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full shadow-soft transition-all duration-200 hover:scale-105 hover:shadow-lifted dark:border-neutral-700/60"
                >
                    <BellRing className="h-5 w-5 text-neutral-600 dark:text-neutral-300" />
                    <AnimatePresence>
                        {unread > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-900"
                            >
                                {unread > 99 ? '99+' : unread}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </NavLink>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile bottom nav */}
            <nav className="glass-strong fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-neutral-200/50 px-2 py-1.5 sm:py-2 lg:hidden dark:border-neutral-800/60">
                {bottomNav.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                'relative flex flex-col items-center gap-0.5 rounded-2xl px-4 py-1 text-[10px] font-semibold transition-colors',
                                isActive ? 'text-blush-500' : 'text-neutral-500 dark:text-neutral-400',
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.span
                                        layoutId="bottom-active"
                                        className="absolute inset-x-0.5 -top-1 h-10 rounded-2xl bg-blush-500/10"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className="relative z-10 h-[22px] w-[22px]" />
                                <span className="relative z-10">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
