import axios from 'axios';

const client = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

client.interceptors.request.use(async (config) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase() ?? '')) {
        try {
            await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        } catch (e) {
            // ignore
        }
    }
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
    },
);

export default client;
