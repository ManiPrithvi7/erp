# Backend Test Suite

This directory contains comprehensive test cases for the IDURAR ERP CRM backend to ensure code quality and server efficiency.

## Test Structure

```
__tests__/
├── setup.ts                    # Global test setup and teardown
├── helpers/                    # Helper function tests
│   └── helpers.test.ts
├── handlers/                   # Error handler tests
│   └── errorHandlers.test.ts
├── controllers/                # Controller tests
│   ├── invoiceController/
│   │   └── create.test.ts
│   └── createCRUDController.test.ts
├── middlewares/                # Middleware tests
│   └── settings.test.ts
└── models/                     # Model validation tests
    └── invoice.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run tests with verbose output
```bash
npm run test:verbose
```

## Test Coverage

The test suite covers:

1. **Error Handlers** - Critical for server efficiency and error handling
2. **Helper Functions** - Financial calculations and utilities
3. **Controllers** - Business logic validation and data processing
4. **Middleware** - Settings and configuration management
5. **Models** - Data validation and relationships

## Test Database

Tests use a separate test database. Set the `TEST_DATABASE` environment variable or it will default to:
```
mongodb://localhost:27017/idurar-test
```

## Writing New Tests

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Test both success and error cases
4. Include edge cases and performance tests
5. Clean up test data in `afterEach` or `afterAll`

## Performance Tests

Tests include performance benchmarks to ensure:
- Database queries complete in reasonable time
- Calculations maintain precision
- No memory leaks in error handling
- Concurrent operations work correctly

## Continuous Integration

Tests should pass before merging code. The test suite is designed to:
- Catch regressions early
- Ensure code quality
- Prevent server efficiency issues
- Validate business logic correctness

