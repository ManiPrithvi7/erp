import { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { dataForRead } from '@/utils/dataStructure';
import { useCrudContext } from '@/context/crud';
import { selectCurrentItem } from '@/redux/crud/selectors';
import { valueByString } from '@/utils/helpers';
import useLanguage from '@/locale/useLanguage';
import { useDate } from '@/settings';
import { TableColumn } from '@/types';

interface ReadItemProps {
  config: {
    readColumns?: TableColumn[];
    fields?: any;
    [key: string]: any;
  };
}

interface ListItem {
  propsKey: string;
  label: string;
  value: any;
}

export default function ReadItem({ config }: ReadItemProps): JSX.Element {
  const { dateFormat } = useDate();
  let { readColumns = [], fields } = config;
  const translate = useLanguage();
  const { result: currentResult } = useSelector(selectCurrentItem);
  const { state } = useCrudContext();
  const { isReadBoxOpen } = state;
  const [listState, setListState] = useState<ListItem[]>([]);

  if (fields) readColumns = [...dataForRead({ fields: fields, translate: translate })];
  useEffect(() => {
    const list: ListItem[] = [];
    readColumns.forEach((props) => {
      const propsKey = props.dataIndex;
      const propsTitle = props.title || '';
      const isDate = props.isDate || false;
      const dataIndexStr = Array.isArray(propsKey) ? propsKey.join('.') : (propsKey || '');
      let value = valueByString(currentResult, dataIndexStr);
      value = isDate ? dayjs(value).format(dateFormat) : value;
      list.push({ propsKey: dataIndexStr, label: propsTitle, value: value || '' });
    });
    setListState(list);
  }, [currentResult, readColumns, dateFormat]);

  const show = isReadBoxOpen ? { display: 'block', opacity: 1 } : { display: 'none', opacity: 0 };

  const itemsList = listState.map((item) => {
    return (
      <Row key={item.propsKey} gutter={12}>
        <Col className="gutter-row" span={8}>
          <p>{item.label}</p>
        </Col>
        <Col className="gutter-row" span={2}>
          <p> : </p>
        </Col>
        <Col className="gutter-row" span={14}>
          <p>{item.value}</p>
        </Col>
      </Row>
    );
  });

  return <div style={show}>{itemsList}</div>;
}
