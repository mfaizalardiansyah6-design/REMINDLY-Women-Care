import client from './client';

export const categoryApi = {
    index: (type) => client.get('/categories', { params: type ? { type } : undefined }).then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/categories/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/categories', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/categories/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/categories/${id}`),
};
