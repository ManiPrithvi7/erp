import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';

interface StatusTagProps {
  status?: string;
}

export function StatusTag({ status = 'draft' }: StatusTagProps): JSX.Element {
  const translate = useLanguage();
  let color = () => {
    return status === 'draft'
      ? 'cyan'
      : status === 'sent'
      ? 'blue'
      : status === 'accepted'
      ? 'green'
      : status === 'expired'
      ? 'orange'
      : 'red';
  };

  return <Tag color={color()}>{translate(status)}</Tag>;
}
