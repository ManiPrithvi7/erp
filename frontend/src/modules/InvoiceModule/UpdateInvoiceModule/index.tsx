import NotFound from '@/components/NotFound';
import { ErpLayout } from '@/layout';
import UpdateItem from '@/modules/ErpPanelModule/UpdateItem';
import InvoiceForm from '@/modules/InvoiceModule/Forms/InvoiceForm';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectReadItem } from '@/redux/erp/selectors';
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface UpdateInvoiceModuleProps {
  config: ErpPanelConfig;
}

export default function UpdateInvoiceModule({ config }: UpdateInvoiceModuleProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  useLayoutEffect(() => {
    if (id && config.entity) {
      dispatch(erp.read({ entity: config.entity, id }));
    }
  }, [id, config.entity, dispatch]);

  const { result: currentResult, isSuccess, isLoading = true } = useSelector(selectReadItem);

  useLayoutEffect(() => {
    if (currentResult) {
      const data = { ...currentResult } as ErpDocument;
      dispatch(erp.currentAction({ actionType: 'update', data }));
    }
  }, [currentResult, dispatch]);

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
          <UpdateItem config={config} UpdateForm={InvoiceForm} />
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
