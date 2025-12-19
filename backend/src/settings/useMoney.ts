import currency from 'currency.js';

interface Settings {
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  decimal_sep?: string;
  thousand_sep?: string;
  cent_precision?: number;
  zero_format?: boolean;
}

interface UseMoneyResult {
  moneyFormatter: (params: { amount?: number }) => string;
  amountFormatter: (params: { amount?: number }) => string;
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  decimal_sep?: string;
  thousand_sep?: string;
  cent_precision?: number;
  zero_format?: boolean;
}

export const useMoney = ({ settings }: { settings: Settings }): UseMoneyResult => {
  const {
    currency_symbol,
    currency_position,
    decimal_sep,
    thousand_sep,
    cent_precision,
    zero_format,
  } = settings;

  function currencyFormat(amount: number | string): string {
    return currency(amount).dollars() > 0 || !zero_format
      ? currency(amount, {
          separator: thousand_sep || ',',
          decimal: decimal_sep || '.',
          symbol: '',
          precision: cent_precision || 2,
        }).format()
      : '0' +
          currency(amount, {
            separator: thousand_sep || ',',
            decimal: decimal_sep || '.',
            symbol: '',
            precision: cent_precision || 2,
          }).format();
  }

  function moneyFormatter({ amount = 0 }: { amount?: number }): string {
    return currency_position === 'before'
      ? (currency_symbol || '') + ' ' + currencyFormat(amount)
      : currencyFormat(amount) + ' ' + (currency_symbol || '');
  }

  function amountFormatter({ amount = 0 }: { amount?: number }): string {
    return currencyFormat(amount);
  }

  return {
    moneyFormatter,
    amountFormatter,
    currency_symbol,
    currency_position,
    decimal_sep,
    thousand_sep,
    cent_precision,
    zero_format,
  };
};

export default useMoney;

