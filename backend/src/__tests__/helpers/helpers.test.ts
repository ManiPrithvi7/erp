import { calculate, timeRange } from '@/helpers';

describe('Helpers - Calculate Functions', () => {
  describe('calculate.add', () => {
    it('should add two numbers correctly', () => {
      expect(calculate.add(10, 5)).toBe(15);
      expect(calculate.add(0.1, 0.2)).toBeCloseTo(0.3, 5);
    });

    it('should handle string numbers', () => {
      expect(calculate.add('10', '5')).toBe(15);
      expect(calculate.add('10.5', '5.5')).toBe(16);
    });

    it('should handle decimal precision correctly', () => {
      const result = calculate.add(0.1, 0.2);
      expect(result).toBeCloseTo(0.3, 10);
    });

    it('should handle large numbers', () => {
      expect(calculate.add(1000000, 500000)).toBe(1500000);
    });

    it('should handle negative numbers', () => {
      expect(calculate.add(-10, 5)).toBe(-5);
      expect(calculate.add(10, -5)).toBe(5);
    });
  });

  describe('calculate.sub', () => {
    it('should subtract two numbers correctly', () => {
      expect(calculate.sub(10, 5)).toBe(5);
      expect(calculate.sub(10, 3)).toBe(7);
    });

    it('should handle string numbers', () => {
      expect(calculate.sub('10', '5')).toBe(5);
    });

    it('should handle decimal precision correctly', () => {
      const result = calculate.sub(0.3, 0.1);
      expect(result).toBeCloseTo(0.2, 10);
    });

    it('should handle negative results', () => {
      expect(calculate.sub(5, 10)).toBe(-5);
    });
  });

  describe('calculate.multiply', () => {
    it('should multiply two numbers correctly', () => {
      expect(calculate.multiply(10, 5)).toBe(50);
      expect(calculate.multiply(2, 3)).toBe(6);
    });

    it('should handle string numbers', () => {
      expect(calculate.multiply('10', '5')).toBe(50);
    });

    it('should handle decimal multiplication', () => {
      const result = calculate.multiply(0.1, 0.2);
      expect(result).toBeCloseTo(0.02, 10);
    });

    it('should handle zero multiplication', () => {
      expect(calculate.multiply(10, 0)).toBe(0);
      expect(calculate.multiply(0, 10)).toBe(0);
    });

    it('should handle percentage calculation (for tax)', () => {
      const subTotal = 1000;
      const taxRate = 10;
      const taxTotal = calculate.multiply(subTotal, taxRate / 100);
      expect(taxTotal).toBe(100);
    });
  });

  describe('calculate.divide', () => {
    it('should divide two numbers correctly', () => {
      expect(calculate.divide(10, 5)).toBe(2);
      expect(calculate.divide(15, 3)).toBe(5);
    });

    it('should handle string numbers', () => {
      expect(calculate.divide('10', '5')).toBe(2);
    });

    it('should handle decimal division', () => {
      const result = calculate.divide(1, 3);
      // currency.js may round to 2 decimal places by default
      expect(result).toBeCloseTo(0.33, 2);
    });

    it('should handle division by zero gracefully', () => {
      // currency.js handles division by zero - returns Infinity or NaN
      const result = calculate.divide(10, 0);
      expect(typeof result).toBe('number');
    });
  });

  describe('Financial Calculations Integration', () => {
    it('should calculate invoice totals correctly', () => {
      // Simulate invoice calculation
      const items = [
        { quantity: 2, price: 100 },
        { quantity: 3, price: 50 },
      ];

      let subTotal = 0;
      items.forEach((item) => {
        const itemTotal = calculate.multiply(item.quantity, item.price);
        subTotal = calculate.add(subTotal, itemTotal);
      });

      expect(subTotal).toBe(350); // (2 * 100) + (3 * 50) = 200 + 150 = 350

      const taxRate = 10;
      const taxTotal = calculate.multiply(subTotal, taxRate / 100);
      expect(taxTotal).toBe(35);

      const total = calculate.add(subTotal, taxTotal);
      expect(total).toBe(385);
    });

    it('should handle discount calculation correctly', () => {
      const total = 1000;
      const discount = 100;
      const finalTotal = calculate.sub(total, discount);
      expect(finalTotal).toBe(900);
    });

    it('should maintain precision in complex calculations', () => {
      // Test for floating point precision issues
      const price1 = 19.99;
      const price2 = 29.99;
      const price3 = 39.99;

      const sum = calculate.add(calculate.add(price1, price2), price3);
      expect(sum).toBeCloseTo(89.97, 2);
    });
  });
});

describe('Helpers - timeRange Function', () => {
  it('should generate time range correctly', () => {
    const start = '2024-01-01 09:00';
    const end = '2024-01-01 12:00';
    const range = timeRange(start, end, 'HH:mm', 60);

    expect(range).toHaveLength(3);
    expect(range[0]).toBe('09:00');
    expect(range[1]).toBe('10:00');
    expect(range[2]).toBe('11:00');
  });

  it('should handle custom intervals', () => {
    const start = '2024-01-01 09:00';
    const end = '2024-01-01 11:00';
    const range = timeRange(start, end, 'HH:mm', 30);

    expect(range).toHaveLength(4);
    expect(range).toEqual(['09:00', '09:30', '10:00', '10:30']);
  });

  it('should handle Date objects', () => {
    const start = new Date('2024-01-01T09:00:00');
    const end = new Date('2024-01-01T12:00:00');
    const range = timeRange(start, end, 'HH:mm', 60);

    expect(range.length).toBeGreaterThan(0);
    expect(range[0]).toBe('09:00');
  });

  it('should default format to HH:mm', () => {
    // Use full date format for moment to parse correctly
    const start = '2024-01-01 09:00';
    const end = '2024-01-01 10:00';
    const range = timeRange(start, end);

    expect(range.length).toBeGreaterThan(0);
    expect(range[0]).toMatch(/^\d{2}:\d{2}$/);
  });
});

