import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { useSelector } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { useErpContext } from '@/context/erp';
import { selectDeletedItem } from '@/redux/erp/selectors';
import { valueByString } from '@/utils/helpers';
import { useAppDispatch } from '@/redux/hooks';
import { DeleteItemProps, ErpDocument } from '@/types';

export default function Delete({ config, isOpen }: DeleteItemProps): JSX.Element {
  const {
    entity,
    deleteModalLabels = [],
    deleteMessage = 'Do you want delete : ',
    modalTitle = 'Remove Item',
  } = config;
  const dispatch = useAppDispatch();
  const { current, isLoading, isSuccess } = useSelector(selectDeletedItem);
  const { state, erpContextAction } = useErpContext();
  const { deleteModal } = state;
  const { modal } = erpContextAction;
  const [displayItem, setDisplayItem] = useState('');

  useEffect(() => {
    if (isSuccess) {
      modal.close();
      const options = { page: 1, items: 10 };
      dispatch(erp.list({ entity, options }));
    }
    if (current && deleteModalLabels.length > 0) {
      const labels = deleteModalLabels.map((x: string) => valueByString(current as Record<string, unknown>, x)).join(' ');
      setDisplayItem(labels);
    }
  }, [isSuccess, current, deleteModalLabels, dispatch, entity, modal]);

  const handleOk = (): void => {
    const erpCurrent = current as ErpDocument;
    const id = erpCurrent?._id;
    if (id) {
      dispatch(erp.delete({ entity, id }));
      modal.close();
    }
  };
  const handleCancel = (): void => {
    if (!isLoading) modal.close();
  };
  return (
    <Modal
      title={modalTitle}
      open={isOpen !== undefined ? isOpen : deleteModal.isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={isLoading}
    >
      <p>
        {deleteMessage}
        {displayItem}
      </p>
    </Modal>
  );
}
