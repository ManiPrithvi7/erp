import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';
import { ItemRowProps, InvoiceItem, ErpDocument } from '@/types';

export default function ItemRow({ field, remove, current = null }: ItemRowProps): JSX.Element {
  const [totalState, setTotal] = useState<number | undefined>(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const money = useMoney();
  const updateQt = (value: number | null): void => {
    setQuantity(value || 0);
  };
  const updatePrice = (value: number | null): void => {
    setPrice(value || 0);
  };

  useEffect(() => {
    if (current) {
      const currentDoc = current as ErpDocument;
      const { items, invoice } = currentDoc;

      if (invoice && typeof invoice === 'object' && 'items' in invoice) {
        const invoiceItems = invoice.items as InvoiceItem[] | undefined;
        if (invoiceItems && Array.isArray(invoiceItems) && field.fieldKey !== undefined) {
          const itemIndex = parseInt(field.fieldKey);
          const item = invoiceItems[itemIndex];
          if (item) {
            setQuantity(item.quantity || 0);
            setPrice(item.price || 0);
          }
        }
      } else if (items && Array.isArray(items) && field.fieldKey !== undefined) {
        const itemIndex = parseInt(field.fieldKey);
        const item = items[itemIndex];
        if (item) {
          setQuantity(item.quantity || 0);
          setPrice(item.price || 0);
        }
      }
    }
  }, [current, field.fieldKey]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
  }, [price, quantity]);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Missing itemName name',
            },
            {
              pattern: /^(?!\s*$)[\s\S]+$/,
              message: 'Item Name must contain alphanumeric or special characters',
            },
          ]}
        >
          <Input placeholder="Item Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={7}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="description Name" />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={3}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>
      <Col className="gutter-row" span={5}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) =>
                money.amountFormatter({ amount: value || 0, currency_code: money.currency_code })
              }
            />
          </Form.Item>
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
