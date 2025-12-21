import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { Select, Tag, Empty, Alert, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import useLanguage from '@/locale/useLanguage';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

  // Memoize the async list function to prevent recreation on every render
  const asyncList = useCallback(() => {
    return request.list({ entity });
  }, [entity]);
  
  const { result, isLoading: fetchIsLoading, isSuccess, error } = useFetch(asyncList);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    // Don't process while loading
    if (fetchIsLoading) {
      return;
    }

    // Handle successful response
    if (isSuccess && result !== null && result !== undefined) {
      // Handle both array results and object results
      let optionsArray: any[] = [];
      
      if (Array.isArray(result)) {
        optionsArray = result;
      } else if (result && typeof result === 'object' && 'result' in result) {
        // Sometimes API wraps result in another object
        optionsArray = Array.isArray((result as any).result) ? (result as any).result : [];
      }
      
      setOptions(optionsArray);
      setHasError(false);
      setErrorMessage('');
      
      // Log warning if no data available
      if (optionsArray.length === 0) {
        console.warn(`⚠️ No ${entity} data available. User should create ${entity} first.`);
      }
      return;
    }

    // Handle errors - network errors, API errors, etc.
    if (error) {
      setOptions([]);
      setHasError(true);
      const errorMsg = error?.message || (typeof error === 'string' ? error : 'Failed to load data');
      setErrorMessage(String(errorMsg));
      console.error(`❌ Error loading ${entity}:`, error);
      return;
    }

    // Handle case where request completed but was not successful (no error object but isSuccess is false)
    if (!isSuccess && !fetchIsLoading) {
      setOptions([]);
      setHasError(true);
      setErrorMessage('Request failed - unable to load data');
      console.error(`❌ Failed to load ${entity}: Request was not successful`);
    }
  }, [isSuccess, result, error, entity, fetchIsLoading]);

  // Memoize labels function to prevent recreation
  const labels = useMemo(
    () => (optionField: any): string => {
      return displayLabels.map((x) => optionField[x] || '').join(' ');
    },
    [displayLabels]
  );

  // Use ref to track previous value and prevent unnecessary updates
  const previousValueRef = useRef<any>(undefined);
  
  useEffect(() => {
    // Only update if value actually changed
    if (value !== undefined && value !== previousValueRef.current) {
      const val = value?.[outputValue] ?? value;
      setCurrentValue(val);
      previousValueRef.current = value;
      // Don't call onChange here - it causes loops
    } else if (value === undefined && previousValueRef.current !== undefined) {
      setCurrentValue(undefined);
      previousValueRef.current = undefined;
    }
  }, [value, outputValue]);

  const handleSelectChange = (newValue: any) => {
    if (newValue === 'redirectURL') {
      navigate(urlToRedirect);
      return;
    }
    
    const selectedOption = selectOptions.find(
      (opt) => (opt[outputValue] ?? opt) === newValue
    );
    
    if (selectedOption) {
      const val = selectedOption[outputValue] ?? selectedOption;
      setCurrentValue(newValue);
      if (onChange) {
        onChange(val);
      }
    } else if (newValue) {
      setCurrentValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    } else {
      setCurrentValue(undefined);
      if (onChange) {
        onChange(undefined);
      }
    }
  };

  interface OptionItem {
    value: any;
    label: string;
    color?: string;
  }

  // Memoize options list
  const options = useMemo((): OptionItem[] => {
    const list: OptionItem[] = [];
    selectOptions.forEach((optionField) => {
      const optionValue = optionField[outputValue] ?? optionField;
      const label = labels(optionField);
      const currentColor = optionField[outputValue]?.color ?? optionField?.color;
      const labelColor = color.find((x) => x.color === currentColor);
      list.push({ value: optionValue, label, color: labelColor?.color });
    });
    return list;
  }, [selectOptions, outputValue, labels]);
  // Empty means: finished loading, no error, and no options available
  const isEmpty = !fetchIsLoading && !hasError && selectOptions.length === 0;
  const selectId = `select-async-${entity}`;
  const entityDisplayName = entity.charAt(0).toUpperCase() + entity.slice(1).replace(/s$/, '');

  // Show error state
  if (hasError && !fetchIsLoading) {
    return (
      <div>
        <Alert
          message={translate(`Error loading ${entity}`)}
          description={
            <div>
              <p style={{ marginBottom: '8px' }}>
                {errorMessage || translate(`Failed to load ${entity}. Please check your connection and try again.`)}
              </p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(urlToRedirect || `/${entity}`)}
                size="small"
              >
                {translate(`Go to ${entityDisplayName}`)}
              </Button>
            </div>
          }
          type="error"
          showIcon
          style={{ marginBottom: '8px' }}
          closable
        />
        <Select
          id={selectId}
          loading={false}
          disabled={true}
          value={undefined}
          placeholder={translate(`Error loading ${entity}`)}
          notFoundContent={<Empty description={translate(`Cannot load ${entity}`)} />}
        />
      </div>
    );
  }

  // Show empty state guidance - ALWAYS show when empty, even with withRedirect
  // This is critical for user experience - they need to know why the form isn't working
  if (isEmpty) {
    return (
      <div>
        <Alert
          message={translate(`No ${entity} Available`)}
          description={
            <div>
              <p style={{ marginBottom: '8px', fontWeight: 500 }}>
                {translate(`You need to create at least one ${entityDisplayName} before you can use it in this form.`)}
              </p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate(urlToRedirect || `/${entity}`)}
                size="small"
              >
                {translate(withRedirect && redirectLabel ? redirectLabel : `Add New ${entityDisplayName}`)}
              </Button>
            </div>
          }
          type="warning"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '8px' }}
        />
        <Select
          id={selectId}
          loading={false}
          disabled={true}
          value={undefined}
          placeholder={translate(`No ${entity} available - Click button above to create one`)}
          notFoundContent={
            <Empty
              description={
                translate(`No ${entity} found. Please create one using the button above.`)
              }
            />
          }
        />
      </div>
    );
  }

  return (
    <div>
      <Select
        id={selectId}
        loading={fetchIsLoading}
        disabled={fetchIsLoading}
        value={currentValue}
        onChange={handleSelectChange}
        placeholder={placeholder}
        notFoundContent={<Empty description={translate('No data')} />}
      >
        {options?.map((option) => {
          return (
            <Select.Option key={`${uniqueId()}`} value={option.value}>
              <Tag bordered={false} color={option.color}>
                {option.label}
              </Tag>
            </Select.Option>
          );
        })}
        {withRedirect && options.length > 0 && (
          <Select.Option value={'redirectURL'}>{`+ ` + translate(redirectLabel)}</Select.Option>
        )}
      </Select>
    </div>
  );
};

export default SelectAsync;
