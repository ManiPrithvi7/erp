import mongoose from 'mongoose';
import Setting from '@/models/coreModels/Setting';
import { increaseBySettingKey } from '@/middlewares/settings';

describe('Settings Middleware', () => {
  beforeEach(async () => {
    if ((global as any).__MONGODB_AVAILABLE__) {
      await Setting.deleteMany({});
    }
  }, 5000);

  afterEach(async () => {
    if ((global as any).__MONGODB_AVAILABLE__) {
      await Setting.deleteMany({});
    }
  }, 5000);

  describe('increaseBySettingKey', () => {
    it('should return null if setting does not exist', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return; // Skip test if MongoDB is not available
      }
      const result = await increaseBySettingKey({ settingKey: 'non_existent' });
      expect(result).toBeNull();
    });

    it('should increment existing setting value', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      await Setting.create({
        settingCategory: 'test',
        settingKey: 'test_counter',
        settingValue: 5,
        valueType: 'Number',
      });

      const result = await increaseBySettingKey({ settingKey: 'test_counter' });
      expect(result).toBeDefined();
      expect(result?.settingValue).toBe(6);

      const setting = await Setting.findOne({ settingKey: 'test_counter' });
      expect(setting?.settingValue).toBe(6);
    }, 15000);

    it('should handle multiple increments correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      await Setting.create({
        settingCategory: 'invoice',
        settingKey: 'invoice_number',
        settingValue: 0,
        valueType: 'Number',
      });

      await increaseBySettingKey({ settingKey: 'invoice_number' });
      await increaseBySettingKey({ settingKey: 'invoice_number' });
      await increaseBySettingKey({ settingKey: 'invoice_number' });

      const setting = await Setting.findOne({ settingKey: 'invoice_number' });
      expect(setting?.settingValue).toBe(3);
    });

    it('should handle concurrent increments', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      await Setting.create({
        settingCategory: 'test',
        settingKey: 'concurrent_test',
        settingValue: 0,
        valueType: 'Number',
      });

      const promises = Array.from({ length: 10 }, () =>
        increaseBySettingKey({ settingKey: 'concurrent_test' })
      );

      await Promise.all(promises);

      const setting = await Setting.findOne({ settingKey: 'concurrent_test' });
      expect(setting?.settingValue).toBe(10);
    });

    it('should work with last_invoice_number setting key', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      await Setting.create({
        settingCategory: 'invoice',
        settingKey: 'last_invoice_number',
        settingValue: 0,
        valueType: 'Number',
      });

      await increaseBySettingKey({ settingKey: 'last_invoice_number' });

      const setting = await Setting.findOne({ settingKey: 'last_invoice_number' });
      expect(setting).toBeDefined();
      expect(setting?.settingValue).toBe(1);
    });

    it('should return null for empty settingKey', async () => {
      const result = await increaseBySettingKey({ settingKey: '' });
      expect(result).toBeNull();
    });
  });
});
