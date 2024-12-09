import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { translations } from '../translations';

// Create type from translation keys
type TranslationKey = keyof typeof translations.en;

export const usePageTitle = (title: TranslationKey) => {
  const { t } = useSettings();  
  
  useEffect(() => {
    const baseTitle = t.appName;
    document.title = `${t[title]} | ${baseTitle}`;
    
    return () => {
      document.title = baseTitle;
    };
  }, [title, t]);
}; 