import { Select } from 'antd';
import { generate as uniqueId } from 'shortid';
import useLanguage from '@/locale/useLanguage';

interface Option {
  value: any;
  label: string;
}

interface SelectTagProps {
  options?: Option[] | string[];
  defaultValue?: any;
}

export default function SelectTag({ options, defaultValue }: SelectTagProps): JSX.Element {
  const translate = useLanguage();

  return (
    <Select
      defaultValue={defaultValue}
      style={{
        width: '100%',
      }}
    >
      {options?.map((option) => {
        if (typeof option === 'object' && option !== null) {
          return (
            <Select.Option key={`${uniqueId()}`} value={option.value}>
              {translate(option.label)}
            </Select.Option>
          );
        } else {
          return (
            <Select.Option key={`${uniqueId()}`} value={option}>
              {option}
            </Select.Option>
          );
        }
      })}
    </Select>
  );
}

