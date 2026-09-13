import client from './client';

export const authApi = {
    me: () => client.get('/auth/me'),
    login: (payload) => client.post('/auth/login', payload),
    register: (payload) => client.post('/auth/register', payload),
    logout: () => client.post('/auth/logout'),
    forgotPassword: (payload) => client.post('/auth/forgot-password', payload),
    resetPassword: (payload) => client.post('/auth/reset-password', payload),
    updateProfile: (payload) => client.put('/auth/profile', payload),
    changePassword: (payload) => client.put('/auth/password', payload),
};
