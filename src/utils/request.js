import axios from 'axios';
import { Message } from 'view-design';
import { showLoading, closeLoading } from '@/utils/loading';
import path from './path';

let serviceError = false;

const service = axios.create({
  baseURL: path.apibaseUrl,
  timeout: 60000
});

service.interceptors.request.use(
  config => {
    if (serviceError) {
      return Promise.reject();
    }
    showLoading();
    config.headers.Authorization = localStorage.getItem('Authorization');
    return config;
  },
  error => Promise.reject(error)
);

service.interceptors.response.use(
  response => {
    closeLoading();
    const res = response.data;
    if (!res.success) {
      serviceError = true;
      return Message.error({
        content: res.retMsg
      });
    }
    return res;
  },
  error => {
    closeLoading();
    return Promise.reject(error);
  }
);

export default service;
