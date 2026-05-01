# TodoReact Test Suite

This document provides comprehensive information about the test coverage for both the TodoApi and TodoUI projects.

## API Tests (TodoApi.Tests)

### Overview
The API test suite uses **xUnit**, **Moq**, and **Microsoft.AspNetCore.Mvc.Testing** for comprehensive endpoint and integration testing.

### Test Structure

#### 1. **AuthEndpointsTests.cs**
Tests for authentication-related endpoints:
- **Register endpoint**
  - Valid registration
  - Invalid email format
  - Weak password validation
  - Duplicate email prevention

- **Login endpoint**
  - Valid credentials return JWT token
  - Invalid email handling
  - Wrong password handling

- **Forgot Password endpoint**
  - Valid email password reset request
  - Email enumeration prevention (non-existent emails return success)

- **Reset Password endpoint**
  - Valid token and password reset
  - Invalid user handling
  - Invalid token handling

#### 2. **TodoEndpointsTests.cs**
Comprehensive tests for Todo CRUD operations:
- **GET /api/todos**
  - Authentication requirements
  - Returns user-specific todos only
  - Supports multiple todos per user

- **POST /api/todos**
  - Create todo with title
  - Create todo with due date
  - Authentication validation

- **PUT /api/todos/{id}**
  - Update own todos
  - Forbid updating other users' todos
  - Handle non-existent todos

- **DELETE /api/todos/{id}**
  - Delete own todos
  - Forbid deleting other users' todos
  - Handle non-existent todos

- **User Isolation Tests**
  - Verify todos are isolated between users
  - Confirm authorization checks work correctly

#### 3. **ModelTests.cs**
Unit tests for data models:
- **Todo Model Tests**
  - Default property values
  - Setting all properties
  - Property modifications
  - Various data types (titles, emails)

- **Auth Model Tests**
  - RegisterRequest creation
  - LoginRequest creation
  - ForgotPasswordRequest creation
  - ResetPasswordRequest creation
  - AuthResponse with success/failure states

### Running API Tests

```bash
# Run all API tests
dotnet test TodoApi.Tests

# Run specific test class
dotnet test TodoApi.Tests --filter "FullyQualifiedName~TodoApi.Tests.AuthEndpointsTests"

# Run with verbose output
dotnet test TodoApi.Tests --verbosity=detailed

# Run with code coverage
dotnet test TodoApi.Tests --collect:"XPlat Code Coverage"
```

### Test Infrastructure

**CustomWebApplicationFactory.cs**
- Creates in-memory SQLite database for testing
- Mocks email service to prevent external dependencies
- Provides WebApplicationFactory for endpoint testing
- Ensures clean test environment for each test

---

## UI Tests (TodoUI)

### Overview
The UI test suite uses **Vitest**, **React Testing Library**, and **User Event** for component and integration testing.

### Test Structure

#### 1. **api/__tests__/todos.test.ts**
Tests for the Todo API client:
- **getTodos()**
  - Fetch todos with authorization header
  - Handle missing token
  - Error handling on failed responses

- **createTodo()**
  - Create with title only
  - Create with title and due date
  - Error handling

- **updateTodo()**
  - Update existing todo
  - Error handling for failed updates

- **deleteTodo()**
  - Delete todo by ID
  - Error handling for failed deletions

#### 2. **api/__tests__/auth.test.ts**
Tests for the Auth API client:
- **register()**
  - Valid registration request
  - Handle registration failure (duplicate email)
  - Network error handling

- **login()**
  - Login with valid credentials returns JWT token
  - Handle unauthorized login
  - Token extraction and validation

- **forgotPassword()**
  - Request password reset
  - Return success even for non-existent emails (security best practice)

- **resetPassword()**
  - Reset with valid token
  - Handle invalid token
  - Validate new password

- **Error Handling**
  - 401 responses handled correctly
  - JSON parsing errors caught

#### 3. **context/__tests__/AuthContext.test.tsx**
Tests for authentication state management:
- **AuthProvider**
  - Provides auth context to children
  - Initializes with token from localStorage

- **useAuth Hook**
  - Login stores token in localStorage
  - Logout removes token from localStorage
  - Throws error when used outside provider
  - Updates isAuthenticated based on token state

- **Token Management**
  - Persist multiple login calls
  - Handle empty token string
  - Verify authentication state changes

#### 4. **components/__tests__/TodosTable.test.tsx**
Tests for Todo list table component:
- **Rendering**
  - Display table headers
  - Show empty table when no todos
  - Filter by completion status (active/archived)
  - Render todo titles and dates

