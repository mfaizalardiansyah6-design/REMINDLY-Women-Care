import client from './client';

export const billApi = {
    index: (params) => client.get('/bills', { params }).then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/bills/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/bills', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/bills/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/bills/${id}`),
    togglePaid: (id) => client.post(`/bills/${id}/toggle-paid`).then((r) => r.data.data ?? r.data),
};
