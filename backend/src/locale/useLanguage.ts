import { readBySettingKey } from '@/middlewares/settings';

const getLabel = (lang: Record<string, string>, key: string): string => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    if (lang[lowerCaseKey]) return lang[lowerCaseKey];
    else {
      const remove_underscore_fromKey = lowerCaseKey.replace(/_/g, ' ').split(' ');

      const conversionOfAllFirstCharacterofEachWord = remove_underscore_fromKey.map(
        (word) => word[0].toUpperCase() + word.substring(1)
      );

      const label = conversionOfAllFirstCharacterofEachWord.join(' ');

      return label;
    }
  } catch (error) {
    return 'No translate Found';
  }
};

import en_us from './translation/en_us';

const useSelector = (): Record<string, string> => {
  return en_us;
};

interface UseLanguageParams {
  selectedLang?: string;
}

const useLanguage = ({ selectedLang }: UseLanguageParams) => {
  const lang = useSelector();
  const translate = (value: string): string => {
    const text = getLabel(lang, value);
    return text;
  };
  return translate;
};

export default useLanguage;


