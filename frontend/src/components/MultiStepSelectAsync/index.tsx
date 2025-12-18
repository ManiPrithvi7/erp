import { useState, useEffect } from 'react';
import { Select, Space } from 'antd';
import { request } from '@/request';
import errorHandler from '@/request/errorHandler';

const { Option } = Select;

const asyncList = (entity: string) => {
  return request.list({ entity });
};

const asyncFilter = (entity: string, options: any) => {
  return request.filter({ entity, options });
};

interface MultiStepSelectAsyncProps {
  firstSelectProps?: any;
  secondSelectProps?: any;
  firstSelectIdKey?: string;
  firstSelectValueKey?: string;
  firstSelectLabelKey?: string;
  secondSelectIdKey?: string;
  secondSelectValueKey?: string;
  secondSelectLabelKey?: string;
  entityName: string;
  subEntityName?: string;
  value?: {
    firstSelectedOption?: any;
    secondSelectedOption?: any;
  };
  onChange?: (value: { firstSelectedOption?: any; secondSelectedOption?: any }) => void;
  style?: React.CSSProperties;
}

const MultiStepSelectAsync = ({
  firstSelectProps = {},
  secondSelectProps = {},
  firstSelectIdKey = '_id',
  firstSelectValueKey = 'value',
  firstSelectLabelKey = 'label',
  secondSelectIdKey = '_id',
  secondSelectValueKey = 'value',
  secondSelectLabelKey = 'label',
  entityName,
  subEntityName = 'items',
  value = {},
  onChange,
  style,
}: MultiStepSelectAsyncProps): JSX.Element => {
  const firstSelectedOption = value.firstSelectedOption;
  const [firstSelectOptions, setFirstSelectOptions] = useState<any[]>([]);
  const [secondSelectOptions, setSecondSelectOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        if (firstSelectedOption) {
          const data = await asyncFilter(entityName, {
            filter: '_id',
            equal: firstSelectedOption[firstSelectIdKey],
          });

          const firstResult = Array.isArray(data?.result) && data.result.length > 0 ? data.result[0] : null;
          const subItems = firstResult && typeof firstResult === 'object' && subEntityName in firstResult 
            ? (firstResult as Record<string, unknown>)[subEntityName] 
            : null;
          setSecondSelectOptions(Array.isArray(subItems) ? subItems : []);
          return;
        }
        const data = await asyncList(entityName);
        setFirstSelectOptions(Array.isArray(data.result) ? data.result : []);
      } catch (error) {
        errorHandler(error as any);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [firstSelectedOption, entityName, firstSelectIdKey, subEntityName]);

  return (
    <Space direction="vertical" style={style}>
      <Select
        placeholder="Select an option"
        style={{ width: 200 }}
        {...firstSelectProps}
        loading={!firstSelectedOption ? loading : false}
        onChange={(value) => {
          if (onChange) {
            onChange({
              firstSelectedOption: firstSelectOptions.find((option) => option[firstSelectValueKey] === value),
            });
          }
        }}
      >
        {firstSelectOptions.map((option) => (
          <Option key={option[firstSelectIdKey]} value={option[firstSelectValueKey]}>
            {option[firstSelectLabelKey]}
          </Option>
        ))}
      </Select>
      {firstSelectedOption && (
        <Select
          placeholder="Select another option"
          loading={loading}
          style={{ width: 200 }}
          {...secondSelectProps}
          onChange={(value) => {
            if (onChange) {
              onChange({
                firstSelectedOption,
                secondSelectedOption: secondSelectOptions.find((option) => option[secondSelectValueKey] === value),
              });
            }
          }}
        >
          {secondSelectOptions.map((option) => (
            <Option key={option[secondSelectIdKey]} value={option[secondSelectValueKey]}>
              {option[secondSelectLabelKey]}
            </Option>
          ))}
        </Select>
      )}
    </Space>
  );
};

export default MultiStepSelectAsync;

