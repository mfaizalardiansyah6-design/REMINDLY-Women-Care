import client from './client';

export const noteApi = {
    index: (params) => client.get('/notes', { params }).then((r) => r.data),
    show: (id) => client.get(`/notes/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/notes', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/notes/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/notes/${id}`),
    pin: (id) => client.post(`/notes/${id}/pin`).then((r) => r.data.data ?? r.data),
};
