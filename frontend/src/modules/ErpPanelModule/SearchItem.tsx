import { useEffect, useState, useRef } from 'react';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { useErpContext } from '@/context/erp';
import { selectSearchedItems } from '@/redux/erp/selectors';
import { Empty } from 'antd';
import { useAppDispatch } from '@/redux/hooks';
import { SearchItemProps, ErpDocument, RequestOptions } from '@/types';

interface AutoCompleteOption {
  label: string;
  value: string;
}

export default function Search({ config }: SearchItemProps): JSX.Element {
  const { entity, searchConfig } = config;
  const { displayLabels, searchFields, outputValue = '_id' } = searchConfig || {};
  const dispatch = useAppDispatch();
  const [value, setValue] = useState('');
  const [options, setOptions] = useState<AutoCompleteOption[]>([]);
  const { erpContextAction } = useErpContext();
  const { readPanel } = erpContextAction;
  const { result, isLoading, isSuccess } = useSelector(selectSearchedItems);
  const isTyping = useRef(false);
  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      setOptions([{ label: '... Searching', value: '' }]);
    }
  }, [isLoading]);

  const onSearch = (searchText: string): void => {
    isTyping.current = true;
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    delayTimerRef.current = setTimeout(() => {
      if (isTyping.current && searchText !== '' && searchFields) {
        dispatch(
          erp.search({
            entity,
            options: {
              question: searchText,
              fields: searchFields,
            } as RequestOptions,
          })
        );
      }
      isTyping.current = false;
    }, 500);
  };

  const onSelect = (data: string): void => {
    const searchResults = Array.isArray(result) ? result : [];
    const currentItem = searchResults.find((item: ErpDocument) => {
      return item[outputValue] === data;
    });

    if (currentItem) {
      dispatch(erp.currentItem({ data: currentItem }));
      readPanel.open();
    }
  };

  const onChange = (data: string): void => {
    const currentItem = options.find((item) => {
      return item.value === data;
    });
    const currentValue = currentItem ? currentItem.label : data;
    setValue(currentValue);
  };

  useEffect(() => {
    const searchResults = Array.isArray(result) ? result : [];
    const optionResults: AutoCompleteOption[] = [];

    if (displayLabels) {
      searchResults.forEach((item: ErpDocument) => {
        const labels = displayLabels.map((x: string) => (item as Record<string, unknown>)[x] || '').join(' ');
        optionResults.push({ label: labels, value: (item[outputValue] as string) || '' });
      });
    }

    setOptions(optionResults);
  }, [result, displayLabels, outputValue]);

  return (
    <AutoComplete
      value={value}
      options={options}
      style={{
        width: '100%',
      }}
      onSelect={onSelect}
      onSearch={onSearch}
      onChange={onChange}
      notFoundContent={!isSuccess ? <Empty /> : ''}
      allowClear={true}
      placeholder="Your Search here"
    >
      <Input suffix={<SearchOutlined />} />
    </AutoComplete>
  );
}
