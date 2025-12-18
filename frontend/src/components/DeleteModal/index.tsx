import { useEffect, useState, ReactNode } from 'react';
import { Modal } from 'antd';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import { crud } from '@/redux/crud/actions';
import { useCrudContext } from '@/context/crud';
import { useAppContext } from '@/context/appContext';
import { selectDeletedItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';

interface DeleteModalProps {
  config: {
    entity: string;
    deleteModalLabels?: string[];
    deleteMessage?: string;
    modalTitle?: string;
    [key: string]: any;
  };
  children?: ReactNode;
}

export default function DeleteModal({ config, children }: DeleteModalProps): JSX.Element {
  const translate = useLanguage();
  let {
    entity,
    deleteModalLabels = [],
    deleteMessage = translate('are_you_sure_you_want_to_delete'),
    modalTitle = translate('delete_confirmation'),
  } = config;
  const dispatch = useAppDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, crudContextAction } = useCrudContext();
  const { appContextAction } = useAppContext();
  const { panel, readBox } = crudContextAction;
  const { navMenu } = appContextAction;
  const { isModalOpen } = state;
  const { modal } = crudContextAction;
  const [displayItem, setDisplayItem] = useState('');

  useEffect(() => {
    if (isSuccess) {
      console.log('🚀 ~ useEffect ~ DeleteModal isSuccess:', isSuccess);
      modal.close();
      dispatch(crud.list({ entity }));
    }
    if (current) {
      let labels = deleteModalLabels.map((x) => valueByString(current, x)).join(' ');

      setDisplayItem(labels);
    }
  }, [isSuccess, current, deleteModalLabels, dispatch, entity, modal]);

  const handleOk = () => {
    if (!current || !('_id' in current)) return;
    const id = (current as any)._id;
    dispatch(crud.delete({ entity, id }));
    readBox.close();
    modal.close();
    panel.close();
    navMenu.collapse();
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
      {children || (
        <p>
          {deleteMessage}
          {displayItem}
        </p>
      )}
    </Modal>
  );
}
