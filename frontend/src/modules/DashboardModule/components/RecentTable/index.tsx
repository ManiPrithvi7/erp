import { Dropdown, Table } from 'antd';
import { request } from '@/request';
import useFetch from '@/hooks/useFetch';
import { EllipsisOutlined, EyeOutlined, EditOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useAppDispatch } from '@/redux/hooks';
import { erp } from '@/redux/erp/actions';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { RecentTableProps, TableColumn, ErpDocument } from '@/types';

export default function RecentTable(props: RecentTableProps): JSX.Element {
  const translate = useLanguage();
  const { entity, dataTableColumns } = props;

  const items = [
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
  ];

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleRead = (record: ErpDocument): void => {
    dispatch(erp.currentItem({ data: record }));
    navigate(`/${entity}/read/${record._id}`);
  };
  const handleEdit = (record: ErpDocument): void => {
    dispatch(erp.currentAction({ actionType: 'update', data: record }));
    navigate(`/${entity}/update/${record._id}`);
  };
  const handleDownload = (record: ErpDocument): void => {
    if (record._id) {
      window.open(`${DOWNLOAD_BASE_URL}${entity}/${entity}-${record._id}.pdf`, '_blank');
    }
  };

  const columnsWithAction: TableColumn[] = [
    ...dataTableColumns,
    {
      title: '',
      key: 'action',
      render: (_: unknown, record: Record<string, unknown>) => (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              const erpRecord = record as ErpDocument;
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
      ),
    },
  ];

  const asyncList = () => {
    return request.list({ entity });
  };
  const { result, isLoading, isSuccess } = useFetch(asyncList);
  const firstFiveItems = (): ErpDocument[] => {
    if (isSuccess && result && Array.isArray(result)) return (result as ErpDocument[]).slice(0, 5);
    return [];
  };

  return (
    <Table
      columns={columnsWithAction as Parameters<typeof Table>[0]['columns']}
      rowKey={(item: Record<string, unknown>) => (item as ErpDocument)._id || ''}
      dataSource={isSuccess ? firstFiveItems() : []}
      pagination={false}
      loading={isLoading}
      scroll={{ x: true }}
    />
  );
}
