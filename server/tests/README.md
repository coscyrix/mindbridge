# Server Tests

This directory contains all test files for the MindBridge server.

## Structure

```
tests/
├── api/           # API endpoint tests
│   └── test_fee_split_api.js
├── integration/   # Integration tests
└── README.md      # This file
```

## Running Tests

### API Tests
```bash
# Run fee split management API tests
node tests/api/test_fee_split_api.js
```

### Integration Tests
```bash
# Run integration tests (when available)
npm run test:integration
```

## Test Guidelines

1. **API Tests**: Test individual API endpoints
2. **Integration Tests**: Test complete workflows
3. **Unit Tests**: Test individual functions (when needed)
4. **Mock Data**: Use realistic test data
5. **Cleanup**: Always clean up test data after tests

## Test Files

- **test_fee_split_api.js**: Comprehensive tests for fee split management API endpoints

## Contributing

When adding new tests:
1. Place API tests in `api/` folder
2. Place integration tests in `integration/` folder
3. Follow the existing naming conventions
4. Include proper error handling and cleanup 