import listAllSettings from './listAllSettings';

type SettingValue = string | number | boolean | object | null | undefined;

const loadSettings = async (): Promise<Record<string, SettingValue>> => {
  const allSettings: Record<string, SettingValue> = {};
  const datas = await listAllSettings();
  datas.forEach(({ settingKey, settingValue }: { settingKey: string; settingValue: SettingValue }) => {
    allSettings[settingKey] = settingValue;
  });
  return allSettings;
};

export default loadSettings;


