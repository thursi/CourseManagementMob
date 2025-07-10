import axios from 'axios';
import {baseURL} from 'config';

const instance = axios.create({
  baseURL: baseURL,
  headers: {
    Accept: '*/*',
  },
});

export function createAxios({getState}: {getState: any}) {
  instance.interceptors.request.use(
    (config: any) => {
      const {contentType, ...headers} = config.headers;
      if (config.data instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        headers['Content-Type'] = contentType || 'application/json';
      }

      const state = getState();
      const token = state.auth?.token; // Adjust to your state structure

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return {...config, headers};
    },
    error => Promise.reject(error),
  );
}

export default instance;
