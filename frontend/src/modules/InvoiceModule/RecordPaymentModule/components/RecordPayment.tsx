import { useState, useEffect } from 'react';
import { Form, Button } from 'antd';
import { useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectRecordPaymentItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';
import PaymentForm from '@/forms/PaymentForm';
import { useNavigate } from 'react-router-dom';
import calculate from '@/utils/calculate';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface RecordPaymentProps {
  config: ErpPanelConfig;
}

export default function RecordPayment({ config }: RecordPaymentProps): JSX.Element {
  const navigate = useNavigate();
  const translate = useLanguage();
  const { entity } = config;
  const dispatch = useAppDispatch();

  const { isLoading, isSuccess, current: currentInvoice } = useSelector(selectRecordPaymentItem);

  const [form] = Form.useForm();
  const [maxAmount, setMaxAmount] = useState(0);
  
  useEffect(() => {
    if (currentInvoice) {
      const invoice = currentInvoice as ErpDocument;
      const { credit = 0, total = 0 } = invoice;
      const discount = (invoice as Record<string, unknown>).discount as number || 0;
      const result = calculate.sub(calculate.sub(total, discount), credit);
      setMaxAmount(typeof result === 'number' ? result : parseFloat(String(result)) || 0);
    }
  }, [currentInvoice]);
  
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity}/`);
    }
  }, [isSuccess, form, dispatch, entity, navigate]);

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    if (currentInvoice) {
      const invoice = currentInvoice as ErpDocument;
      const { _id: invoiceId } = invoice;
      const client = invoice.client && typeof invoice.client === 'object' && '_id' in invoice.client 
        ? (invoice.client as { _id?: string })._id 
        : undefined;
      fieldsValue = {
        ...fieldsValue,
        invoice: invoiceId,
        client,
      };
    }

    dispatch(
      erp.recordPayment({
        entity: 'payment',
        jsonData: fieldsValue,
      })
    );
  };

  return (
    <Loading isLoading={isLoading}>
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <PaymentForm maxAmount={maxAmount} />
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {translate('Record Payment')}
          </Button>
        </Form.Item>
      </Form>
    </Loading>
  );
}
