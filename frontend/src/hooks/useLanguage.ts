import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const changeLanguage = async (languageCode: string) => {
    try {
      console.log('Changing language from', i18n.language, 'to', languageCode);
      await i18n.changeLanguage(languageCode);
      console.log('Language changed successfully to:', i18n.language);
      
      // Save to localStorage for persistence
      localStorage.setItem('vonvault-language', languageCode);
      
      // Force re-render by triggering a custom event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: languageCode }));
      
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  };

  const getLanguageName = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : 'Unknown';
  };

  const getLanguageFlag = (code: string) => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.flag : '🌍';
  };

  return {
    currentLanguage,
    availableLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    getLanguageName,
    getLanguageFlag,
    t
  };
};