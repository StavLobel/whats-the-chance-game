import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonHe from '../locales/he/common.json';
import challengesHe from '../locales/he/challenges.json';
import notificationsHe from '../locales/he/notifications.json';

import commonEn from '../locales/en/common.json';
import challengesEn from '../locales/en/challenges.json';
import notificationsEn from '../locales/en/notifications.json';

const resources = {
  he: {
    common: commonHe,
    challenges: challengesHe,
    notifications: notificationsHe,
  },
  en: {
    common: commonEn,
    challenges: challengesEn,
    notifications: notificationsEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'he', // Hebrew as default
    debug: import.meta.env.DEV,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Namespace options
    defaultNS: 'common',
    ns: ['common', 'challenges', 'notifications'],

    // RTL support
    react: {
      useSuspense: false,
    },
  });

// Helper function to get current language direction
export const getLanguageDirection = (language?: string): 'ltr' | 'rtl' => {
  const currentLang = language || i18n.language;
  return currentLang === 'he' ? 'rtl' : 'ltr';
};

// Helper function to set language and update document direction
export const setLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);
  
  // Update document direction
  const direction = getLanguageDirection(language);
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
  
  // Update document title
  const title = i18n.t('common:app.title');
  document.title = title;
};

// Initialize document direction on app start
const initializeLanguage = (): void => {
  const direction = getLanguageDirection();
  document.documentElement.dir = direction;
  document.documentElement.lang = i18n.language;
  
  const title = i18n.t('common:app.title');
  document.title = title;
};

// Call initialization
initializeLanguage();

export default i18n; 