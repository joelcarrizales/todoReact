# Test Quick Start Guide

## API Tests (TodoApi.Tests)

### Prerequisites
- .NET 10 SDK installed
- Project builds successfully: `dotnet build`

### Running Tests

```bash
# Run all API tests
dotnet test TodoApi.Tests

# Run tests with detailed output
dotnet test TodoApi.Tests --verbosity=detailed

# Run specific test class
dotnet test TodoApi.Tests --filter "ClassName=AuthEndpointsTests"

# Run specific test method
dotnet test TodoApi.Tests --filter "Name=Register_ValidRequest_ReturnsOkWithSuccess"

# Run with code coverage
dotnet test TodoApi.Tests /p:CollectCoverage=true

# Watch mode (requires dotnet tool)
dotnet watch test TodoApi.Tests
```

### Test Files

| File | Purpose | Test Count |
|------|---------|-----------|
| AuthEndpointsTests.cs | Authentication endpoints | 10+ |
| TodoEndpointsTests.cs | Todo CRUD operations | 15+ |
| ModelTests.cs | Data models | 10+ |
| IntegrationTests.cs | Full user journeys | 10+ |

---

## UI Tests (TodoUI)

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup

```bash
# Navigate to TodoUI directory
cd TodoUI

# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom
```

### Running Tests

```bash
# Navigate to TodoUI directory
cd TodoUI

# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run specific test file
npm run test -- src/api/__tests__/todos.test.ts

# Run tests matching pattern
npm run test -- --grep "auth"

# Run single test
npm run test -- -t "should register a user"
```

### Test Files

| File | Purpose | Test Count |
|------|---------|-----------|
| api/__tests__/todos.test.ts | Todo API client | 10+ |
| api/__tests__/auth.test.ts | Auth API client | 10+ |
| context/__tests__/AuthContext.test.tsx | Auth state management | 8+ |
| components/__tests__/TodosTable.test.tsx | Todo list table | 15+ |
| pages/__tests__/DashboardPage.test.tsx | Dashboard page | 20+ |

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '10.0'
      - run: dotnet test TodoApi.Tests

  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd TodoUI && npm install
      - run: cd TodoUI && npm run test -- --run
```

---

## Test Results Summary

### API Tests
- **Total Tests**: 45+
- **Coverage Areas**: 
  - Authentication & Authorization
  - Todo CRUD Operations
  - User Isolation
  - Password Validation
  - Data Integrity
  - Error Handling

### UI Tests
- **Total Tests**: 60+
- **Coverage Areas**:
  - API Client Methods
  - Authentication Context
  - Component Rendering
  - User Interactions
  - Error States
  - Form Validation

---

## Debugging Tests

### API Tests
```bash
# Enable verbose logging
dotnet test TodoApi.Tests --logger="console;verbosity=detailed"

# Run single test with breakpoint
dotnet test TodoApi.Tests --filter "Name=SpecificTestName" --debug
```

### UI Tests
```bash
# Debug in Chrome DevTools
npm run test:ui

# View verbose output
npm run test -- --reporter=verbose

# Debug specific test
npm run test -- -t "test name" --inspect-brk
```

---

## Common Issues & Solutions

### API Tests
| Issue | Solution |
|-------|----------|
| Database locked | Tests use in-memory DB; shouldn't occur |
| Token expired | All tests generate fresh tokens |
| Port conflicts | Each test isolated; shouldn't occur |

### UI Tests
| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` in TodoUI |
| localStorage undefined | Check vitest.setup.ts is loaded |
| Fetch not mocked | Ensure `vi.mock()` at top of file |
| Component not rendering | Verify wrapper components in test |

---

## Coverage Reports

### Generate API Coverage
```bash
dotnet test TodoApi.Tests /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### Generate UI Coverage
```bash
cd TodoUI
npm run test:coverage
```

Coverage reports will be generated in `coverage/` directory.

---

## Adding New Tests

### For API
1. Create method in appropriate test class
2. Follow `[Fact]` or `[Theory]` pattern
3. Use Arrange-Act-Assert structure
4. Reference `CustomWebApplicationFactory`

### For UI
1. Create `__tests__` folder if needed
2. Name file `ComponentName.test.tsx`
3. Mock external dependencies
4. Use React Testing Library queries
5. Simulate actions with `userEvent`

---

## Performance Benchmarks

Expected test execution times:
- API tests: 30-60 seconds (includes startup)
- UI tests: 15-30 seconds (includes dependencies)
- Total suite: 1-2 minutes

---

For detailed test documentation, see [TESTING.md](./TESTING.md)
