import listAllSettings from './listAllSettings';

const loadSettings = async (): Promise<Record<string, any>> => {
  const allSettings: Record<string, any> = {};
  const datas = await listAllSettings();
  datas.forEach(({ settingKey, settingValue }: { settingKey: string; settingValue: any }) => {
    allSettings[settingKey] = settingValue;
  });
  return allSettings;
};

export default loadSettings;


