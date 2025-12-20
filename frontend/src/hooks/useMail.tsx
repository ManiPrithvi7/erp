import { erp } from '@/redux/erp/actions';
import { useSelector } from 'react-redux';
import { selectMailItem } from '@/redux/erp/selectors';
import { useAppDispatch } from '@/redux/hooks';

export default function useMail({ entity }: { entity: string }) {
  const { isLoading } = useSelector(selectMailItem);
  const dispatch = useAppDispatch();

  const send = (id: string): void => {
    const jsonData = { id };
    dispatch(erp.mail({ entity, jsonData }));
  };

  return { send, isLoading };
}

