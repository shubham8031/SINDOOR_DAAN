import React, { createContext, useContext, useState } from 'react';
import translations from '../i18n/translations';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('sd_lang') || null);

  const t = (key) => {
    if (!lang) return translations['en'][key] || key;
    return translations[lang][key] || translations['en'][key] || key;
  };

  const setLanguage = (l) => {
    localStorage.setItem('sd_lang', l);
    setLang(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
