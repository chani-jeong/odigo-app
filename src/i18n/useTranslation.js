import useDeckStore from '../store/useDeckStore';
import en from './en.json';
import ko from './ko.json';
import ja from './ja.json';
import zh from './zh.json';
import vi from './vi.json';
import es from './es.json';
import fr from './fr.json';

const translations = { en, ko, ja, zh, vi, es, fr };

// Force Vite HMR reload 2
export default function useTranslation() {
  const selectedLanguage = useDeckStore(state => state.selectedLanguage) || 'en';
  
  const t = (keyPath) => {
    const keys = keyPath.split('.');
    let current = translations[selectedLanguage] || translations['en'];
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // fallback to english
        let fallback = translations['en'];
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            return keyPath;
          }
        }
        return fallback;
      }
    }
    return current;
  };

  return { t, selectedLanguage };
}
