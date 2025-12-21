import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { request } from '@/request';
import useDebounce from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';
import { Select, Empty } from 'antd';
import useLanguage from '@/locale/useLanguage';

export interface AutoCompleteAsyncProps {
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
  const navigate = useNavigate();

  // Stable memoized values
  const placeholderText = useMemo(() => translate('Search'), []);
  const selectId = useMemo(() => `autocomplete-${entity}`, [entity]);
  const selectStyle = useMemo(() => ({ minWidth: '220px' }), []);
  const emptyComponent = useMemo(() => <Empty />, []);

  // State
  const [selectOptions, setOptions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [valToSearch, setValToSearch] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs to avoid dependency issues
  const onChangeRef = useRef(onChange);
  const selectOptionsRef = useRef<any[]>([]);
  const outputValueRef = useRef(outputValue);
  const previousDisplayValueRef = useRef<any>(undefined);

  // Update refs
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    selectOptionsRef.current = selectOptions;
  }, [selectOptions]);

  useEffect(() => {
    outputValueRef.current = outputValue;
  }, [outputValue]);

  // Debounce search
  useDebounce(
    () => {
      setDebouncedValue(valToSearch);
    },
    500,
    [valToSearch]
  );

  // Stabilize displayLabels array to prevent unnecessary re-renders
  // Use JSON.stringify for deep comparison since arrays are compared by reference
  const displayLabelsRef = useRef<string[]>(displayLabels);
  const displayLabelsString = JSON.stringify(displayLabels);
  const previousDisplayLabelsString = useRef<string>('');
  
  useEffect(() => {
    if (displayLabelsString !== previousDisplayLabelsString.current) {
      displayLabelsRef.current = displayLabels;
      previousDisplayLabelsString.current = displayLabelsString;
    }
  }, [displayLabelsString]);

  // Memoize labels function - use ref to avoid dependency on changing array reference
  const labels = useCallback(
    (optionField: any): string => {
      return displayLabelsRef.current.map((x) => optionField[x]).join(' ');
    },
    [] // Empty deps - we use ref instead
  );

  // Search effect
  useEffect(() => {
    if (!debouncedValue || !debouncedValue.trim()) {
      setOptions([]);
      setSearching(false);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    const performSearch = async () => {
      try {
        setIsLoading(true);
        setSearching(true);
        const options = {
          q: debouncedValue,
          fields: searchFields,
        };
        const response = await request.search({ entity, options });
        
        if (!isCancelled && response?.result) {
          setOptions(Array.isArray(response.result) ? response.result : []);
          setSearching(false);
          setIsLoading(false);
        } else if (!isCancelled) {
          setOptions([]);
          setSearching(false);
          setIsLoading(false);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Search error:', error);
          setOptions([]);
          setSearching(false);
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      isCancelled = true;
    };
  }, [debouncedValue, entity, searchFields]);

  // Calculate display value - only update when it actually changes
  // Use outputValueRef to avoid dependency issues
  const displayValue = useMemo(() => {
    let newDisplayValue: any;
    const currentOutputValue = outputValueRef.current;
    
    if (value === undefined || value === null) {
      newDisplayValue = undefined;
    } else if (typeof value === 'object' && value !== null) {
      newDisplayValue = value[currentOutputValue] || value;
    } else {
      newDisplayValue = value;
    }
    
    // Return previous value if unchanged to maintain reference stability
    if (previousDisplayValueRef.current === newDisplayValue) {
      return previousDisplayValueRef.current;
    }
    
    previousDisplayValueRef.current = newDisplayValue;
    return newDisplayValue;
  }, [value]); // Removed outputValue - using ref instead

  // Memoize notFoundContent
  const notFoundContent = useMemo(() => {
    return searching ? '... Searching' : emptyComponent;
  }, [searching, emptyComponent]);

  // Memoize addNewValue
  const addNewValue = useMemo(
    () => {
      const label = translate(redirectLabel);
      return { value: 'redirectURL', label: `+ ${label}` };
    },
    [redirectLabel]
  );

  // Memoize options list to prevent recreation
  // Use outputValueRef to avoid dependency issues
  const optionsList = useMemo(() => {
    const currentOutputValue = outputValueRef.current;
    return selectOptions.map((optionField) => {
      const optionValue = optionField[currentOutputValue] || optionField;
      return (
        <Select.Option key={String(optionValue)} value={optionValue}>
          {labels(optionField)}
        </Select.Option>
      );
    });
  }, [selectOptions, labels]); // Removed outputValue - using ref instead

  // Handlers - all memoized
  const onSearch = useCallback((searchText: string) => {
    setSearching(true);
    setValToSearch(searchText);
  }, []);

  const onClear = useCallback(() => {
    setSearching(false);
    if (onChangeRef.current) {
      onChangeRef.current(undefined);
    }
  }, []);

  const handleSelectChange = useCallback(
    (newValue: any) => {
      if (newValue === 'redirectURL' && withRedirect) {
        navigate(urlToRedirect);
        return;
      }
      
      if (onChangeRef.current) {
        const currentOutputValue = outputValueRef.current;
        const selectedOption = selectOptionsRef.current.find(
          (opt) => (opt[currentOutputValue] || opt) === newValue
        );
        
        if (selectedOption) {
          onChangeRef.current(selectedOption[currentOutputValue] || selectedOption);
        } else if (newValue) {
          onChangeRef.current(newValue);
        } else {
          onChangeRef.current(undefined);
        }
      }
    },
    [withRedirect, navigate, urlToRedirect]
  );

  return (
    <Select
      id={selectId}
      loading={isLoading}
      showSearch
      allowClear
      placeholder={placeholderText}
      defaultActiveFirstOption={false}
      filterOption={false}
      notFoundContent={notFoundContent}
      value={displayValue}
      onSearch={onSearch}
      onClear={onClear}
      onChange={handleSelectChange}
      style={selectStyle}
    >
      {optionsList}
      {withRedirect && <Select.Option value={addNewValue.value}>{addNewValue.label}</Select.Option>}
    </Select>
  );
}
