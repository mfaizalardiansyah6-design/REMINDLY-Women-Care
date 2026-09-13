import client from './client';

export const locationApi = {
    index: (params) => client.get('/locations', { params }).then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/locations/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/locations', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/locations/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/locations/${id}`),
};
