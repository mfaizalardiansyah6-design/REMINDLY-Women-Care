import client from './client';

export const dashboardApi = {
    index: () => client.get('/dashboard').then((r) => r.data.data ?? r.data),
};
