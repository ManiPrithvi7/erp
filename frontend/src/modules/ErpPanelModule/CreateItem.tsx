import { useState, useEffect } from 'react';
import { Button, Tag, Form, Divider, FormInstance } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectCreatedItem } from '@/redux/erp/selectors';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import Loading from '@/components/Loading';
import { ArrowLeftOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { CreateItemProps, InvoiceItem, ErpDocument } from '@/types';

interface SaveFormProps {
  form: FormInstance;
}

function SaveForm({ form }: SaveFormProps): JSX.Element {
  const translate = useLanguage();
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('Save')}
    </Button>
  );
}

export default function CreateItem({ config, CreateForm }: CreateItemProps): JSX.Element {
  const translate = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { entity } = config;

  const { isLoading, isSuccess, result } = useSelector(selectCreatedItem);
  const moneyFormatSettings = useSelector(selectMoneyFormat);

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('🔍 CreateItem rendered:', {
        entity,
        isLoading,
        isSuccess,
        result,
        CreateForm: CreateForm?.name || 'Unknown',
      });
    }
  }, [entity, isLoading, isSuccess, result, CreateForm]);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);
  const [offerSubTotal, setOfferSubTotal] = useState(0);

  const handelValuesChange = (
    _changedValues: Record<string, unknown>,
    values: Record<string, unknown>
  ): void => {
    const items = values['items'] as InvoiceItem[] | undefined;
    let subTotal = 0;
    let subOfferTotal = 0;

    if (items && Array.isArray(items)) {
      items.forEach((item: InvoiceItem) => {
        if (item) {
          if (item.offerPrice && item.quantity) {
            const offerTotal = calculate.multiply(item.quantity, item.offerPrice);
            subOfferTotal = calculate.add(subOfferTotal, offerTotal);
          }
          if (item.quantity && item.price) {
            const total = calculate.multiply(item.quantity, item.price);
            subTotal = calculate.add(subTotal, total);
          }
        }
      });
      setSubTotal(subTotal);
      setOfferSubTotal(subOfferTotal);
    }
  };

  useEffect(() => {
    if (isSuccess && result) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'create' }));
      setSubTotal(0);
      setOfferSubTotal(0);
      const erpResult = result as ErpDocument;
      if (erpResult._id) {
        navigate(`/${entity.toLowerCase()}/read/${erpResult._id}`);
      }
    }
  }, [isSuccess, result, form, dispatch, entity, navigate]);

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    if (fieldsValue) {
      if (fieldsValue.items && Array.isArray(fieldsValue.items)) {
        const newList = [...fieldsValue.items] as InvoiceItem[];
        newList.forEach((item: InvoiceItem) => {
          if (item.quantity && item.price) {
            item.total = calculate.multiply(item.quantity, item.price);
          }
        });
        fieldsValue = {
          ...fieldsValue,
          items: newList,
        };
      }

      // Add currency from settings if not already set
      // Currency is required for Quote and Invoice models
      if (!fieldsValue.currency && moneyFormatSettings?.default_currency_code) {
        fieldsValue.currency = moneyFormatSettings.default_currency_code;
      }

      // Ensure currency is uppercase (as per model requirement)
      if (fieldsValue.currency && typeof fieldsValue.currency === 'string') {
        fieldsValue.currency = fieldsValue.currency.toUpperCase();
      }

      // Fix taxRate: backend expects percentage as number (15), not decimal (0.15)
      // If taxRate is a decimal (0.15), convert it to percentage (15)
      if (fieldsValue.taxRate !== undefined && fieldsValue.taxRate !== null) {
        const taxRateValue = typeof fieldsValue.taxRate === 'string' 
          ? parseFloat(fieldsValue.taxRate) 
          : Number(fieldsValue.taxRate);
        
        // If taxRate is less than 1, it's likely a decimal (0.15), convert to percentage (15)
        if (taxRateValue < 1 && taxRateValue > 0) {
          fieldsValue.taxRate = taxRateValue * 100;
        } else {
          fieldsValue.taxRate = taxRateValue;
        }
      }
    }
    
    // Debug logging
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      console.log('🔍 CreateItem onSubmit:', {
        entity,
        fieldsValue,
        currency: fieldsValue?.currency,
        taxRate: fieldsValue?.taxRate,
        moneyFormatSettings,
        itemsCount: Array.isArray(fieldsValue?.items) ? fieldsValue.items.length : 0,
      });
    }

    dispatch(erp.create({ entity, jsonData: fieldsValue }));
  };

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        backIcon={<ArrowLeftOutlined />}
        title={translate('New')}
        ghost={false}
        tags={<Tag>{translate('Draft')}</Tag>}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => navigate(`/${entity.toLowerCase()}`)}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit} onValuesChange={handelValuesChange}>
          <CreateForm subTotal={subTotal} offerTotal={offerSubTotal} />
        </Form>
      </Loading>
    </>
  );
}
