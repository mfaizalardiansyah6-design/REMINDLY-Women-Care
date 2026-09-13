import client from './client';

export const calendarApi = {
    index: (year, month) => client.get('/calendar', { params: { year, month } }).then((r) => r.data),
};
