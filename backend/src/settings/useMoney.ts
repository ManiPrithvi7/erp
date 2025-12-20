import currency from 'currency.js';

interface UseMoneySettings {
  currency_symbol?: string;
  currency_position?: 'before' | 'after';
  decimal_sep?: string;
  thousand_sep?: string;
  cent_precision?: number;
  zero_format?: boolean;
}

interface UseMoneyParams {
  settings: UseMoneySettings;
}

interface UseMoneyReturn {
  moneyFormatter: (params: { amount?: number }) => string;
  amountFormatter: (params: { amount?: number }) => string;
  currency_symbol?: string;
  currency_position?: string;
  decimal_sep?: string;
  thousand_sep?: string;
  cent_precision?: number;
  zero_format?: boolean;
}

const useMoney = ({ settings }: UseMoneyParams): UseMoneyReturn => {
  const {
    currency_symbol = '$',
    currency_position = 'before',
    decimal_sep = '.',
    thousand_sep = ',',
    cent_precision = 2,
    zero_format = false,
  } = settings;

  function currencyFormat(amount: number): string {
    return currency(amount as any).dollars() > 0 || !zero_format
      ? currency(amount as any, {
          separator: thousand_sep,
          decimal: decimal_sep,
          symbol: '',
          precision: cent_precision,
        } as any).format()
      : '0' +
          currency(amount as any, {
            separator: thousand_sep,
            decimal: decimal_sep,
            symbol: '',
            precision: cent_precision,
          } as any).format();
  }

  function moneyFormatter({ amount = 0 }: { amount?: number }): string {
    return currency_position === 'before'
      ? currency_symbol + ' ' + currencyFormat(amount)
      : currencyFormat(amount) + ' ' + currency_symbol;
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


