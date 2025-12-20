import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import useLanguage from '@/locale/useLanguage';
import { CreditCardOutlined } from '@ant-design/icons';
import { ErpPanelConfig, MenuItemType } from '@/types';

interface InvoiceDataTableModuleProps {
  config: ErpPanelConfig;
}

export default function InvoiceDataTableModule({ config }: InvoiceDataTableModuleProps): JSX.Element {
  const translate = useLanguage();
  return (
    <ErpLayout>
      <ErpPanel
        config={config}
        extra={[
          {
            label: translate('Record Payment'),
            key: 'recordPayment',
            icon: <CreditCardOutlined />,
          },
        ] as MenuItemType[]}
      ></ErpPanel>
    </ErpLayout>
  );
}
