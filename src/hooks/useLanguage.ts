import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export type Language = 'en' | 'zh';

interface UseLanguageReturn {
  currentLanguage: Language;
  changeLanguage: (language: Language) => Promise<void>;
  isChanging: boolean;
}

/**
 * Hook for managing language selection
 * Provides a simple interface for switching between English and Chinese
 */
export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage: Language = (i18n.language as Language) || 'zh';

  const changeLanguage = async (language: Language): Promise<void> => {
    if (language === currentLanguage) return;

    setIsChanging(true);
    try {
      await i18n.changeLanguage(language);
      // Persist to localStorage for next startup
      localStorage.setItem('i18nextLng', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return {
    currentLanguage,
    changeLanguage,
    isChanging,
  };
};