- **Interactions**
  - Toggle todo completion
  - Edit todo functionality
  - Delete todo functionality

- **Styling**
  - Apply archived styling for completed todos
  - Highlight overdue todos
  - Highlight todos due soon

- **Edge Cases**
  - Handle todos without due dates
  - Handle null/undefined values

#### 5. **pages/__tests__/DashboardPage.test.tsx**
Tests for main dashboard page:
- **Rendering**
  - Display dashboard header
  - Show add todo section
  - Load and display todos
  - Show loading state

- **Add Todo**
  - Create with title only
  - Create with title and due date
  - Clear inputs after creation
  - Prevent empty todos
  - Display error messages

- **Toggle Todos**
  - Toggle completion status
  - Handle update failures

- **Delete Todos**
  - Delete functionality
  - Error handling

- **Archive Toggle**
  - Switch between current and archived views
  - Display correct section title

- **Logout**
  - Call logout function
  - Clear authentication state

- **Error Handling**
  - Display errors when loading fails
  - Clear errors on successful actions

- **Edit Todos**
  - Open edit mode
  - Save edits
  - Cancel editing

### Running UI Tests

```bash
# Install testing dependencies (from TodoUI directory)
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom

# Run all tests
npm run test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/api/__tests__/todos.test.ts

# Watch mode
npm run test -- --watch
```

### Test Configuration

**vitest.config.ts**
- Configures Vitest with jsdom environment for React testing
- Sets up CSS support for styled components
- Enables global test APIs

**vitest.setup.ts**
- Imports @testing-library/jest-dom for custom matchers
- Cleans up components after each test
- Mocks localStorage for auth token testing

---

## Coverage Goals

### API Coverage
- **Authentication**: All password policies, token generation, email validation
- **Authorization**: User isolation, ownership verification
- **Todo Operations**: CRUD operations with proper authorization
- **Error Handling**: Invalid inputs, missing resources, permission denials

### UI Coverage
- **API Calls**: All async operations with success/failure paths
- **State Management**: Auth context and component state
- **User Interactions**: Form submissions, button clicks, toggles
- **Error States**: Display of error messages
- **Edge Cases**: Missing data, null values, empty lists

---

## Best Practices Used

### API Tests
✅ In-memory database for isolation
✅ Multiple user scenarios for authorization testing
✅ Comprehensive error condition testing
✅ User isolation verification
✅ Token validation testing

### UI Tests
✅ Mock external API calls
✅ Test user interactions with userEvent
✅ Verify localStorage usage
✅ Test error states and recovery
✅ Accessibility-first queries (getByText, getByRole, etc.)
✅ Async operation handling with waitFor

---

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

### API Tests
```bash
dotnet test TodoApi.Tests --no-build --verbosity=normal --logger=trx
```

### UI Tests
```bash
cd TodoUI
npm install
npm run test -- --run --reporter=verbose
```

---

## Adding New Tests

### For API Endpoints
1. Add test method to appropriate test class (e.g., `TodoEndpointsTests.cs`)
2. Follow Arrange-Act-Assert pattern
3. Use `CustomWebApplicationFactory` for HTTP client
4. Call `GetAuthTokenAsync()` for authenticated tests

### For UI Components
1. Create `__tests__` folder next to component
2. Create `.test.tsx` file matching component name
3. Mock external dependencies (API calls)
4. Use React Testing Library queries
5. Simulate user interactions with userEvent

---

## Troubleshooting

### API Tests
- **Database locked**: Tests use in-memory database, shouldn't occur
- **Auth token expired**: All tests generate fresh tokens
- **Port conflicts**: Each test gets isolated database

### UI Tests
- **Module not found**: Run `npm install` in TodoUI directory
- **localStorage errors**: Check vitest.setup.ts mock is loaded
- **Component not rendering**: Verify AuthProvider wrapper in tests
- **Fetch mocks not working**: Ensure vi.mock() is at top of test file

---

## Future Enhancements

Potential areas for expanded testing:
- E2E tests with Playwright or Cypress for full user workflows
- Performance testing with k6 or Artillery
- Load testing with concurrent user scenarios
- Security testing for injection attacks
- Accessibility testing with axe-core
- Visual regression testing

---

For more information on testing frameworks:
- [xUnit Documentation](https://xunit.net/)
- [Moq Documentation](https://github.com/moq/moq4)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
