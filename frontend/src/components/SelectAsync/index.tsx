import { useState, useEffect } from 'react';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { Select, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import useLanguage from '@/locale/useLanguage';

interface SelectAsyncProps {
  entity: string;
  displayLabels?: string[];
  outputValue?: string;
  redirectLabel?: string;
  withRedirect?: boolean;
  urlToRedirect?: string;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
}

const SelectAsync = ({
  entity,
  displayLabels = ['name'],
  outputValue = '_id',
  redirectLabel = '',
  withRedirect = false,
  urlToRedirect = '/',
  placeholder = 'select',
  value,
  onChange,
}: SelectAsyncProps): JSX.Element => {
  const translate = useLanguage();
  const [selectOptions, setOptions] = useState<any[]>([]);
  const [currentValue, setCurrentValue] = useState<any>(undefined);

  const navigate = useNavigate();

  const asyncList = () => {
    return request.list({ entity });
  };
  const { result, isLoading: fetchIsLoading, isSuccess, error } = useFetch(asyncList);
  useEffect(() => {
    if (isSuccess && result) {
      setOptions(Array.isArray(result) ? result : []);
    } else if (error) {
      setOptions([]);
    }
  }, [isSuccess, result, error]);

  const labels = (optionField: any): string => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };
  useEffect(() => {
    if (value !== undefined) {
      const val = value?.[outputValue] ?? value;
      setCurrentValue(val);
      if (onChange) {
        onChange(val);
      }
    }
  }, [value, outputValue, onChange]);

  const handleSelectChange = (newValue: any) => {
    if (newValue === 'redirectURL') {
      navigate(urlToRedirect);
    } else {
      const val = newValue?.[outputValue] ?? newValue;
      setCurrentValue(newValue);
      if (onChange) {
        onChange(val);
      }
    }
  };

  interface OptionItem {
    value: any;
    label: string;
    color?: string;
  }

  const optionsList = (): OptionItem[] => {
    const list: OptionItem[] = [];

    selectOptions.map((optionField) => {
      const value = optionField[outputValue] ?? optionField;
      const label = labels(optionField);
      const currentColor = optionField[outputValue]?.color ?? optionField?.color;
      const labelColor = color.find((x) => x.color === currentColor);
      list.push({ value, label, color: labelColor?.color });
    });

    return list;
  };

  return (
    <Select
      loading={fetchIsLoading}
      disabled={fetchIsLoading}
      value={currentValue}
      onChange={handleSelectChange}
      placeholder={placeholder}
    >
      {optionsList()?.map((option) => {
        return (
          <Select.Option key={`${uniqueId()}`} value={option.value}>
            <Tag bordered={false} color={option.color}>
              {option.label}
            </Tag>
          </Select.Option>
        );
      })}
      {withRedirect && (
        <Select.Option value={'redirectURL'}>{`+ ` + translate(redirectLabel)}</Select.Option>
      )}
    </Select>
  );
};

export default SelectAsync;

