import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const { data } = await authApi.me();
            setUser(data.data ?? data);
        } catch (e) {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        const boot = async () => {
            await refreshUser();
            setLoading(false);
        };
        boot();

        const onUnauthorized = () => setUser(null);
        window.addEventListener('auth:unauthorized', onUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
    }, [refreshUser]);

    const login = async (payload) => {
        await authApi.login(payload);
        await refreshUser();
        return user;
    };

    const register = async (payload) => {
        await authApi.register(payload);
        await refreshUser();
        return user;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
        }
    };

    const value = { user, setUser, loading, login, register, logout, refreshUser };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
