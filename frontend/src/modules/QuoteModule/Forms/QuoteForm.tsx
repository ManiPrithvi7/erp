import { useState, useEffect, useRef, useMemo, memo } from 'react';
import dayjs from 'dayjs';
import { Form, Input, InputNumber, Button, Select, Divider, Row, Col, Alert } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import ItemRow from '@/modules/ErpPanelModule/ItemRow';
import MoneyInputFormItem from '@/components/MoneyInputFormItem';
import { selectFinanceSettings, selectSettings, selectMoneyFormat } from '@/redux/settings/selectors';
import { useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import calculate from '@/utils/calculate';
import { useSelector } from 'react-redux';
import SelectAsync from '@/components/SelectAsync';
import { ErpDocument } from '@/types';
import { useNavigate } from 'react-router-dom';

interface QuoteFormProps {
  subTotal?: number;
  current?: ErpDocument | Record<string, unknown> | null;
  offerTotal?: number;
}

interface LoadQuoteFormProps {
  subTotal?: number;
  current?: ErpDocument | Record<string, unknown> | null;
  lastQuoteNumber?: number;
}

function QuoteForm({ subTotal = 0, current = null }: QuoteFormProps): JSX.Element {
  const financeSettings = useSelector(selectFinanceSettings);
  const moneyFormatSettings = useSelector(selectMoneyFormat);
  const { isLoading: settingsLoading, isSuccess: settingsLoaded } = useSelector(selectSettings);
  
  // Memoize derived values to prevent unnecessary re-renders
  const last_quote_number = useMemo(() => financeSettings?.last_quote_number ?? 0, [financeSettings?.last_quote_number]);
  const hasSettings = useMemo(() => settingsLoaded && financeSettings && Object.keys(financeSettings).length > 0, [settingsLoaded, financeSettings]);
  const hasCurrency = useMemo(() => moneyFormatSettings?.default_currency_code, [moneyFormatSettings?.default_currency_code]);
  const settingsError = useMemo(() => !settingsLoading && !settingsLoaded && !hasSettings, [settingsLoading, settingsLoaded, hasSettings]);
  
  const navigate = useNavigate();
  const translate = useLanguage();

  // Move debug logging to useEffect to prevent it from running on every render
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('🔍 QuoteForm rendered:', {
        financeSettings,
        moneyFormatSettings,
        last_quote_number,
        default_currency_code: moneyFormatSettings?.default_currency_code,
        subTotal,
        current,
        hasSettings,
        hasCurrency,
        settingsLoading,
        settingsLoaded,
        settingsError,
      });
    }
  }, [financeSettings, moneyFormatSettings, last_quote_number, subTotal, current, hasSettings, hasCurrency, settingsLoading, settingsLoaded, settingsError]);

  return (
    <>
      {settingsError && (
        <Alert
          message={translate('Settings Not Loaded')}
          description={
            <div>
              <p style={{ marginBottom: '8px' }}>
                {translate('Unable to load finance settings. This may affect quote creation. Please check your connection or configure settings manually.')}
              </p>
              <Button
                type="primary"
                icon={<InfoCircleOutlined />}
                onClick={() => navigate('/settings')}
                size="small"
              >
                {translate('Go to Settings')}
              </Button>
            </div>
          }
          type="warning"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '16px' }}
          closable
        />
      )}
      {!settingsLoading && !hasSettings && settingsLoaded && (
        <Alert
          message={translate('Finance Settings Not Configured')}
          description={
            <div>
              <p style={{ marginBottom: '8px' }}>
                {translate('Finance settings are not configured. Some features may not work correctly. Please configure your finance settings.')}
              </p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/settings')}
                size="small"
              >
                {translate('Configure Settings')}
              </Button>
            </div>
          }
          type="info"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '16px' }}
          closable
        />
      )}
      {!settingsLoading && !hasCurrency && settingsLoaded && (
        <Alert
          message={translate('Currency Not Configured')}
          description={
            <div>
              <p style={{ marginBottom: '8px' }}>
                {translate('Default currency is not configured. Quotes require a currency. Please configure currency in Money Format Settings.')}
              </p>
              <Button
                type="primary"
                icon={<InfoCircleOutlined />}
                onClick={() => navigate('/settings')}
                size="small"
              >
                {translate('Configure Currency')}
              </Button>
            </div>
          }
          type="warning"
          icon={<InfoCircleOutlined />}
          showIcon
          style={{ marginBottom: '16px' }}
          closable
        />
      )}
      <LoadQuoteForm subTotal={subTotal} current={current} lastQuoteNumber={last_quote_number} />
    </>
  );
}

