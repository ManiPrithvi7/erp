import { ErpLayout } from '@/layout';
import ErpPanel from '@/modules/ErpPanelModule';
import { ErpPanelConfig } from '@/types';

interface QuoteDataTableModuleProps {
  config: ErpPanelConfig;
}

export default function QuoteDataTableModule({ config }: QuoteDataTableModuleProps): JSX.Element {
  return (
    <ErpLayout>
      <ErpPanel config={config} extra={[]}></ErpPanel>
    </ErpLayout>
  );
}
