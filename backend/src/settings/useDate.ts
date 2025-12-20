interface UseDateParams {
  settings: {
    idurar_app_date_format?: string;
  };
}

interface UseDateReturn {
  dateFormat: string;
}

const useDate = ({ settings }: UseDateParams): UseDateReturn => {
  const { idurar_app_date_format } = settings;

  const dateFormat = idurar_app_date_format || 'YYYY-MM-DD';

  return {
    dateFormat,
  };
};

export default useDate;


