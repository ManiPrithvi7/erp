export const useAppSettings = (): Record<string, string> => {
  const settings: Record<string, string> = {};
  settings['idurar_app_email'] = 'noreply@idurarapp.com';
  settings['idurar_base_url'] = 'https://cloud.idurarapp.com';
  return settings;
};

export default useAppSettings;

