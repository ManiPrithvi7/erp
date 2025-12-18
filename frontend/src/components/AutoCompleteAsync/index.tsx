import { useState, useEffect, useRef } from 'react';
import { request } from '@/request';
import useOnFetch from '@/hooks/useOnFetch';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

interface AutoCompleteAsyncProps {
  entity: string;
  displayLabels: string[];
  searchFields: string;
  outputValue?: string;
  redirectLabel?: string;
  withRedirect?: boolean;
  urlToRedirect?: string;
  value?: any;
  onChange?: (value: any) => void;
}

export default function AutoCompleteAsync({
  entity,
  displayLabels,
  searchFields,
  outputValue = '_id',
  redirectLabel = 'Add New',
  withRedirect = false,
  urlToRedirect = '/',
  value,
  onChange,
}: AutoCompleteAsyncProps): JSX.Element {
  const translate = useLanguage();

  const addNewValue = { value: 'redirectURL', label: `+ ${translate(redirectLabel)}` };

  const [selectOptions, setOptions] = useState<any[]>([]);
  const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);

  const isUpdating = useRef(true);
  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const navigate = useNavigate();

  const handleSelectChange = (newValue: any) => {
    isUpdating.current = false;
    if (onChange) {
      if (newValue) onChange(newValue[outputValue] || newValue);
    }
    if (newValue === 'redirectURL' && withRedirect) {
      navigate(urlToRedirect);
    }
  };


  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const asyncSearch = async (options: any) => {
    return await request.search({ entity, options });
  };

  let { onFetch, result, isSuccess, isLoading } = useOnFetch();

  const labels = (optionField: any): string => {
    return displayLabels.map((x) => optionField[x]).join(' ');
  };

  useEffect(() => {
    const options = {
      q: debouncedValue,
      fields: searchFields,
    };
    const callback = asyncSearch(options);
    onFetch(callback);

    return () => {
      cancel();
    };
  }, [debouncedValue, entity, searchFields, onFetch, cancel]);

  const onSearch = (searchText: string) => {
    isSearching.current = true;
    setSearching(true);
    setValToSearch(searchText);
  };

  useEffect(() => {
    if (isSuccess) {
      setOptions(result || []);
    } else {
      setSearching(false);
    }
  }, [isSuccess, result]);

  useEffect(() => {
    if (value && isUpdating.current) {
      setOptions([value]);
      setCurrentValue(value[outputValue] || value);
      if (onChange) {
        onChange(value[outputValue] || value);
      }
      isUpdating.current = false;
    }
  }, [value, outputValue, onChange]);

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={translate('Search')}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      onClear={() => {
        setSearching(false);
      }}
      onChange={handleSelectChange}
      style={{ minWidth: '220px' }}
    >
      {selectOptions.map((optionField) => (
        <Select.Option key={optionField[outputValue] || optionField} value={optionField[outputValue] || optionField}>
          {labels(optionField)}
        </Select.Option>
      ))}
      {withRedirect && <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>}
    </Select>
  );
}

