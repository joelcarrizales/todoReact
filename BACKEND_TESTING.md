# Backend Testing Guide

## Overview
Comprehensive test coverage for TodoApi using xUnit, Moq, and Microsoft.AspNetCore.Mvc.Testing with 50+ tests.

## Quick Start

```
Use the Test Explorer in Visual Studio or run the following commands in terminal:

# Run all API tests
dotnet test TodoApi.Tests

# Run specific test class
dotnet test TodoApi.Tests --filter "ClassName=AuthEndpointsTests"

# Run with code coverage
dotnet test TodoApi.Tests /p:CollectCoverage=true

# Watch mode
dotnet watch test TodoApi.Tests
```

## Test Files

### CustomWebApplicationFactory.cs
- In-memory SQLite database configuration
- Mocked email service
- Isolated test environment for each test
- Auto database creation and seeding

### AuthEndpointsTests.cs (10+ tests)
**Coverage:** Register, Login, Forgot Password, Reset Password
- Email validation and duplicate prevention
- Password policy enforcement
- JWT token generation
- Email enumeration security

### TodoEndpointsTests.cs (15+ tests)
**Coverage:** GET/POST/PUT/DELETE operations
- Authentication and authorization validation
- User isolation verification
- Error handling (NotFound, Forbid, Unauthorized)
- Complete CRUD operation testing

### ModelTests.cs (10+ tests)
**Coverage:** Data model validation
- Property initialization and default values
- Record type creation
- Theory tests with parameterized data

### IntegrationTests.cs (10+ tests)
**Coverage:** Full user workflows
- End-to-end scenarios (Register → Login → CRUD)
- Multi-user isolation
- Concurrent operations
- Data integrity verification

## Test Statistics
- **Total Tests:** 50+
- **Lines of Code:** 1000+
- **Coverage Areas:** Authentication, Authorization, CRUD, Validation, Security, Integration

## Best Practices
✅ In-memory database for isolation  
✅ Multiple user scenarios for authorization  
✅ Comprehensive error condition testing  
✅ User isolation verification  
✅ Token validation testing  

## Test Dependencies
- xUnit 2.9.2
- Moq 4.20.70
- Microsoft.AspNetCore.Mvc.Testing 10.0.7
- Microsoft.EntityFrameworkCore.InMemory 10.0.7

## CI/CD Integration

```yaml
name: API Tests
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '10.0'
      - run: dotnet test TodoApi.Tests
```

## Adding New Tests

1. Create method in appropriate test class
2. Use Arrange-Act-Assert pattern
3. Reference CustomWebApplicationFactory for HTTP client
4. Call GetAuthTokenAsync() for authenticated tests

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database locked | Tests use in-memory DB; shouldn't occur |
| Token expired | All tests generate fresh tokens |
| Port conflicts | Each test is isolated; shouldn't occur |
