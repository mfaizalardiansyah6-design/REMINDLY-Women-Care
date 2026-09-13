import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/ui/Spinner';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Dashboard from './pages/Dashboard';
import Reminders from './pages/Reminders';
import Notes from './pages/Notes';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Period from './pages/Period';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Shopping from './pages/Shopping';
import Bills from './pages/Bills';
import Birthdays from './pages/Birthdays';
import Notifications from './pages/Notifications';
import Categories from './pages/Categories';
import Locations from './pages/Locations';
import VoiceReminder from './pages/VoiceReminder';
import AiAssistant from './pages/AiAssistant';

function Protected({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function RoutesProvider() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
                element={
                    <Protected>
                        <AppLayout />
                    </Protected>
                }
            >
                <Route path="/" element={<Dashboard />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/period" element={<Period />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/shopping" element={<Shopping />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/birthdays" element={<Birthdays />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/voice" element={<VoiceReminder />} />
                <Route path="/assistant" element={<AiAssistant />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <RoutesProvider />
                    </BrowserRouter>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    </React.StrictMode>,
);
