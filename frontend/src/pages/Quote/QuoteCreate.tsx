import useLanguage from '@/locale/useLanguage';
import CreateQuoteModule from '@/modules/QuoteModule/CreateQuoteModule';

export default function QuoteCreate(): JSX.Element {
  const translate = useLanguage();

  const entity = 'quote';

  const Labels = {
    PANEL_TITLE: translate('quote'),
    DATATABLE_TITLE: translate('quote_list'),
    ADD_NEW_ENTITY: translate('add_new_quote'),
    ENTITY_NAME: translate('quote'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  // Debug logging
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    console.log('🔍 QuoteCreate page rendered:', { entity, configPage });
  }

  return <CreateQuoteModule config={configPage} />;
}

