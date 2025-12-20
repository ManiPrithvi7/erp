import dayjs from 'dayjs';
import useLanguage from '@/locale/useLanguage';
import PaymentDataTableModule from '@/modules/PaymentModule/PaymentDataTableModule';
import { useMoney, useDate } from '@/settings';
import { TableColumn } from '@/types';

export default function Payment(): JSX.Element {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const { moneyFormatter } = useMoney();
  const searchConfig = {
    entity: 'client',
    displayLabels: ['number'],
    searchFields: 'number',
    outputValue: '_id',
  };

  const deleteModalLabels = ['number'];
  const dataTableColumns: TableColumn[] = [
    {
      title: translate('Number'),
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: translate('Client'),
      dataIndex: 'client.name',
      key: 'client',
    },
    {
      title: translate('Amount'),
      dataIndex: 'amount',
      key: 'amount',
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
        const amount = typeof value === 'number' ? value : 0;
        const currency = (record.currency as string) || undefined;
        return moneyFormatter({ amount: amount, currency_code: currency });
      },
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
      title: translate('Number'),
      dataIndex: 'invoice.number',
      key: 'invoiceNumber',
    },
    {
      title: translate('year'),
      dataIndex: 'invoice.year',
      key: 'invoiceYear',
    },
    {
      title: translate('Payment Mode'),
      dataIndex: 'paymentMode.name',
      key: 'paymentMode',
    },
  ];

  const entity = 'payment';

  const Labels = {
    PANEL_TITLE: translate('payment'),
    DATATABLE_TITLE: translate('payment_list'),
    ADD_NEW_ENTITY: translate('add_new_payment'),
    ENTITY_NAME: translate('payment'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    disableAdd: true,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return <PaymentDataTableModule config={config} />;
}
