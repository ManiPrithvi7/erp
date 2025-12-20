import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import { ErpPanelConfig } from '@/types';

interface PaymentDataTableModuleProps {
  config: ErpPanelConfig;
}

export default function PaymentDataTableModule({ config }: PaymentDataTableModuleProps): JSX.Element {
  return (
    <ErpLayout>
      <ErpPanel config={config} extra={[]}></ErpPanel>
    </ErpLayout>
  );
}
