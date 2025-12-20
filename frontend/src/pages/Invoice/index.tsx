import { useLayoutEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { erp } from '@/redux/erp/actions';
import InvoiceDataTableModule from '@/modules/InvoiceModule/InvoiceDataTableModule';
import CreateInvoiceModule from '@/modules/InvoiceModule/CreateInvoiceModule';
import ReadInvoiceModule from '@/modules/InvoiceModule/ReadInvoiceModule';
import UpdateInvoiceModule from '@/modules/InvoiceModule/UpdateInvoiceModule';
import RecordPaymentModule from '@/modules/InvoiceModule/RecordPaymentModule';
import { Routes, Route } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';
import { useMoney, useDate } from '@/settings';
import { TableColumn, ModuleConfig } from '@/types';
import dayjs from 'dayjs';

export default function Invoice(): JSX.Element {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const { dateFormat } = useDate();
  const dispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(erp.list({ entity: 'invoice' }));
  }, [dispatch]);

  const entity = 'invoice';
  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['number', 'client.name'];

  const dataTableColumns: TableColumn[] = [
    {
      title: translate('number'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: ['client', 'name'],
      key: 'client',
    },
    {
      title: translate('Date'),
      dataIndex: 'date',
      key: 'date',
      render: (value: unknown) => {
        const date = typeof value === 'string' ? value : String(value);
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('expired Date'),
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      render: (value: unknown) => {
        const date = typeof value === 'string' ? value : String(value);
        return dayjs(date).format(dateFormat);
      },
    },
    {
      title: translate('Total'),
      dataIndex: 'total',
      key: 'total',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (value: unknown, record: Record<string, unknown>) => {
        const total = typeof value === 'number' ? value : 0;
        const currency = (record.currency as string) || undefined;
        return moneyFormatter({ amount: total, currency_code: currency });
      },
    },
    {
      title: translate('paid'),
      dataIndex: 'credit',
      key: 'credit',
      onCell: () => {
        return {
          style: {
            textAlign: 'right',
            whiteSpace: 'nowrap',
            direction: 'ltr',
          },
        };
      },
      render: (value: unknown, record: Record<string, unknown>) => {
        const total = typeof value === 'number' ? value : 0;
        const currency = (record.currency as string) || undefined;
        return moneyFormatter({ amount: total, currency_code: currency });
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('invoice'),
    DATATABLE_TITLE: translate('invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_invoice'),
    ENTITY_NAME: translate('invoice'),
    RECORD_ENTITY: translate('record_payment'),
  };

  const configPage: Partial<ModuleConfig> = {
    entity,
    ...Labels,
  };
  const invoiceConfig: ModuleConfig = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  } as ModuleConfig;

  return (
    <Routes>
      <Route path="/" element={<InvoiceDataTableModule config={invoiceConfig} />} />
      <Route path="/create" element={<CreateInvoiceModule config={invoiceConfig} />} />
      <Route path="/read/:id" element={<ReadInvoiceModule config={invoiceConfig} />} />
      <Route path="/update/:id" element={<UpdateInvoiceModule config={invoiceConfig} />} />
      <Route path="/pay/:id" element={<RecordPaymentModule config={invoiceConfig} />} />
    </Routes>
  );
}
