import mongoose from 'mongoose';
import Invoice, { IInvoice } from '@/models/appModels/Invoice';
import Client from '@/models/appModels/Client';
import Admin from '@/models/coreModels/Admin';

describe('Invoice Model', () => {
  let testAdmin: any;
  let testClient: any;

  beforeAll(async () => {
    // Skip if MongoDB is not available
    if (!(global as any).__MONGODB_AVAILABLE__) {
      return;
    }

    testAdmin = await Admin.create({
      email: 'test@admin.com',
      name: 'Test',
      surname: 'Admin',
      enabled: true,
    });

    testClient = await Client.create({
      name: 'Test Client',
      email: 'client@test.com',
      phone: '1234567890',
      createdBy: testAdmin._id,
    });
  }, 30000); // Increased timeout

  afterEach(async () => {
    if ((global as any).__MONGODB_AVAILABLE__) {
      await Invoice.deleteMany({});
    }
  }, 5000);

  afterAll(async () => {
    if ((global as any).__MONGODB_AVAILABLE__) {
      await Invoice.deleteMany({});
      await Client.deleteMany({});
      await Admin.deleteMany({});
    }
  }, 5000);

  describe('Invoice Creation', () => {
    it('should create an invoice with required fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return; // Skip test if MongoDB is not available
      }
      const invoiceData = {
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
        subTotal: 100,
        taxTotal: 0,
        total: 100,
      };

      const invoice = await Invoice.create(invoiceData);
      expect(invoice._id).toBeDefined();
      expect(invoice.number).toBe(1);
      expect(invoice.year).toBe(2024);
    });

    it('should set default values correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoiceData = {
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
      };

      const invoice = await Invoice.create(invoiceData);
      expect(invoice.removed).toBe(false);
      expect(invoice.taxRate).toBe(0);
      expect(invoice.subTotal).toBe(0);
      expect(invoice.taxTotal).toBe(0);
      expect(invoice.total).toBe(0);
      expect(invoice.credit).toBe(0);
      expect(invoice.discount).toBe(0);
      expect(invoice.paymentStatus).toBe('unpaid');
      expect(invoice.isOverdue).toBe(false);
      expect(invoice.approved).toBe(false);
      expect(invoice.status).toBe('draft');
    });

    it('should validate required fields', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoiceData = {
        // Missing required fields
        number: 1,
      };

      await expect(Invoice.create(invoiceData)).rejects.toThrow();
    });

    it('should validate enum values for status', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoiceData = {
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
        status: 'invalid_status',
      };

      await expect(Invoice.create(invoiceData)).rejects.toThrow();
    });

    it('should validate enum values for paymentStatus', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoiceData = {
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
        paymentStatus: 'invalid_status',
      };

      await expect(Invoice.create(invoiceData)).rejects.toThrow();
    });
  });

  describe('Invoice Relationships', () => {
    it('should reference client correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoice = await Invoice.create({
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
      });

      const populatedInvoice = await Invoice.findById(invoice._id).populate('client');
      expect(populatedInvoice?.client).toBeDefined();
      expect((populatedInvoice?.client as any).name).toBe('Test Client');
    });

    it('should reference createdBy admin correctly', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoice = await Invoice.create({
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Test Item',
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
      });

      expect(invoice.createdBy.toString()).toBe(testAdmin._id.toString());
    });
  });

  describe('Invoice Items', () => {
    it('should store multiple items', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoice = await Invoice.create({
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            itemName: 'Item 1',
            quantity: 2,
            price: 50,
            total: 100,
          },
          {
            itemName: 'Item 2',
            quantity: 3,
            price: 30,
            total: 90,
          },
        ],
        currency: 'USD',
      });

      expect(invoice.items).toHaveLength(2);
      expect(invoice.items[0].itemName).toBe('Item 1');
      expect(invoice.items[1].itemName).toBe('Item 2');
    });

    it('should require itemName in items', async () => {
      if (!(global as any).__MONGODB_AVAILABLE__) {
        return;
      }
      const invoiceData = {
        createdBy: testAdmin._id,
        number: 1,
        year: 2024,
        date: new Date(),
        expiredDate: new Date(),
        client: testClient._id,
        items: [
          {
            // Missing itemName
            quantity: 1,
            price: 100,
            total: 100,
          },
        ],
        currency: 'USD',
      };

      await expect(Invoice.create(invoiceData)).rejects.toThrow();
    });
  });
});

