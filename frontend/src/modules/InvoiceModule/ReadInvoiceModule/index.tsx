import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import ReadItem from '@/modules/ErpPanelModule/ReadItem';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface ReadInvoiceModuleProps {
  config: ErpPanelConfig;
}

export default function ReadInvoiceModule({ config }: ReadInvoiceModuleProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  useLayoutEffect(() => {
    if (id && config.entity) {
      dispatch(erp.read({ entity: config.entity, id }));
    }
  }, [id, config.entity, dispatch]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  if (isLoading) {
    return (
      <ErpLayout>
        <PageLoader />
      </ErpLayout>
    );
  } else
    return (
      <ErpLayout>
        {isSuccess ? (
          <ReadItem config={config} selectedItem={currentResult as ErpDocument | undefined} />
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
