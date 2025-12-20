import { ErpLayout } from '@/layout';
import CreateItem from '@/modules/ErpPanelModule/CreateItem';
import QuoteForm from '@/modules/QuoteModule/Forms/QuoteForm';
import { ErpPanelConfig } from '@/types';

interface CreateQuoteModuleProps {
  config: ErpPanelConfig;
}

export default function CreateQuoteModule({ config }: CreateQuoteModuleProps): JSX.Element {
  return (
    <ErpLayout>
      <CreateItem config={config} CreateForm={QuoteForm} />
    </ErpLayout>
  );
}
