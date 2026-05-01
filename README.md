# Todo Application

A todo application with a .NET 10 minimal API backend and React (Vite + TypeScript) frontend featuring user authentication.

## Features 

- User registration with email and password
- Login with JWT-based authentication
- Password reset via email
- SQLite database for user/todo storage
- Add, edit, delete, and list todos
- Pagination for more than 10 todos
- Highly testable architecture with unit and integration tests for both backend and frontend

## Tech Stack

| Layer    | Technology                                      |

|----------|-------------------------------------------------|

| Backend  | .NET 10, Minimal APIs, ASP.NET Core Identity, SQLite, JWT, xUnit, Moq, Microsoft.AspNetCore.Mvc.Testing |

| Frontend | React 19, Vite, TypeScript, React Router, Vitest, React Testing Library |

## Getting Started 

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)

- [Node.js 22+](https://nodejs.org/)

### Backend

```
open a Developer Command Prompt or bash

cd backend/PocApi

dotnet run

```

The API starts at `http://localhost:5000`.

### Frontend 

```
open a Developer Command Prompt or bash

cd frontend

npm install

npm run dev

```

The app starts at `http://localhost:5173` and proxies API calls to the backend.

## API Endpoints

| Method | Path                       | Description            |

|--------|----------------------------|------------------------|

| POST   | `/api/auth/register`       | Create a new account   |

| POST   | `/api/auth/login`          | Sign in, returns JWT   |

| POST   | `/api/auth/forgot-password`| Send password reset email |

| POST   | `/api/auth/reset-password` | Reset password with token |

## Email Configuration

By default, when SMTP is not configured, password reset links are logged to the console. To enable real emails, update `appsettings.json`:

```json

{

  "Email": {

    "SmtpHost": "smtp.example.com",

    "SmtpPort": 587,

    "SmtpUser": "your-email@example.com",

    "SmtpPass": "your-password",

    "FromAddress": "noreply@example.com"

  }

}

``` 

## Password Requirements

- Minimum 10 characters

- At least one uppercase letter

- At least one lowercase letter

- At least one digit


## Testing

See [BACKEND_TESTING.md](BACKEND_TESTING.md) and [FRONTEND_TESTING.md](FRONTEND_TESTING.md) for detailed testing instructions and coverage.

## Future Enhancement Ideas
- Add recurring todos
- Enable sorting and filtering of todos
- Allow users to categorize todos with tags
- Allow users to add subtasks to todos
- Implement due date reminders via email
- Share todos with other users