import client from './client';

export const aiApi = {
    parse: (text) => client.post('/ai/parse', { text }).then((r) => r.data.parsed),
    createFromVoice: (text) => client.post('/ai/create-from-voice', { text }).then((r) => r.data.data ?? r.data),
    assistant: (message) => client.post('/assistant', { message }).then((r) => r.data),
};
