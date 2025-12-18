import { ErpLayout } from '@/layout';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectItemById, selectCurrentItem } from '@/redux/erp/selectors';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Payment from './components/Payment';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface RecordPaymentModuleProps {
  config: ErpPanelConfig;
}

export default function RecordPaymentModule({ config }: RecordPaymentModuleProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();

  let item = useSelector(selectItemById(id || '')) as ErpDocument | undefined;

  useEffect(() => {
    if (item) {
      dispatch(erp.currentItem({ data: item }));
    } else if (id && config.entity) {
      dispatch(erp.read({ entity: config.entity, id }));
    }
  }, [item, id, config.entity, dispatch]);

  const { result: currentResult } = useSelector(selectCurrentItem);
  item = (currentResult as ErpDocument) || item;

  useEffect(() => {
    if (item) {
      dispatch(erp.currentAction({ actionType: 'recordPayment', data: item as Record<string, unknown> }));
    }
  }, [item, dispatch]);

  return (
    <ErpLayout>
      {item ? <Payment config={config} currentItem={currentResult as ErpDocument} /> : <PageLoader />}
    </ErpLayout>
  );
}
