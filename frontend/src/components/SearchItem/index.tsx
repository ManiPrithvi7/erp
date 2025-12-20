import { useState, useEffect, useRef } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { Select, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectSearchedItems } from '@/redux/crud/selectors';

import { ModuleConfig } from '@/types';

interface SearchItemComponentProps {
  config: ModuleConfig;
  onRerender: () => void;
}

function SearchItemComponent({ config, onRerender }: SearchItemComponentProps): JSX.Element {
  const { entity, searchConfig } = config;

  if (!searchConfig) {
    return <></>;
  }

  const { displayLabels, searchFields, outputValue = '_id' } = searchConfig;

  const dispatch = useAppDispatch();
  const { crudContextAction } = useCrudContext();
  const { panel, collapsedBox, readBox } = crudContextAction;
  const { result, isLoading, isSuccess } = useSelector(selectSearchedItems);

  const [selectOptions, setOptions] = useState<Record<string, unknown>[]>([]);
  const [currentValue, setCurrentValue] = useState<string | undefined>(undefined);

  const isSearching = useRef(false);

  const [searching, setSearching] = useState(false);

  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  const [, cancel] = useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  const labels = (optionField: Record<string, unknown>): string => {
    return displayLabels.map((x) => String(optionField[x] || '')).join(' ');
  };

  useEffect(() => {
    if (debouncedValue != '') {
      const options = {
        q: debouncedValue,
        fields: searchFields,
      };
      dispatch(crud.search({ entity, options }));
    }
    return () => {
      cancel();
    };
  }, [debouncedValue, dispatch, entity, searchFields, cancel]);

  const onSearch = (searchText: string) => {
    if (searchText && searchText != '') {
      isSearching.current = true;
      setSearching(true);
      setOptions([]);
      setCurrentValue(undefined);
      setValToSearch(searchText);
    }
  };

  const onSelect = (data: string): void => {
    const searchResults = Array.isArray(result) ? result : [];
    const currentItem = searchResults.find((item: Record<string, unknown>) => {
      return item[outputValue] === data;
    });

    if (currentItem) {
      dispatch(crud.currentItem({ data: currentItem }));
    }

    panel.open();
    collapsedBox.open();
    readBox.open();
    onRerender();
  };
  useEffect(() => {
    if (isSearching.current) {
      if (isSuccess) {
        setOptions(result || []);
      } else {
        setSearching(false);
        setCurrentValue(undefined);
        setOptions([]);
      }
    }
  }, [isSuccess, result]);

  return (
    <Select
      loading={isLoading}
      showSearch
      allowClear
      placeholder={<SearchOutlined style={{ float: 'right', padding: '8px 0' }} />}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={searching ? '... Searching' : <Empty />}
      value={currentValue}
      onSearch={onSearch}
      style={{ width: '100%' }}
      onSelect={onSelect}
    >
      {selectOptions.map((optionField) => {
        const value = optionField[outputValue];
        return (
          <Select.Option key={String(value)} value={String(value)}>
            {labels(optionField)}
          </Select.Option>
        );
      })}
    </Select>
  );
}

interface SearchItemProps {
  config: ModuleConfig;
}

export default function SearchItem({ config }: SearchItemProps): JSX.Element {
  const [state, setState] = useState<number[]>([0]);

  const onRerender = () => {
    setState([(state[0] || 0) + 1]);
  };

  return (
    <>
      {state.map((comp) => (
        <SearchItemComponent key={comp} config={config} onRerender={onRerender} />
      ))}
    </>
  );
}
