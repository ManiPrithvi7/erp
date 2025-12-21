import { useEffect, useMemo, useCallback } from 'react';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  RedoOutlined,
  PlusOutlined,
  EllipsisOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { Dropdown, Table, Button, MenuProps } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import AutoCompleteAsync from '@/components/AutoCompleteAsync';
import { useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { erp } from '@/redux/erp/actions';
import { selectListItems } from '@/redux/erp/selectors';
import { useErpContext } from '@/context/erp';
import { useNavigate } from 'react-router-dom';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useAppDispatch } from '@/redux/hooks';
import { DataTableProps, ErpDocument, TableColumn } from '@/types';

interface AddNewItemProps {
  config: DataTableProps['config'];
}

function AddNewItem({ config }: AddNewItemProps): JSX.Element {
  const navigate = useNavigate();
  const { ADD_NEW_ENTITY, entity } = config;

  const handleClick = () => {
    const targetPath = `/${entity.toLowerCase()}/create`;
    console.log('🔍 AddNewItem clicked:', { entity, targetPath, ADD_NEW_ENTITY });
    navigate(targetPath);
  };

  return (
    <Button onClick={handleClick} type="primary" icon={<PlusOutlined />}>
      {ADD_NEW_ENTITY}
    </Button>
  );
}

export default function DataTable({ config, extra = [] }: DataTableProps): JSX.Element {
  const translate = useLanguage();
  const { entity, dataTableColumns, disableAdd = false, searchConfig } = config;
  const { DATATABLE_TITLE } = config;
  const { result: listResult, isLoading: listIsLoading } = useSelector(selectListItems);
  const { pagination, items: dataSource } = listResult;
  const { erpContextAction } = useErpContext();
  const { modal } = erpContextAction;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items: MenuProps['items'] = [
    {
      label: translate('Show'),
      key: 'read',
      icon: <EyeOutlined />,
    },
    {
      label: translate('Edit'),
      key: 'edit',
      icon: <EditOutlined />,
    },
    {
      label: translate('Download'),
      key: 'download',
      icon: <FilePdfOutlined />,
    },
    ...(extra || []).map((item) => ({
      label: item.label,
      key: item.key || '',
      icon: item.icon,
    })),
    {
      type: 'divider' as const,
    },
    {
      label: translate('Delete'),
      key: 'delete',
      icon: <DeleteOutlined />,
    },
  ];

  const handleRead = (record: ErpDocument): void => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${entity}/read/${record._id}`);
  };
  const handleEdit = (record: ErpDocument): void => {
    const data = { ...record };
    dispatch(erp.currentAction({ actionType: 'update', data }));
    navigate(`/${entity}/update/${record._id}`);
  };
  const handleDownload = (record: ErpDocument): void => {
    if (record._id) {
      window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
    }
  };
  const handleDelete = (record: ErpDocument): void => {
    dispatch(erp.currentAction({ actionType: 'delete', data: record }));
    modal.open();
  };
  const handleRecordPayment = (record: ErpDocument): void => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/invoice/pay/${record._id}`);
  };

  const columnsWithAction: TableColumn[] = [
    ...(dataTableColumns || []),
    {
      title: '',
      key: 'action',
      fixed: 'right',
      render: (_: unknown, record: Record<string, unknown>) => {
        const erpRecord = record as ErpDocument;
        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                switch (key) {
                  case 'read':
                    handleRead(erpRecord);
                    break;
                  case 'edit':
                    handleEdit(erpRecord);
                    break;
                  case 'download':
                    handleDownload(erpRecord);
                    break;
                  case 'delete':
                    handleDelete(erpRecord);
                    break;
                  case 'recordPayment':
                    handleRecordPayment(erpRecord);
                    break;
                  default:
                    break;
                }
              },
            }}
            trigger={['click']}
          >
            <EllipsisOutlined
              style={{ cursor: 'pointer', fontSize: '24px' }}
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      },
    },
  ];

  const handelDataTableLoad = (pagination: { current?: number; pageSize?: number }): void => {
    const options = { page: pagination.current || 1, items: pagination.pageSize || 10 };
    dispatch(erp.list({ entity, options }));
  };

  const dispatcher = (): void => {
    dispatch(erp.list({ entity }));
  };

  useEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, [dispatch, entity]);

  // Memoize filterTable to prevent recreation on every render
  const filterTable = useCallback((value: string): void => {
    const options = { equal: value, filter: searchConfig?.entity || '' };
    dispatch(erp.list({ entity, options }));
  }, [dispatch, entity, searchConfig?.entity]);
  
  // Memoize displayLabels array to prevent recreation
  const displayLabels = useMemo(() => ['name'], []);

  return (
    <>
      <PageHeader
        title={DATATABLE_TITLE}
        ghost={true}
        onBack={() => window.history.back()}
        backIcon={<ArrowLeftOutlined />}
        extra={[
          searchConfig?.entity && (
            <AutoCompleteAsync
              key="search-autocomplete"
              entity={searchConfig.entity}
              displayLabels={displayLabels}
              searchFields={'name'}
              onChange={filterTable}
            />
          ),
          <Button onClick={() => handelDataTableLoad(pagination)} key="refresh-button" icon={<RedoOutlined />}>
            {translate('Refresh')}
          </Button>,
          !disableAdd && <AddNewItem key="add-new-item" config={config} />,
        ]}
        style={{
          padding: '20px 0px',
        }}
      ></PageHeader>

      <Table
        columns={columnsWithAction as unknown as Parameters<typeof Table>[0]['columns']}
        rowKey={(item: Record<string, unknown>) => (item as ErpDocument)._id || ''}
        dataSource={dataSource as ErpDocument[]}
        pagination={pagination}
        loading={listIsLoading}
        onChange={handelDataTableLoad}
        scroll={{ x: true }}
      />
    </>
  );
}
