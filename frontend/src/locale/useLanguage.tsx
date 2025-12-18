const getLabel = (key: string): string => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    // if (lang[lowerCaseKey]) return lang[lowerCaseKey];

    // convert no found language label key to label

    const remove_underscore_fromKey = key.replace(/_/g, ' ').split(' ');

    const conversionOfAllFirstCharacterofEachWord = remove_underscore_fromKey.map(
      (word) => (word && word[0] ? word[0].toUpperCase() + word.substring(1) : word)
    );

    const label = conversionOfAllFirstCharacterofEachWord.join(' ');

    const result = window.localStorage.getItem('lang');
    if (!result) {
      let list: Record<string, string> = {};
      list[lowerCaseKey] = label;
      window.localStorage.setItem('lang', JSON.stringify(list));
    } else {
      let list: Record<string, string> = { ...JSON.parse(result) };
      list[lowerCaseKey] = label;
      window.localStorage.removeItem('lang');
      window.localStorage.setItem('lang', JSON.stringify(list));
    }
    // console.error(
    //   '🇩🇿 🇧🇷 🇻🇳 🇮🇩 🇨🇳 Language Label Warning : translate("' +
    //     lowerCaseKey +
    //     '") failed to get label for this key : ' +
    //     lowerCaseKey +
    //     ' please review your language config file and add this label'
    // );
    return label;
  } catch (error) {
    // console.error(
    //   '🚨 error getting this label : translate("' +
    //     key +
    //     '") failed to get label for this key : ' +
    //     key +
    //     ' please review your language config file and add this label'
    // );
    return 'No translate';
  }
};

const useLanguage = () => {
  const translate = (value: string): string => getLabel(value);

  return translate;
};

export default useLanguage;

