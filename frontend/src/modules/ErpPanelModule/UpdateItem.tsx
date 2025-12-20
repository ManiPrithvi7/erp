import { useState, useEffect } from 'react';
import { Form, Divider, FormInstance } from 'antd';
import dayjs from 'dayjs';
import { Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import calculate from '@/utils/calculate';
import { generate as uniqueId } from 'shortid';
import { selectUpdatedItem } from '@/redux/erp/selectors';
import Loading from '@/components/Loading';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { UpdateItemProps, InvoiceItem, ErpDocument } from '@/types';

interface SaveFormProps {
  form: FormInstance;
  translate: (key: string) => string;
}

function SaveForm({ form, translate }: SaveFormProps): JSX.Element {
  const handelClick = () => {
    form.submit();
  };

  return (
    <Button onClick={handelClick} type="primary" icon={<PlusOutlined />}>
      {translate('update')}
    </Button>
  );
}

export default function UpdateItem({ config, UpdateForm }: UpdateItemProps): JSX.Element {
  const translate = useLanguage();
  const { entity } = config;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, isLoading, isSuccess } = useSelector(selectUpdatedItem);
  const [form] = Form.useForm();
  const [subTotal, setSubTotal] = useState(0);

  const resetErp: ErpDocument = {
    status: '',
    client: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    subTotal: 0,
    taxTotal: 0,
    taxRate: 0,
    total: 0,
    credit: 0,
    number: 0,
    year: 0,
  };

  const [currentErp, setCurrentErp] = useState<ErpDocument>(current as ErpDocument ?? resetErp);
  const { id } = useParams<{ id: string }>();

  const handelValuesChange = (_changedValues: Record<string, unknown>, values: Record<string, unknown>): void => {
    const items = values['items'] as InvoiceItem[] | undefined;
    let subTotal = 0;

    if (items && Array.isArray(items)) {
      items.forEach((item: InvoiceItem) => {
        if (item && item.quantity && item.price) {
          const total = calculate.multiply(item.quantity, item.price);
          subTotal = calculate.add(subTotal, total);
        }
      });
      setSubTotal(subTotal);
    }
  };

  const onSubmit = (fieldsValue: Record<string, unknown>): void => {
    let dataToUpdate = { ...fieldsValue };
    if (fieldsValue) {
      if (fieldsValue.date || fieldsValue.expiredDate) {
        if (fieldsValue.date) {
          dataToUpdate.date = dayjs(fieldsValue.date as string | number | Date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        }
        if (fieldsValue.expiredDate) {
          dataToUpdate.expiredDate = dayjs(fieldsValue.expiredDate as string | number | Date).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        }
      }
      if (fieldsValue.items && Array.isArray(fieldsValue.items)) {
        const newList: InvoiceItem[] = [];
        (fieldsValue.items as InvoiceItem[]).forEach((item: InvoiceItem) => {
          const { quantity, price, itemName, description } = item;
          const total = (item.quantity || 0) * (item.price || 0);
          newList.push({ total, quantity: quantity || 0, price: price || 0, itemName: itemName || '', description: description || '' });
        });
        dataToUpdate.items = newList;
      }
    }

    if (id) {
      dispatch(erp.update({ entity, id, jsonData: dataToUpdate }));
    }
  };
  
  useEffect(() => {
    if (isSuccess && id) {
      form.resetFields();
      setSubTotal(0);
      dispatch(erp.resetAction({ actionType: 'update' }));
      navigate(`/${entity.toLowerCase()}/read/${id}`);
    }
  }, [isSuccess, id, form, dispatch, entity, navigate]);

  useEffect(() => {
    if (current) {
      setCurrentErp(current as ErpDocument);
      let formData = { ...current } as Record<string, unknown>;
      if (formData.date) {
        formData.date = dayjs(formData.date as string);
      }
      if (formData.expiredDate) {
        formData.expiredDate = dayjs(formData.expiredDate as string);
      }
      if (!formData.taxRate) {
        formData.taxRate = 0;
      }

      const { subTotal: currentSubTotal } = formData;
      form.resetFields();
      form.setFieldsValue(formData);
      setSubTotal((currentSubTotal as number) || 0);
    }
  }, [current, form]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={translate('update')}
        ghost={false}
        tags={[
          currentErp.status ? <span key="status">{translate(currentErp.status)}</span> : null,
          currentErp.paymentStatus ? (
            <span key="paymentStatus">{translate(currentErp.paymentStatus)}</span>
          ) : null,
        ].filter(Boolean) as React.ReactElement[]}
        extra={[
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              navigate(`/${entity.toLowerCase()}`);
            }}
            icon={<CloseCircleOutlined />}
          >
            {translate('Cancel')}
          </Button>,
          <SaveForm translate={translate} form={form} key={`${uniqueId()}`} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>
      <Divider dashed />
      <Loading isLoading={isLoading}>
        <Form form={form} layout="vertical" onFinish={onSubmit} onValuesChange={handelValuesChange}>
          <UpdateForm subTotal={subTotal} current={current} />
        </Form>
      </Loading>
    </>
  );
}
