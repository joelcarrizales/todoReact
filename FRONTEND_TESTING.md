# Frontend Testing Guide

## Overview
Comprehensive test coverage for TodoUI using Vitest, React Testing Library, and User Event with 50+ tests.

## Quick Start

```bash
# Navigate to TodoUI
cd TodoUI

# Install dependencies (first time only)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom

# Run all tests
npm test

# Run with watch mode
npm test -- --watch

# Run with UI dashboard
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/api/__tests__/todos.test.ts

# Run tests matching pattern
npm test -- --grep "auth"
```

## Test Files

### Configuration
- **vitest.config.ts** - Vitest setup with React plugin, jsdom environment, CSS support
- **vitest.setup.ts** - Testing Library setup, localStorage mock, global utilities

### API Client Tests

#### api/__tests__/todos.test.ts (10+ tests)
**Coverage:** getTodos, createTodo, updateTodo, deleteTodo
- Authorization header validation
- Token handling and errors
- Request/response handling
- Network failure scenarios

#### api/__tests__/auth.test.ts (10+ tests)
**Coverage:** register, login, forgotPassword, resetPassword
- Authentication workflow
- Error handling (401, JSON parsing)
- Security features (email enumeration)
- Token extraction and validation

### Context Tests

#### context/__tests__/AuthContext.test.tsx (8+ tests)
**Coverage:** AuthProvider, useAuth hook, token management
- Context provision and hook functionality
- localStorage integration
- Login/logout operations
- Authentication state management
- Error boundaries and provider validation

### Component Tests

#### components/__tests__/TodosTable.test.tsx (15+ tests)
**Coverage:** Rendering, interactions, styling
- Table header and empty state rendering
- Active/archived todo filtering
- User interactions (toggle, edit, delete)
- CSS class styling (archived, overdue, due-soon)
- Edge cases and null value handling

### Page Tests

#### pages/__tests__/DashboardPage.test.tsx (20+ tests)
**Coverage:** Full page functionality
- Header and layout rendering
- Add/edit/delete todo operations
- Toggle completion status
- Archive/filter todos
- Logout functionality
- Error handling and recovery
- Loading and empty states

## Test Statistics
- **Total Tests:** 60+
- **Lines of Code:** 1300+
- **Coverage Areas:** API clients, Auth context, Components, Pages

## Best Practices
✅ Mocked API calls (no network required)  
✅ Component rendering verification  
✅ User interaction simulation with userEvent  
✅ localStorage mocking  
✅ Error state handling  
✅ Async operation testing with waitFor  
✅ Accessibility-first queries  

## Test Dependencies
- vitest 2.1.8
- @testing-library/react 15.0.7
- @testing-library/jest-dom 6.1.5
- @testing-library/user-event 14.5.1
- jsdom 24.1.0

## CI/CD Integration

```yaml
name: UI Tests
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd TodoUI && npm install
      - run: cd TodoUI && npm run test -- --run
```

## Adding New Tests

1. Create `__tests__` folder next to component/hook/page
2. Name file `ComponentName.test.tsx` or `hookName.test.ts`
3. Mock external dependencies (API calls, localStorage)
4. Use React Testing Library queries
5. Simulate actions with userEvent
6. Use Arrange-Act-Assert pattern

## Debugging Tests

```bash
# View verbose output
npm run test -- --reporter=verbose

# Debug in UI
npm run test:ui

# Debug specific test
npm run test -- -t "test name"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Module not found | Run `npm install` in TodoUI |
| localStorage undefined | Check vitest.setup.ts is loaded |
| Fetch not mocked | Ensure `vi.mock()` at top of file |
| Component not rendering | Verify wrapper components (AuthProvider) in test |

## Coverage Report

Generate coverage reports:

```bash
npm run test:coverage
```

Reports are generated in the `coverage/` directory.
