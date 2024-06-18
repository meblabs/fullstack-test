/* eslint-disable no-param-reassign */
import { useEffect, useMemo } from 'react';
import axios from 'axios';
import { Modal } from 'antd';
import i18n from './i18n';

const Api = axios.create({
  baseURL: import.meta.env.VITE_ENDPOINT,
  withCredentials: true
});

export const ApiInterceptor = ({ children }) => {
  const [modal, contextHolder] = Modal.useModal();

  const errorComposer = error => onOk => {
    if (error.code === 'ERR_CANCELED') {
      return;
    }

    if (error.message === 'Network Error') {
      modal.error({
        title: i18n.t('core:networkError.title'),
        content: i18n.t('core:networkError.text'),
        onOk
      });
      return;
    }

    if (error.response?.data) {
      modal.error({
        title: `[${error.response.data.error}] ${i18n.t('common.error')}`,
        content: i18n.t(`core:errors.${error.response.data.error}`)
      });
    } else {
      modal.error({
        title: i18n.t('common.error'),
        content: error.message ? error.message : error.toString()
      });
    }
  };

  const resErrInterceptor = error => {
    error.globalHandler = errorComposer(error);

    return Promise.reject(error);
  };

  const interceptor = useMemo(() => Api.interceptors.response.use(e => e, resErrInterceptor), []);

  useEffect(() => () => Api.interceptors.response.eject(interceptor), []);

  return (
    <>
      {children}
      {contextHolder}
    </>
  );
};

export default Api;
