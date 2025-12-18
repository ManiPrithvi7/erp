import { useEffect, ReactNode } from 'react';
import { Modal } from 'antd';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { selectDeletedItem } from '@/redux/crud/selectors';
import useLanguage from '@/locale/useLanguage';

interface CrudModalProps {
  config: {
    entity: string;
    modalTitle?: string;
    [key: string]: any;
  };
  children?: ReactNode;
}

export default function CrudModal({ config, children }: CrudModalProps): JSX.Element {
  const translate = useLanguage();
  let { entity, modalTitle = translate('delete_confirmation') } = config;
  const dispatch = useAppDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, crudContextAction } = useCrudContext();
  const { isModalOpen } = state;
  const { modal } = crudContextAction;

  useEffect(() => {
    if (isSuccess) {
      modal.close();
      dispatch(crud.list({ entity }));
    }
  }, [isSuccess, dispatch, entity, modal]);

  const handleOk = () => {
    if (!current || !('_id' in current)) return;
    const id = (current as any)._id;
    dispatch(crud.delete({ entity, id }));
  };
  const handleCancel = () => {
    if (!isLoading) modal.close();
  };
  return (
    <Modal
      title={modalTitle}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      {children}
    </Modal>
  );
}
