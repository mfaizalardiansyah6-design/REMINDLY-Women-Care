import client from './client';

export const shoppingApi = {
    index: () => client.get('/shopping').then((r) => r.data.data ?? r.data),
    show: (id) => client.get(`/shopping/${id}`).then((r) => r.data.data ?? r.data),
    store: (payload) => client.post('/shopping', payload).then((r) => r.data.data ?? r.data),
    update: (id, payload) => client.put(`/shopping/${id}`, payload).then((r) => r.data.data ?? r.data),
    destroy: (id) => client.delete(`/shopping/${id}`),
    addItem: (id, payload) => client.post(`/shopping/${id}/items`, payload).then((r) => r.data.data ?? r.data),
    toggleItem: (itemId) => client.post(`/shopping/items/${itemId}/toggle`).then((r) => r.data.data ?? r.data),
    updateItem: (itemId, payload) => client.put(`/shopping/items/${itemId}`, payload).then((r) => r.data.data ?? r.data),
    destroyItem: (itemId) => client.delete(`/shopping/items/${itemId}`),
};
