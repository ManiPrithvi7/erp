import dayjs from 'dayjs';
import QuoteDataTableModule from '@/modules/QuoteModule/QuoteDataTableModule';
import { useMoney, useDate } from '@/settings';
import useLanguage from '@/locale/useLanguage';
import { TableColumn } from '@/types';

export default function Quote(): JSX.Element {
  const translate = useLanguage();
  const { dateFormat } = useDate();
  const entity = 'quote';
  const { moneyFormatter } = useMoney();

  const searchConfig = {
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['number', 'client.name'];
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
      title: translate('Sub Total'),
      dataIndex: 'subTotal',
      key: 'subTotal',
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
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('proforma invoice'),
    DATATABLE_TITLE: translate('proforma invoice_list'),
    ADD_NEW_ENTITY: translate('add_new_proforma invoice'),
    ENTITY_NAME: translate('proforma invoice'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return <QuoteDataTableModule config={config} />;
}
