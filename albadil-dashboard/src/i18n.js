import i18n from "i18next";
import { initReactI18next } from 'react-i18next';

import en from './locale/en'
import fr from './locale/fr';
import ar from './locale/ar';

i18n.use(initReactI18next).init({
  // we init with resources
  resources: {
    en: en,
    fr: fr,
    ar: ar
  },
  fallbackLng: "fr",
  debug: false,

  // have a common namespace used around the full app
  ns: ["translations"],
  defaultNS: "translations",

  keySeparator: false, // we use content as keys

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ","
  },

  react: {
    wait: true
  }
});

export default i18n;
