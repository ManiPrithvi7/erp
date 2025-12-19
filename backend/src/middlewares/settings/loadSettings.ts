import { listAllSettings } from './listAllSettings';

export const loadSettings = async (): Promise<Record<string, any>> => {
  const allSettings: Record<string, any> = {};
  const datas = await listAllSettings();
  datas.forEach(({ settingKey, settingValue }) => {
    allSettings[settingKey] = settingValue;
  });
  return allSettings;
};

export default loadSettings;


