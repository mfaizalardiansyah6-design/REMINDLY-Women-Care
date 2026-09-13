import client from './client';

export const taskApi = {
    index: (params) => client.get('/tasks', { params }).then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/tasks/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/tasks', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/tasks/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/tasks/${id}`),
    complete: (id) => client.post(`/tasks/${id}/complete`).then((r) => r.data.data ?? r.data),
    reopen: (id) => client.post(`/tasks/${id}/reopen`).then((r) => r.data.data ?? r.data),
};
