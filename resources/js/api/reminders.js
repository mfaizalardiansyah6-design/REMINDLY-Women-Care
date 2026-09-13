import client from './client';

export const reminderApi = {
    index: (params) => client.get('/reminders', { params }).then((r) => r.data),
    show: (id) => client.get(`/reminders/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/reminders', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/reminders/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/reminders/${id}`),
    complete: (id) => client.post(`/reminders/${id}/complete`).then((r) => r.data.data ?? r.data),
    reopen: (id) => client.post(`/reminders/${id}/reopen`).then((r) => r.data.data ?? r.data),
    snooze: (id, minutes) => client.post(`/reminders/${id}/snooze`, { minutes }).then((r) => r.data.data ?? r.data),
    duplicate: (id) => client.post(`/reminders/${id}/duplicate`).then((r) => r.data.data ?? r.data),
};
