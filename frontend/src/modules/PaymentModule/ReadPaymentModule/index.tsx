import { ErpLayout } from '@/layout';
import ReadItem from './components/ReadItem';
import PageLoader from '@/components/PageLoader';
import { erp } from '@/redux/erp/actions';
import { selectItemById, selectCurrentItem } from '@/redux/erp/selectors';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, ErpDocument } from '@/types';

interface ReadPaymentModuleProps {
  config: ErpPanelConfig;
}

export default function ReadPaymentModule({ config }: ReadPaymentModuleProps): JSX.Element {
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
  
  return (
    <ErpLayout>
      {item ? <ReadItem config={config} selectedItem={item} /> : <PageLoader />}
    </ErpLayout>
  );
}
