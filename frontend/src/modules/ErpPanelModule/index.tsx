import { useLayoutEffect } from 'react';
import DataTable from './DataTable';
import Delete from './DeleteItem';
import { erp } from '@/redux/erp/actions';
import { useErpContext } from '@/context/erp';
import { useAppDispatch } from '@/redux/hooks';
import { ErpPanelConfig, MenuItemType } from '@/types';

interface ErpPanelProps {
  config: ErpPanelConfig;
  extra?: MenuItemType[];
}

export default function ErpPanel({ config, extra }: ErpPanelProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { state } = useErpContext();
  const { deleteModal } = state;

  const dispatcher = (): void => {
    dispatch(erp.resetState());
  };

  useLayoutEffect(() => {
    const controller = new AbortController();
    dispatcher();
    return () => {
      controller.abort();
    };
  }, [dispatch]);

  return (
    <>
      <DataTable config={config} extra={extra} />
      <Delete config={config} isOpen={deleteModal.isOpen} />
    </>
  );
}
