import { useState, useEffect } from 'react';
import { Form, Button } from 'antd';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';
import Loading from '@/components/Loading';
import calculate from '@/utils/calculate';
import PaymentForm from '@/forms/PaymentForm';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface UpdatePaymentProps {
  config: ErpPanelConfig;
  currentInvoice: ErpDocument;
}

export default function UpdatePayment({ config, currentInvoice }: UpdatePaymentProps): JSX.Element {
  const translate = useLanguage();
  const navigate = useNavigate();
  const { entity } = config;
  const dispatch = useAppDispatch();

  const { isLoading, isSuccess } = useSelector(selectUpdatedItem);

  const [form] = Form.useForm();
  const [maxAmount, setMaxAmount] = useState(0);

  useEffect(() => {
    if (currentInvoice) {
      const { credit = 0, total = 0 } = currentInvoice;
      const discount = ((currentInvoice as Record<string, unknown>).discount as number) || 0;
      const amount = ((currentInvoice as Record<string, unknown>).amount as number) || 0;

      const result = calculate.sub(
        calculate.sub(total, discount),
        calculate.sub(calculate.sub(credit, amount), 0)
      );
      setMaxAmount(typeof result === 'number' ? result : parseFloat(String(result)) || 0);
      
      const newInvoiceValues: Record<string, unknown> = { ...currentInvoice };
      if (newInvoiceValues.date) {
        newInvoiceValues.date = dayjs(newInvoiceValues.date as string | number | Date);
      }
      form.setFieldsValue(newInvoiceValues);
    }
  }, [currentInvoice, form]);

  useEffect(() => {
    if (isSuccess && currentInvoice._id) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity.toLowerCase()}/read/${currentInvoice._id}`);
    }
  }, [isSuccess, form, dispatch, entity, navigate, currentInvoice._id]);

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    if (currentInvoice) {
      const { _id: invoiceId } = currentInvoice;
      const client = currentInvoice.client && 
        typeof currentInvoice.client === 'object' && 
        '_id' in currentInvoice.client
        ? (currentInvoice.client as { _id?: string })._id 
        : undefined;
      fieldsValue = {
        ...fieldsValue,
        invoice: invoiceId,
        client,
      };
    }

    if (currentInvoice._id) {
      dispatch(
        erp.update({
          entity,
          id: currentInvoice._id,
          jsonData: fieldsValue,
        })
      );
    }
  };

  return (
    <>
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <PaymentForm maxAmount={maxAmount} />
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {translate('Update')}
            </Button>
          </Form.Item>
        </Form>
      </Loading>
    </>
  );
}
