import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { get, set, KEYS } from '../services/storageService';
import { translations } from '../utils/translations';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => get(KEYS.THEME) || 'light');
  const [language, setLanguage] = useState(() => get(KEYS.LANGUAGE) || 'uz');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    set(KEYS.THEME, theme);
  }, [theme]);

  useEffect(() => {
    set(KEYS.LANGUAGE, language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const isDark = theme === 'dark';

  const t = useCallback((key) => {
    const langDict = translations[language] || translations.uz;
    return langDict[key] || translations.en[key] || key;
  }, [language]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
