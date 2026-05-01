namespace TodoApi.Models;

public record RegisterRequest(
    string Email,
    string Password
);

public record LoginRequest(
    string Email,
    string Password
);

public record ForgotPasswordRequest(
    string Email
);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword
);

public record AuthResponse(
    bool Success,
    string? Token = null,
    string[]? Errors = null
);