import { Alert, Button } from 'antd';
import { InfoCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';

interface EmptyStateWithGuidanceProps {
  title: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
  type?: 'info' | 'warning' | 'error';
}

/**
 * Component to display empty state with user guidance
 * Shows an alert with information and a button to create missing data
 */
export default function EmptyStateWithGuidance({
  title,
  message,
  actionLabel,
  actionUrl,
  type = 'info',
}: EmptyStateWithGuidanceProps): JSX.Element {
  const translate = useLanguage();
  const navigate = useNavigate();

  return (
    <Alert
      message={title}
      description={
        <div>
          <p style={{ marginBottom: '12px' }}>{message}</p>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate(actionUrl)}
            size="small"
          >
            {actionLabel}
          </Button>
        </div>
      }
      type={type}
      icon={<InfoCircleOutlined />}
      showIcon
      style={{ marginBottom: '16px' }}
    />
  );
}


