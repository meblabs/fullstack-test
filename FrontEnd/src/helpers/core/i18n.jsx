import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import dayjs from 'dayjs';

import 'dayjs/locale/it';
import 'dayjs/locale/en';

import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import config from '../../config';

const { allowedLanguages, defaultLanguage } = config;

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLanguage,
    debug: import.meta.env.VITE_ENV === 'dev',
    supportedLngs: allowedLanguages,
    defaultNS: 'common',
    ns: ['common', 'core']
  });

i18n.on('languageChanged', lng => dayjs.locale(lng));

export default i18n;
