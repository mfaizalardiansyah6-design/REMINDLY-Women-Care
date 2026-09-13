import client from './client';

export const notificationApi = {
    index: (params) => client.get('/notifications', { params }).then((r) => r.data),
    unreadCount: () => client.get('/notifications/unread-count').then((r) => r.data),
    markRead: (id) => client.post(`/notifications/${id}/read`),
    markAllRead: () => client.post('/notifications/read-all'),
    destroy: (id) => client.delete(`/notifications/${id}`),
};
