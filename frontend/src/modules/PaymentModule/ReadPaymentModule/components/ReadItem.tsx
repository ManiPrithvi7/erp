import { useState, useEffect } from 'react';
import { Button, Row, Descriptions, Statistic, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import {
  EditOutlined,
  FilePdfOutlined,
  CloseCircleOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import useLanguage from '@/locale/useLanguage';
import { generate as uniqueId } from 'shortid';
import { selectCurrentItem } from '@/redux/erp/selectors';
import { DOWNLOAD_BASE_URL } from '@/config/serverApiConfig';
import { useMoney } from '@/settings';
import useMail from '@/hooks/useMail';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument, Client, InvoiceItem } from '@/types';

interface ReadItemProps {
  config: ErpPanelConfig;
  selectedItem: ErpDocument;
}

export default function ReadItem({ config, selectedItem }: ReadItemProps): JSX.Element {
  const translate = useLanguage();
  const { entity, ENTITY_NAME } = config;
  const dispatch = useAppDispatch();

  const { moneyFormatter } = useMoney();
  const { send, isLoading: mailInProgress } = useMail({ entity });
  const navigate = useNavigate();

  const { result: currentResult } = useSelector(selectCurrentItem);

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

  const [_itemslist, setItemsList] = useState<InvoiceItem[]>([]);
  const [currentErp, setCurrentErp] = useState<ErpDocument>(selectedItem ?? resetErp);
  const [client, setClient] = useState<Client>({} as Client);

  useEffect(() => {
    if (currentResult) {
      const result = currentResult as ErpDocument & { invoice?: ErpDocument };
      const { items, invoice, ...others } = result;

      if (items && Array.isArray(items)) {
        setItemsList(items);
        setCurrentErp(result);
      } else if (invoice && invoice.items && Array.isArray(invoice.items)) {
        setItemsList(invoice.items);
        setCurrentErp({ ...others, ...invoice } as ErpDocument);
      }
    }
    return () => {
      setItemsList([]);
      setCurrentErp(resetErp);
    };
  }, [currentResult]);

  useEffect(() => {
    if (currentErp?.client) {
      setClient(currentErp.client as Client);
    }
  }, [currentErp]);

  return (
    <>
      <PageHeader
        onBack={() => {
          navigate(`/${entity.toLowerCase()}`);
        }}
        title={`${ENTITY_NAME} # ${currentErp.number || ''}/${currentErp.year || ''}`}
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
            {translate('Close')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              if (currentErp._id) {
                window.open(
                  `${DOWNLOAD_BASE_URL}${entity}/${entity}-${currentErp._id}.pdf`,
                  '_blank'
                );
              }
            }}
            icon={<FilePdfOutlined />}
          >
            {translate('Download PDF')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            loading={mailInProgress}
            onClick={() => {
              if (currentErp._id) {
                send(currentErp._id);
              }
            }}
            icon={<MailOutlined />}
          >
            {translate('Send by Email')}
          </Button>,
          <Button
            key={`${uniqueId()}`}
            onClick={() => {
              dispatch(
                erp.currentAction({
                  actionType: 'update',
                  data: currentErp,
                })
              );
              if (currentErp._id) {
                navigate(`/${entity.toLowerCase()}/update/${currentErp._id}`);
              }
            }}
            type="primary"
            icon={<EditOutlined />}
          >
            {translate('Edit')}
          </Button>,
        ]}
        style={{
          padding: '20px 0px',
        }}
      >
        <Row>
          <Statistic title="Status" value={currentErp.status} />
          <Statistic
            title={translate('SubTotal')}
            value={moneyFormatter({
              amount: currentErp.subTotal || 0,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Total')}
            value={moneyFormatter({ amount: currentErp.total || 0, currency_code: currentErp.currency })}
            style={{
              margin: '0 32px',
            }}
          />
          <Statistic
            title={translate('Paid')}
            value={moneyFormatter({
              amount: currentErp.credit || 0,
              currency_code: currentErp.currency,
            })}
            style={{
              margin: '0 32px',
            }}
          />
        </Row>
      </PageHeader>
      <Divider dashed />
      <Descriptions title={`Client : ${currentErp.client?.name || ''}`}>
        <Descriptions.Item label={translate('Address')}>{client.address || ''}</Descriptions.Item>
        <Descriptions.Item label={translate('email')}>{client.email || ''}</Descriptions.Item>
        <Descriptions.Item label={translate('Phone')}>{client.phone || ''}</Descriptions.Item>
      </Descriptions>
      <Divider />
    </>
  );
}
