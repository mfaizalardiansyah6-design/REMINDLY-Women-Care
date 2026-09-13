import client from './client';

export const birthdayApi = {
    index: () => client.get('/birthdays').then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/birthdays/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/birthdays', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/birthdays/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/birthdays/${id}`),
};
