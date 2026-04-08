import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import translationAR from './locales/ar.json';
import translationEN from './locales/en.json';

const resources = {
    ar: {
        translation: translationAR,
    },
    en: {
        translation: translationEN,
    },
};

i18n
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n to react-i18next
    .init({
        resources,
        fallbackLng: 'ar', // Default to Arabic
        lng: 'ar', // Initial language
        debug: false,

        interpolation: {
            escapeValue: false, // React already escapes values
        },

        detection: {
            // Order of detection methods
            order: ['localStorage', 'cookie', 'navigator'],
            caches: ['localStorage', 'cookie'],
            lookupLocalStorage: 'i18nextLng',
            lookupCookie: 'i18nextLng',
        },
    });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;
