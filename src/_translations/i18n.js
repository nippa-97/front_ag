import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { TRANSLATIONS_TA } from "./ta/translations";
import { TRANSLATIONS_EN } from "./en/translations";
import { TRANSLATIONS_AR } from "./ar/translations";
import { TRANSLATIONS_HE } from "./he/translations";

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  lng: "he",
  resources: {
     en: {
       translation: TRANSLATIONS_EN
     },
     ta: {
       translation: TRANSLATIONS_TA
     },
     ar: {
        translation: TRANSLATIONS_AR
      },
     he: {
         translation: TRANSLATIONS_HE
       }
  }
 });

//  i18n.changeLanguage("he");

 export default i18n;