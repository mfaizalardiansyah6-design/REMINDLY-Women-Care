import client from './client';

export const periodApi = {
    summary: () => client.get('/period/summary').then((r) => r.data),
    cycles: (params) => client.get('/period/cycles', { params }).then((r) => r.data),
    storeCycle: (payload) => client.post('/period/cycles', payload).then((r) => r.data.data ?? r.data),
    destroyCycle: (id) => client.delete(`/period/cycles/${id}`),
    logs: (params) => client.get('/period/logs', { params }).then((r) => r.data.data ?? r.data),
    storeLog: (payload) => client.post('/period/logs', payload).then((r) => r.data.data ?? r.data),
    updateLog: (id, payload) => client.put(`/period/logs/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroyLog: (id) => client.delete(`/period/logs/${id}`),
};
