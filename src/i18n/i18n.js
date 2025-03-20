import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from './index'

i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    });

export const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
};

export default i18n;