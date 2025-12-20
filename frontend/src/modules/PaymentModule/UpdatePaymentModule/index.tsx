import { ErpLayout } from '@/layout';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import NotFound from '@/components/NotFound';
import { useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Payment from './components/Payment';
import { selectReadItem } from '@/redux/erp/selectors';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface UpdatePaymentModuleProps {
  config: ErpPanelConfig;
}

export default function UpdatePaymentModule({ config }: UpdatePaymentModuleProps): JSX.Element {
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
          <Payment config={config} currentItem={currentResult as ErpDocument} />
        ) : (
          <NotFound entity={config.entity} />
        )}
      </ErpLayout>
    );
}
