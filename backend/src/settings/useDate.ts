interface Settings {
  idurar_app_date_format?: string;
}

interface UseDateResult {
  dateFormat?: string;
}

export const useDate = ({ settings }: { settings: Settings }): UseDateResult => {
  const { idurar_app_date_format } = settings;

  const dateFormat = idurar_app_date_format;

  return {
    dateFormat,
  };
};

export default useDate;

