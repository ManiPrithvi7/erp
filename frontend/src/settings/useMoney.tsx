import currency from 'currency.js';
import { useSelector } from 'react-redux';
import storePersist from '@/redux/storePersist';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import { ReactNode } from 'react';

interface MoneyFormatSettings {
  currency_code?: string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  decimal_sep?: string;
  thousand_sep?: string;
  cent_precision?: number;
  zero_format?: boolean;
}

interface MoneyFormatterOptions {
  amount?: number;
  currency_code?: string;
}

interface MoneyRowFormatterResult {
  props: {
    style: {
      textAlign: 'right';
      whiteSpace: 'nowrap';
      direction: 'ltr';
    };
  };
  children: ReactNode;
}

const useMoney = () => {
  const money_format_settings = useSelector(selectMoneyFormat);

  const money_format_state: MoneyFormatSettings | null = money_format_settings
    ? money_format_settings
    : storePersist.get('settings')?.money_format_settings || null;

  function currencyFormat({ amount, currency_code: _currency_code = money_format_state?.currency_code }: MoneyFormatterOptions): string {
    return currency(amount || 0).dollars() > 0 || !money_format_state?.zero_format
      ? currency(amount || 0, {
          separator: money_format_state?.thousand_sep || ',',
          decimal: money_format_state?.decimal_sep || '.',
          symbol: '',
          precision: money_format_state?.cent_precision || 2,
        }).format()
      : '0' +
          currency(amount || 0, {
            separator: money_format_state?.thousand_sep || ',',
            decimal: money_format_state?.decimal_sep || '.',
            symbol: '',
            precision: money_format_state?.cent_precision || 2,
          }).format();
  }

  function moneyFormatter({ amount = 0, currency_code = money_format_state?.currency_code }: MoneyFormatterOptions): string {
    return money_format_state?.currency_position === 'before'
      ? (money_format_state?.currency_symbol || '') + ' ' + currencyFormat({ amount, currency_code })
      : currencyFormat({ amount, currency_code }) + ' ' + (money_format_state?.currency_symbol || '');
  }

  function amountFormatter({ amount = 0, currency_code = money_format_state?.currency_code }: MoneyFormatterOptions): string {
    return currencyFormat({ amount: amount, currency_code });
  }

  function moneyRowFormatter({ amount = 0, currency_code = money_format_state?.currency_code }: MoneyFormatterOptions): MoneyRowFormatterResult {
    return {
      props: {
        style: {
          textAlign: 'right',
          whiteSpace: 'nowrap',
          direction: 'ltr',
        },
      },
      children: (
        <>
          {money_format_state?.currency_position === 'before'
            ? (money_format_state?.currency_symbol || '') + ' ' + currencyFormat({ amount, currency_code })
            : currencyFormat({ amount, currency_code }) + ' ' + (money_format_state?.currency_symbol || '')}
        </>
      ),
    };
  }

  return {
    moneyRowFormatter,
    moneyFormatter,
    amountFormatter,
    currency_symbol: money_format_state?.currency_symbol,
    currency_code: money_format_state?.currency_code,
    currency_position: money_format_state?.currency_position,
    decimal_sep: money_format_state?.decimal_sep,
    thousand_sep: money_format_state?.thousand_sep,
    cent_precision: money_format_state?.cent_precision,
    zero_format: money_format_state?.zero_format,
  };
};

export default useMoney;

