import React, { useMemo, ReactNode } from 'react';
import { Col, Progress, Spin } from 'antd';
import useLanguage from '@/locale/useLanguage';
import { StatisticItem, PreviewCardProps } from '@/types';

const colours: Record<string, string> = {
  draft: '#595959',
  sent: '#1890ff',
  pending: '#1890ff',
  unpaid: '#ffa940',
  overdue: '#ff4d4f',
  partially: '#13c2c2',
  paid: '#95de64',
  declined: '#ff4d4f',
  accepted: '#95de64',
  cyan: '#13c2c2',
  purple: '#722ed1',
  expired: '#614700',
};

const defaultStatistics: StatisticItem[] = [
  {
    tag: 'draft',
    value: 0,
  },
  {
    tag: 'pending',
    value: 0,
  },
  {
    tag: 'sent',
    value: 0,
  },
  {
    tag: 'accepted',
    value: 0,
  },
  {
    tag: 'declined',
    value: 0,
  },
  {
    tag: 'expired',
    value: 0,
  },
];

const defaultInvoiceStatistics: StatisticItem[] = [
  {
    tag: 'draft',
    value: 0,
  },
  {
    tag: 'pending',
    value: 0,
  },
  {
    tag: 'overdue',
    value: 0,
  },
  {
    tag: 'paid',
    value: 0,
  },
  {
    tag: 'unpaid',
    value: 0,
  },
  {
    tag: 'partially',
    value: 0,
  },
];

interface PreviewStateProps {
  tag: string;
  value: number;
}

const PreviewState = ({ tag, value }: PreviewStateProps): JSX.Element => {
  const translate = useLanguage();
  return (
    <div style={{ color: '#595959', marginBottom: 5 }}>
      <div className="left alignLeft capitalize">{translate(tag)}</div>
      <div className="right alignRight">{value} %</div>
      <Progress
        percent={value}
        showInfo={false}
        strokeColor={{
          '0%': '#333',
          '100%': '#333',
        }}
      />
    </div>
  );
};

export default function PreviewCard({
  title = 'Preview',
  statistics = defaultStatistics,
  isLoading = false,
  entity = 'invoice',
}: PreviewCardProps): JSX.Element {
  const statisticsMap = useMemo(() => {
    if (entity === 'invoice') {
      return defaultInvoiceStatistics.map((defaultStat) => {
        const matchedStat = Array.isArray(statistics)
          ? statistics.find((stat) => stat.tag === defaultStat.tag)
          : null;
        return matchedStat || defaultStat;
      });
    } else {
      return defaultStatistics.map((defaultStat) => {
        const matchedStat = Array.isArray(statistics)
          ? statistics.find((stat) => stat.tag === defaultStat.tag)
          : null;
        return matchedStat || defaultStat;
      });
    }
  }, [statistics, entity]);

  const customSort = (a: ReactNode, b: ReactNode): number => {
    if (!React.isValidElement(a) || !React.isValidElement(b)) return 0;
    const colorOrder = Object.values(colours);
    const colorA = (a.props as { color?: string }).color;
    const colorB = (b.props as { color?: string }).color;
    const indexA = colorA ? colorOrder.indexOf(colorA) : -1;
    const indexB = colorB ? colorOrder.indexOf(colorB) : -1;
    return indexA - indexB;
  };
  return (
    <Col
      className="gutter-row"
      xs={{ span: 24 }}
      sm={{ span: 24 }}
      md={{ span: 12 }}
      lg={{ span: 12 }}
    >
      <div className="pad20">
        <h3
          style={{
            color: '#22075e',
            fontSize: 'large',
            marginBottom: 40,
            marginTop: 0,
          }}
        >
          {title}
        </h3>
        {isLoading ? (
          <div style={{ textAlign: 'center' }}>
            <Spin />
          </div>
        ) : (
          statisticsMap
            ?.map((status, index) => (
              <PreviewState key={index} tag={status.tag} value={status?.value || 0} />
            ))
            .sort(customSort)
        )}
      </div>
    </Col>
  );
}