function LoadQuoteForm({ subTotal = 0, current = null, lastQuoteNumber = 0 }: LoadQuoteFormProps): JSX.Element {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const [lastNumber, setLastNumber] = useState(() => (lastQuoteNumber || 0) + 1);

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('🔍 LoadQuoteForm rendered:', {
        subTotal,
        current,
        lastQuoteNumber,
        lastNumber,
      });
    }
  }, [subTotal, current, lastQuoteNumber, lastNumber]);

  const [total, setTotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const handelTaxChange = (value: number | string): void => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    setTaxRate(numValue / 100);
  };

  useEffect(() => {
    if (current && typeof current === 'object' && current !== null) {
      const currentDoc = current as ErpDocument;
      const { taxRate: currentTaxRate = 0, year, number } = currentDoc;
      setTaxRate((currentTaxRate as number) / 100);
      setCurrentYear((year as number) || new Date().getFullYear());
      setLastNumber((number as number) || 0);
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.add(calculate.multiply(subTotal, taxRate), subTotal);
    setTaxTotal(Number.parseFloat(String(calculate.multiply(subTotal, taxRate))));
    setTotal(Number.parseFloat(String(currentTotal)));
  }, [subTotal, taxRate]);

  const addField = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (addField.current) {
      addField.current.click();
    }
  }, []);

  return (
    <>
      {/* Debug indicator - remove in production */}
      {import.meta.env.DEV && (
        <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '10px', borderRadius: '4px' }}>
          🔍 QuoteForm Loaded - lastQuoteNumber: {lastQuoteNumber}, subTotal: {subTotal}
        </div>
      )}
      <Row gutter={[12, 0]}>
        <Col className="gutter-row" span={8}>
          <Form.Item
            name="client"
            label={translate('Client')}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoCompleteAsync
              entity={'client'}
              displayLabels={['name']}
              searchFields={'name'}
              redirectLabel={'Add New Client'}
              withRedirect
              urlToRedirect={'/customer'}
            />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('number')}
            name="number"
            initialValue={lastNumber}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={3}>
          <Form.Item
            label={translate('year')}
            name="year"
            initialValue={currentYear}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={5}>
          <Form.Item
            label={translate('status')}
            name="status"
            rules={[
              {
                required: false,
              },
            ]}
            initialValue={'draft'}
          >
            <Select
              options={[
                { value: 'draft', label: translate('Draft') },
                { value: 'pending', label: translate('Pending') },
                { value: 'sent', label: translate('Sent') },
                { value: 'accepted', label: translate('Accepted') },
                { value: 'declined', label: translate('Declined') },
                { value: 'expired', label: translate('Expired') },
              ]}
            ></Select>
          </Form.Item>
        </Col>

        <Col className="gutter-row" span={8}>
          <Form.Item
            name="date"
            label={translate('Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={6}>
          <Form.Item
            name="expiredDate"
            label={translate('Expire Date')}
            rules={[
              {
                required: true,
                type: 'object',
              },
            ]}
            initialValue={dayjs().add(30, 'days')}
          >
            <DatePicker style={{ width: '100%' }} format={dateFormat} />
          </Form.Item>
        </Col>
        <Col className="gutter-row" span={10}>
          <Form.Item label={translate('Note')} name="notes">
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Divider dashed />
      <Row gutter={[12, 12]} style={{ position: 'relative' }}>
        <Col className="gutter-row" span={5}>
          <p>{translate('Item')}</p>
        </Col>
        <Col className="gutter-row" span={7}>
          <p>{translate('Description')}</p>
        </Col>
        <Col className="gutter-row" span={3}>
          <p>{translate('Quantity')}</p>{' '}
        </Col>
        <Col className="gutter-row" span={4}>
          <p>{translate('Price')}</p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p>{translate('Total')}</p>
        </Col>
      </Row>
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <ItemRow
                key={field.key}
                remove={(name: string | number) => {
                  const nameToRemove = typeof name === 'number' ? name : parseInt(String(name), 10);
                  if (!isNaN(nameToRemove)) {
                    remove(nameToRemove);
                  }
                }}
                field={{ name: String(field.name), fieldKey: String(field.key) }}
                current={current}
              />
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                ref={addField}
              >
                {translate('Add field')}
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
      <Divider dashed />
      <div style={{ position: 'relative', width: ' 100%', float: 'right' }}>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={5}>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />} block>
                {translate('Save')}
              </Button>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={4} offset={10}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Sub Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={subTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <Form.Item
              name="taxRate"
              rules={[
                {
                  required: false, // Make optional if no taxes available
                  message: translate('Please select a tax rate or create one first'),
                },
              ]}
            >
              <SelectAsync
                value={taxRate}
                onChange={handelTaxChange}
                entity={'taxes'}
                outputValue={'taxValue'}
                displayLabels={['taxName']}
                withRedirect={true}
                urlToRedirect="/taxes"
                redirectLabel={translate('Add New Tax')}
                placeholder={translate('Select Tax Value')}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={taxTotal} />
          </Col>
        </Row>
        <Row gutter={[12, -5]}>
          <Col className="gutter-row" span={4} offset={15}>
            <p
              style={{
                paddingLeft: '12px',
                paddingTop: '5px',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {translate('Total')} :
            </p>
          </Col>
          <Col className="gutter-row" span={5}>
            <MoneyInputFormItem readOnly value={total} />
          </Col>
        </Row>
      </div>
    </>
  );
}

// Memoize QuoteForm to prevent unnecessary re-renders when props haven't changed
export default memo(QuoteForm);
