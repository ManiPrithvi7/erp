import useLanguage from '@/locale/useLanguage';
import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import CrudModule from '@/modules/CrudModule/CrudModule';
import TaxForm from '@/forms/TaxForm';
import { TableColumn } from '@/types';

export default function Taxes(): JSX.Element {
  const translate = useLanguage();
  const entity = 'taxes';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: '_id',
  };

  const deleteModalLabels = ['name'];

  const readColumns: TableColumn[] = [
    {
      title: translate('Name'),
      dataIndex: 'taxName',
      key: 'taxName',
    },
    {
      title: translate('Value'),
      dataIndex: 'taxValue',
      key: 'taxValue',
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
      title: translate('Name'),
      dataIndex: 'taxName',
      key: 'taxName',
    },
    {
      title: translate('Value'),
      dataIndex: 'taxValue',
      key: 'taxValue',
      render: (_: any, record: any) => {
        return <>{record.taxValue + '%'}</>;
      },
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
    PANEL_TITLE: translate('taxes'),
    DATATABLE_TITLE: translate('taxes_list'),
    ADD_NEW_ENTITY: translate('add_new_tax'),
    ENTITY_NAME: translate('taxes'),
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
      createForm={<TaxForm />}
      updateForm={<TaxForm isUpdateForm={true} />}
      config={config}
    />
  );
}

