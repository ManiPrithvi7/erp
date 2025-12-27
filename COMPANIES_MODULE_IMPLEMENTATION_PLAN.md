# Companies Module Implementation Plan
## IDURAR ERP CRM - Comprehensive Implementation Guide

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Implementation Strategy](#implementation-strategy)
4. [Backend Implementation](#backend-implementation)
5. [Frontend Implementation](#frontend-implementation)
6. [Database Schema Changes](#database-schema-changes)
7. [API Endpoints](#api-endpoints)
8. [Testing Strategy](#testing-strategy)
9. [Migration Strategy](#migration-strategy)
10. [Timeline & Phases](#timeline--phases)

---

## 🎯 Executive Summary

This document outlines the complete implementation plan for adding a **Companies Module** to the IDURAR ERP CRM system. The Companies module will:

- **Manage company/organization records** (similar to Client but for businesses)
- **Establish relationships** with Invoices, Payments, and Quotes
- **Follow existing codebase patterns** for consistency
- **Maintain backward compatibility** with existing Client-based records

### Key Requirements:
- ✅ Companies can be associated with Invoices, Payments, and Quotes
- ✅ Companies have contact information (name, email, phone, address, country, website)
- ✅ Companies can have multiple contacts (via Contact field)
- ✅ Full CRUD operations for Companies
- ✅ Search and filter capabilities
- ✅ Integration with existing Invoice, Payment, Quote forms

---

## 🔍 Current System Analysis

### Existing Patterns Identified:

#### **Backend Patterns:**
1. **Models**: Located in `backend/src/models/appModels/`
   - Use Mongoose schemas with `autopopulate` plugin
   - Follow naming: `Entity.js` and `Entity.ts` (TypeScript)
   - Include standard fields: `removed`, `createdBy`, `created`, `updated`

2. **Controllers**: Located in `backend/src/controllers/appControllers/`
   - Use `createCRUDController` factory for standard CRUD
   - Custom controllers extend base functionality
   - Follow naming: `entityController/index.js`

3. **Routes**: Auto-generated from models via `backend/src/models/utils/`
   - Routes automatically registered: `/api/{entity}/create`, `/read/:id`, `/update/:id`, `/delete/:id`, `/list`, `/listAll`, `/search`, `/filter`, `/summary`

#### **Frontend Patterns:**
1. **Pages**: Located in `frontend/src/pages/{Entity}/`
   - Main list page: `index.tsx`
   - CRUD pages: `{Entity}Create.tsx`, `{Entity}Read.tsx`, `{Entity}Update.tsx`

2. **Modules**: Located in `frontend/src/modules/{Entity}Module/`
   - `{Entity}DataTableModule/` - List view
   - `Create{Entity}Module/` - Create form
   - `Read{Entity}Module/` - Read view
   - `Update{Entity}Module/` - Update form
   - `Forms/{Entity}Form.tsx` - Form component

3. **Redux**: Uses `crud` reducer for simple entities, `erp` reducer for complex entities

#### **Current Relationships:**
- **Invoice** → `client: ObjectId (ref: 'Client')`
- **Payment** → `client: ObjectId (ref: 'Client')`, `invoice: ObjectId (ref: 'Invoice')`
- **Quote** → `client: ObjectId (ref: 'Client')`

---

## 🏗️ Implementation Strategy

### Approach:
1. **Phase 1**: Create Company model and backend infrastructure
2. **Phase 2**: Add `company` field to Invoice, Payment, Quote models (optional field for backward compatibility)
3. **Phase 3**: Create Company frontend module
4. **Phase 4**: Update Invoice, Payment, Quote forms to support company selection
5. **Phase 5**: Testing and migration

### Design Decisions:
- **Company vs Client**: Companies are organizations/businesses, Clients are individuals/contacts
- **Optional Relationship**: `company` field is optional to maintain backward compatibility
- **Contact Field**: Companies can have a `contact` field (ObjectId ref to Client) for primary contact person
- **Dual Support**: Forms will support both `client` (individual) and `company` (organization) selection

---

## 🔧 Backend Implementation

### 1. Company Model

**File**: `backend/src/models/appModels/Company.js` and `Company.ts`

```javascript
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  removed: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  contact: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    autopopulate: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  zipCode: {
    type: String,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  assigned: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
});

companySchema.plugin(require('mongoose-autopopulate'));
module.exports = mongoose.model('Company', companySchema);
```

**TypeScript Interface** (`Company.ts`):
```typescript
import mongoose, { Schema, Document } from 'mongoose';
import mongooseAutopopulate from 'mongoose-autopopulate';

export interface ICompany extends Document {
  removed?: boolean;
  enabled?: boolean;
  name: string;
  contact?: Schema.Types.ObjectId;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  taxId?: string;
  notes?: string;
  createdBy?: Schema.Types.ObjectId;
  assigned?: Schema.Types.ObjectId;
  created: Date;
  updated: Date;
}

const schema = new Schema<ICompany>({
  // ... (same as JS version)
});

schema.plugin(mongooseAutopopulate);
export default mongoose.model<ICompany>('Company', schema);
```

### 2. Company Controller

**File**: `backend/src/controllers/appControllers/companyController/index.js`

```javascript
const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const summary = require('./summary');

function modelController() {
  const Model = mongoose.model('Company');
  const methods = createCRUDController('Company');

  methods.summary = (req, res) => summary(Model, req, res);
  return methods;
}

module.exports = modelController();
```

**File**: `backend/src/controllers/appControllers/companyController/summary.js`
- Follow pattern from `clientController/summary.js`

### 3. Update Invoice Model

**File**: `backend/src/models/appModels/Invoice.js` and `Invoice.ts`

Add after `client` field:
```javascript
company: {
  type: mongoose.Schema.ObjectId,
  ref: 'Company',
  autopopulate: true,
},
```

### 4. Update Payment Model

**File**: `backend/src/models/appModels/Payment.js` and `Payment.ts`

Add after `client` field:
```javascript
company: {
  type: mongoose.Schema.ObjectId,
  ref: 'Company',
  autopopulate: true,
},
```

### 5. Update Quote Model

**File**: `backend/src/models/appModels/Quote.js` and `Quote.ts`

Add after `client` field:
```javascript
company: {
  type: mongoose.Schema.ObjectId,
  ref: 'Company',
  autopopulate: true,
},
```

### 6. Update Invoice Controller (Optional Enhancement)

**File**: `backend/src/controllers/appControllers/invoiceController/create.js`

Add validation to ensure either `client` OR `company` is provided (not both required, but at least one).

---

## 🎨 Frontend Implementation

### 1. Company Page Configuration

**File**: `frontend/src/pages/Company/config.js`

```javascript
export const fields = {
  name: {
    type: 'string',
    required: true,
  },
  contact: {
    type: 'asyncSelect',
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
  },
  email: {
    type: 'email',
  },
  phone: {
    type: 'phone',
  },
  website: {
    type: 'string',
  },
  country: {
    type: 'country',
  },
  address: {
    type: 'string',
  },
  city: {
    type: 'string',
  },
  state: {
    type: 'string',
  },
  zipCode: {
    type: 'string',
  },
  taxId: {
    type: 'string',
  },
  notes: {
    type: 'textarea',
  },
};
```

### 2. Company Pages

**File**: `frontend/src/pages/Company/index.tsx`

```typescript
import CrudModule from '@/modules/CrudModule/CrudModule';
import DynamicForm from '@/forms/DynamicForm';
import { fields } from './config';
import useLanguage from '@/locale/useLanguage';

export default function Company(): JSX.Element {
  const translate = useLanguage();
  const entity = 'company';
  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };
  const deleteModalLabels = ['name'];

  const Labels = {
    PANEL_TITLE: translate('company'),
    DATATABLE_TITLE: translate('company_list'),
    ADD_NEW_ENTITY: translate('add_new_company'),
    ENTITY_NAME: translate('company'),
  };
  const configPage = {
    entity,
    ...Labels,
  };
  const config = {
    ...configPage,
    fields,
    searchConfig,
    deleteModalLabels,
  };
  return (
    <CrudModule
      createForm={<DynamicForm fields={fields} />}
      updateForm={<DynamicForm fields={fields} isUpdateForm={true} />}
      config={config}
    />
  );
}
```

### 3. Update Routes

**File**: `frontend/src/router/routes.tsx`

Add:
```typescript
const Company = lazy(() => import('@/pages/Company'));

// In routes.default array:
{
  path: '/company',
  element: <Company />,
},
```

### 4. Update Invoice Form

**File**: `frontend/src/modules/InvoiceModule/Forms/InvoiceForm.tsx`

Add Company selection field (make client optional if company is selected):
```typescript
<Col className="gutter-row" span={8}>
  <Form.Item
    name="company"
    label={translate('Company')}
    rules={[
      {
        required: false,
      },
    ]}
  >
    <AutoCompleteAsync
      entity={'company'}
      displayLabels={['name']}
      searchFields={'name'}
      redirectLabel={'Add New Company'}
      withRedirect
      urlToRedirect={'/company'}
    />
  </Form.Item>
</Col>
```

Add validation logic to ensure either `client` OR `company` is provided.

### 5. Update Quote Form

**File**: `frontend/src/modules/QuoteModule/Forms/QuoteForm.tsx`

Same changes as Invoice Form - add Company selection field.

### 6. Update Payment Forms

**Files**: 
- `frontend/src/modules/InvoiceModule/RecordPaymentModule/components/Payment.tsx`
- `frontend/src/modules/PaymentModule/UpdatePaymentModule/components/Payment.tsx`

Add Company selection field (in addition to existing Client field).

### 7. Update Data Tables

**Files**:
- `frontend/src/pages/Invoice/index.tsx`
- `frontend/src/pages/Quote/index.tsx`
- `frontend/src/pages/Payment/index.tsx`

Add Company column to data tables:
```typescript
{
  title: translate('Company'),
  dataIndex: ['company', 'name'],
  key: 'company',
  render: (value: unknown, record: Record<string, unknown>) => {
    return record.company?.name || record.client?.name || '-';
  },
},
```

---

## 🗄️ Database Schema Changes

### New Collection:
- **Company**: New collection with fields as defined in model

### Modified Collections:
- **Invoice**: Add optional `company` field
- **Payment**: Add optional `company` field
- **Quote**: Add optional `company` field

### Migration Notes:
- All existing records will have `company: null` (optional field)
- No data loss or breaking changes
- Backward compatible with existing Client-based records

---

## 🌐 API Endpoints

### Auto-Generated Endpoints (via `createCRUDController`):

- `POST /api/company/create` - Create new company
- `GET /api/company/read/:id` - Get company by ID
- `PATCH /api/company/update/:id` - Update company
- `DELETE /api/company/delete/:id` - Delete company (soft delete)
- `GET /api/company/list` - Paginated list
- `GET /api/company/listAll` - Get all companies
- `GET /api/company/search` - Search companies
- `GET /api/company/filter` - Filter companies
- `GET /api/company/summary` - Get company summary

### Custom Endpoints (if needed):
- None required initially (standard CRUD sufficient)

---

## ✅ Testing Strategy

### Backend Testing:
1. **Unit Tests**:
   - Company model validation
   - Company controller CRUD operations
   - Invoice/Payment/Quote with company relationship

2. **Integration Tests**:
   - Create invoice with company
   - Create payment with company
   - Create quote with company
   - Search and filter companies

### Frontend Testing:
1. **Component Tests**:
   - Company form validation
   - Company list rendering
   - Invoice/Quote/Payment forms with company selection

2. **E2E Tests**:
   - Create company → Create invoice with company → View invoice
   - Search companies
   - Update company information

---

## 🔄 Migration Strategy

### Phase 1: Backend (Non-Breaking)
1. Create Company model
2. Create Company controller
3. Add `company` field to Invoice, Payment, Quote models (optional)
4. Test backend endpoints

### Phase 2: Frontend (Non-Breaking)
1. Create Company pages and modules
2. Add Company routes
3. Test Company CRUD operations

### Phase 3: Integration (Non-Breaking)
1. Update Invoice form to support company
2. Update Quote form to support company
3. Update Payment forms to support company
4. Update data tables to show company

### Phase 4: Enhancement (Optional)
1. Add validation: require either client OR company
2. Add company summary/statistics
3. Add company-based reporting

---

## 📅 Timeline & Phases

### **Phase 1: Backend Foundation** (2-3 days)
- ✅ Create Company model (JS + TS)
- ✅ Create Company controller
- ✅ Add company field to Invoice, Payment, Quote models
- ✅ Test backend endpoints

### **Phase 2: Frontend Basic CRUD** (2-3 days)
- ✅ Create Company page configuration
- ✅ Create Company pages (index.tsx)
- ✅ Add Company routes
- ✅ Test Company CRUD operations

### **Phase 3: Integration** (3-4 days)
- ✅ Update Invoice form
- ✅ Update Quote form
- ✅ Update Payment forms
- ✅ Update data tables
- ✅ Test end-to-end workflows

### **Phase 4: Polish & Testing** (1-2 days)
- ✅ Add validation and error handling
- ✅ Update translations
- ✅ Comprehensive testing
- ✅ Documentation

**Total Estimated Time**: 8-12 days

---

## 📝 Implementation Checklist

### Backend:
- [ ] Create `backend/src/models/appModels/Company.js`
- [ ] Create `backend/src/models/appModels/Company.ts`
- [ ] Create `backend/src/controllers/appControllers/companyController/index.js`
- [ ] Create `backend/src/controllers/appControllers/companyController/summary.js`
- [ ] Update `backend/src/models/appModels/Invoice.js` (add company field)
- [ ] Update `backend/src/models/appModels/Invoice.ts` (add company field)
- [ ] Update `backend/src/models/appModels/Payment.js` (add company field)
- [ ] Update `backend/src/models/appModels/Payment.ts` (add company field)
- [ ] Update `backend/src/models/appModels/Quote.js` (add company field)
- [ ] Update `backend/src/models/appModels/Quote.ts` (add company field)

### Frontend:
- [ ] Create `frontend/src/pages/Company/config.js`
- [ ] Create `frontend/src/pages/Company/index.tsx`
- [ ] Update `frontend/src/router/routes.tsx` (add Company route)
- [ ] Update `frontend/src/modules/InvoiceModule/Forms/InvoiceForm.tsx`
- [ ] Update `frontend/src/modules/QuoteModule/Forms/QuoteForm.tsx`
- [ ] Update `frontend/src/modules/InvoiceModule/RecordPaymentModule/components/Payment.tsx`
- [ ] Update `frontend/src/modules/PaymentModule/UpdatePaymentModule/components/Payment.tsx`
- [ ] Update `frontend/src/pages/Invoice/index.tsx` (add Company column)
- [ ] Update `frontend/src/pages/Quote/index.tsx` (add Company column)
- [ ] Update `frontend/src/pages/Payment/index.tsx` (add Company column)

### Translations:
- [ ] Add translations for "company", "company_list", "add_new_company" in locale files

---

## 🎯 Success Criteria

1. ✅ Companies can be created, read, updated, and deleted
2. ✅ Companies can be associated with Invoices, Payments, and Quotes
3. ✅ Forms support both Client and Company selection
4. ✅ Data tables display Company information
5. ✅ All existing functionality remains intact (backward compatible)
6. ✅ No breaking changes to existing APIs
7. ✅ All tests pass

---

## 🔗 Related Files Reference

### Backend:
- Model Pattern: `backend/src/models/appModels/Client.js`
- Controller Pattern: `backend/src/controllers/appControllers/clientController/index.js`
- Route Registration: `backend/src/models/utils/index.js`

### Frontend:
- Page Pattern: `frontend/src/pages/Customer/index.tsx`
- Form Pattern: `frontend/src/modules/InvoiceModule/Forms/InvoiceForm.tsx`
- DataTable Pattern: `frontend/src/pages/Invoice/index.tsx`

---

## 📚 Additional Notes

1. **Naming Convention**: Use "company" (singular) for entity name, "Company" (capitalized) for model name
2. **Backward Compatibility**: All changes are optional/additive - existing Client-based records continue to work
3. **Future Enhancements**: Consider adding company hierarchy (parent/child companies), company groups, etc.
4. **Performance**: Company autopopulate should be efficient (already handled by mongoose-autopopulate plugin)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Implementation Planning Team

