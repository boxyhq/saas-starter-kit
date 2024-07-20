// axios.config.js
import axios from 'axios';

const localApi = axios.create({
  baseURL: 'http://localhost:4002',
  timeout: 50000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json; charset=utf-8',
  },
});

const openAiApi = axios.create({
  baseURL: 'https://api.openai.com',
  timeout: 50000,
  headers: {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    Authorization: `Bearer YOUR_OPENAI_API_KEY`,
  },
});

const fetcher = (url, instance = 'localApi') => {
  const apiInstance = instance === 'localApi' ? localApi : openAiApi;
  return apiInstance.get(url[0]).then((res) => {
    if (!res.data) {
      throw Error(res.data.message);
    }
    return res.data;
  });
};

export { localApi, openAiApi, fetcher };
