import useLanguage from '@/locale/useLanguage';
import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import PaymentModeForm from '@/forms/PaymentModeForm';
import { TableColumn } from '@/types';

export default function PaymentMode(): JSX.Element {
  const translate = useLanguage();
  const entity = 'paymentMode';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name'];

  const readColumns: TableColumn[] = [
    {
      title: translate('Payment Mode'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Default'),
      dataIndex: 'isDefault',
      key: 'isDefault',
    },
    {
      title: translate('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
    },
  ];
  const dataTableColumns: TableColumn[] = [
    {
      title: translate('Payment Mode'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Default'),
      dataIndex: 'isDefault',
      key: 'isDefault',
      onCell: () => {
        return {
          props: {
            style: {
              width: '60px',
            },
          },
        };
      },
      render: (_: any, record: any) => {
        return (
          <Switch
            checked={record.isDefault}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        );
      },
    },
    {
      title: translate('enabled'),
      dataIndex: 'enabled',
      key: 'enabled',
      onCell: () => {
        return {
          props: {
            style: {
              width: '60px',
            },
          },
        };
      },
      render: (_: any, record: any) => {
        return (
          <Switch
            checked={record.enabled}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        );
      },
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('payment_mode'),
    DATATABLE_TITLE: translate('payment_mode_list'),
    ADD_NEW_ENTITY: translate('add_new_payment_mode'),
    ENTITY_NAME: translate('payment_mode'),
  };

  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    readColumns,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<PaymentModeForm />}
      updateForm={<PaymentModeForm isUpdateForm={true} />}
      config={config}
    />
  );
}

