import dayjs from 'dayjs';
import { Switch, Tag } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { countryList } from '@/utils/countryList';
import { generate as uniqueId } from 'shortid';
import color from '@/utils/color';
import { TableColumn } from '@/types';

interface Field {
  label?: string;
  dataIndex?: string[];
  type?: string;
  color?: string;
  disableForTable?: boolean;
  renderAsTag?: boolean;
  options?: Array<{ value: any; color?: string }>;
  colors?: Record<string, string>;
}

interface Fields {
  [key: string]: Field;
}

export const dataForRead = ({ fields }: { fields: Fields; translate?: (key: string) => string }): TableColumn[] => {
  let columns: TableColumn[] = [];

  Object.keys(fields).forEach((key) => {
    let field = fields[key];
    if (!field) return;
    columns.push({
      title: field.label ? field.label : key,
      dataIndex: field.dataIndex ? field.dataIndex.join('.') : key,
      key: field.dataIndex ? field.dataIndex.join('.') : key,
      isDate: field.type === 'date',
    });
  });

  return columns;
};

export function dataForTable({
  fields,
  translate,
  moneyFormatter,
  dateFormat,
}: {
  fields: Fields;
  translate: (key: string) => string;
  moneyFormatter: (options: { amount: number; currency_code?: string }) => string;
  dateFormat: string;
}): TableColumn[] {
  let columns: TableColumn[] = [];

  Object.keys(fields).forEach((key) => {
    let field = fields[key];
    if (!field) return;
    const keyIndex = field.dataIndex ? field.dataIndex : [key];

    const component: Record<string, TableColumn> = {
      boolean: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        onCell: () => ({
          props: {
            style: {
              width: '60px',
            },
          },
        }),
        render: (_: any, record: any) => (
          <Switch
            checked={record[key]}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
          />
        ),
      },
      date: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          const date = dayjs(record[key]).format(dateFormat);
          return (
            <Tag bordered={false} color={field.color}>
              {date}
            </Tag>
          );
        },
      },
      currency: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        onCell: () => {
          return {
            style: {
              textAlign: 'right',
              whiteSpace: 'nowrap',
            },
          };
        },
        render: (_: any, record: any) =>
          moneyFormatter({ amount: record[key], currency_code: record.currency }),
      },
      async: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (text: any, record: any) => {
          return (
            <Tag bordered={false} color={field?.color || record[key]?.color || record.color}>
              {text}
            </Tag>
          );
        },
      },
      color: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (text: any) => {
          return (
            <Tag bordered={false} color={text}>
              {color.find((x) => x.value === text)?.label}
            </Tag>
          );
        },
      },
      stringWithColor: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (text: any, record: any) => {
          return (
            <Tag bordered={false} color={record.color || field?.color}>
              {text}
            </Tag>
          );
        },
      },
      tag: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          return (
            <Tag bordered={false} color={field?.color}>
              {record[key] && record[key]}
            </Tag>
          );
        },
      },
      selectWithFeedback: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_text: any, record: any) => {
          if (field?.renderAsTag) {
            const selectedOption = field.options?.find((x) => x.value === record[key]);

            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {record[key] && translate(record[key])}
              </Tag>
            );
          } else return record[key] && translate(record[key]);
        },
      },
      select: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          if (field?.renderAsTag) {
            const selectedOption = field.options?.find((x) => x.value === record[key]);

            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {record[key] && record[key]}
              </Tag>
            );
          } else return record[key] && record[key];
        },
      },
      selectWithTranslation: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          if (field?.renderAsTag) {
            const selectedOption = field.options?.find((x) => x.value === record[key]);

            return (
              <Tag bordered={false} color={selectedOption?.color}>
                {record[key] && translate(record[key])}
              </Tag>
            );
          } else return record[key] && translate(record[key]);
        },
      },
      array: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          return (record[key] || []).map((x: any) => (
            <Tag bordered={false} key={`${uniqueId()}`} color={field?.colors?.[x]}>
              {x}
            </Tag>
          ));
        },
      },
      country: {
        title: field.label ? translate(field.label) : translate(key),
        dataIndex: keyIndex.join('.'),
        key: key,
        render: (_: any, record: any) => {
          const selectedCountry = countryList.find((obj) => obj.value === record[key]);

          return (
            <Tag bordered={false} color={field?.color || undefined}>
              {selectedCountry?.icon && selectedCountry?.icon + ' '}
              {selectedCountry?.label && translate(selectedCountry.label)}
            </Tag>
          );
        },
      },
    };

    const defaultComponent: TableColumn = {
      title: field.label ? translate(field.label) : translate(key),
      dataIndex: keyIndex.join('.'),
      key: key,
    };

    const type = field.type || '';

    if (!field.disableForTable) {
      const componentColumn = component[type];
      if (componentColumn) {
        columns.push(componentColumn);
      } else {
        columns.push(defaultComponent);
      }
    }
  });

  return columns;
}

// Unused function - kept for potential future use
// function getRandomColor(): string {
//   const colors = [
//     'magenta',
//     'red',
//     'volcano',
//     'orange',
//     'gold',
//     'lime',
//     'green',
//     'cyan',
//     'blue',
//     'geekblue',
//     'purple',
//   ];
//
//   // Generate a random index between 0 and the length of the colors array
//   const randomIndex = Math.floor(Math.random() * colors.length);
//
//   // Return the color at the randomly generated index
//   return colors[randomIndex] || 'blue';
// }

