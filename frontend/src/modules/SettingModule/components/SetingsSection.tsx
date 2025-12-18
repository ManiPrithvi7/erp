import { Col, Divider, Row, Typography } from 'antd';
import { ReactNode } from 'react';

const { Title, Text } = Typography;

interface SetingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function SetingsSection({ title, description, children }: SetingsSectionProps): JSX.Element {
  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <Title level={4}>{title}</Title>
        <Text type="secondary">{description}</Text>
      </Col>

      <Col
        xl={{ span: 18, offset: 2 }}
        lg={{ span: 24 }}
        md={{ span: 24 }}
        sm={{ span: 24 }}
        xs={{ span: 24 }}
      >
        {children}
      </Col>
      <Divider />
    </Row>
  );
}
