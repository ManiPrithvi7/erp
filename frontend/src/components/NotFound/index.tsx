import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import useLanguage from '@/locale/useLanguage';

interface NotFoundProps {
  entity?: string;
}

export default function NotFound({ entity: _entity = '' }: NotFoundProps): JSX.Element {
  const translate = useLanguage();

  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title={translate('error_404')}
      subTitle={translate('Sorry the Page you requested does not exist')}
      extra={
        <Button
          type="primary"
          onClick={() => {
            navigate('/');
          }}
        >
          {translate('Back')}
        </Button>
      }
    />
  );
}
