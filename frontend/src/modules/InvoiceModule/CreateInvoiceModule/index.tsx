import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import InvoiceForm from '@/modules/InvoiceModule/Forms/InvoiceForm';
import { ErpPanelConfig } from '@/types';

interface CreateInvoiceModuleProps {
  config: ErpPanelConfig;
}

export default function CreateInvoiceModule({ config }: CreateInvoiceModuleProps): JSX.Element {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={InvoiceForm} />
    </ErpLayout>
  );
}
