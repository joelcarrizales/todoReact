using Xunit;
using TodoApi.Models;

namespace TodoApi.Tests;

public class TodoModelTests
{
    [Fact]
    public void Todo_DefaultValues_CreatesWithDefaults()
    {
        // Act
        var todo = new Todo
        {
            Id = 1,
            Title = "Test Todo",
            UserEmail = "test@example.com"
        };

        // Assert
        Assert.Equal(1, todo.Id);
        Assert.Equal("Test Todo", todo.Title);
        Assert.Equal("test@example.com", todo.UserEmail);
        Assert.False(todo.IsCompleted);
        Assert.Null(todo.DueDate);
        Assert.Null(todo.CompletedAt);
    }

    [Fact]
    public void Todo_WithAllProperties_SetsAllValues()
    {
        // Arrange
        var createdAt = DateOnly.FromDateTime(DateTime.Now);
        var dueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(5));
        var completedAt = DateOnly.FromDateTime(DateTime.Now.AddDays(3));

        // Act
        var todo = new Todo
        {
            Id = 1,
            Title = "Complete Todo",
            UserEmail = "user@example.com",
            IsCompleted = true,
            CreatedAt = createdAt,
            DueDate = dueDate,
            CompletedAt = completedAt
        };

        // Assert
        Assert.Equal(1, todo.Id);
        Assert.Equal("Complete Todo", todo.Title);
        Assert.Equal("user@example.com", todo.UserEmail);
        Assert.True(todo.IsCompleted);
        Assert.Equal(createdAt, todo.CreatedAt);
        Assert.Equal(dueDate, todo.DueDate);
        Assert.Equal(completedAt, todo.CompletedAt);
    }

    [Fact]
    public void Todo_IsCompletedToggle_WorksCorrectly()
    {
        // Arrange
        var todo = new Todo { Title = "Test", UserEmail = "test@example.com", IsCompleted = false };

        // Act
        todo.IsCompleted = true;

        // Assert
        Assert.True(todo.IsCompleted);
    }

    [Fact]
    public void CreateTodoRequest_DefaultDueDate_IsNull()
    {
        // Act
        var request = new CreateTodoRequest { Title = "New Todo" };

        // Assert
        Assert.Equal("New Todo", request.Title);
        Assert.Null(request.DueDate);
    }

    [Fact]
    public void CreateTodoRequest_WithDueDate_SetsDueDate()
    {
        // Arrange
        var dueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7));

        // Act
        var request = new CreateTodoRequest { Title = "Todo with date", DueDate = dueDate };

        // Assert
        Assert.Equal(dueDate, request.DueDate);
    }

    [Theory]
    [InlineData("task1", "user1@test.com")]
    [InlineData("task2", "user2@test.com")]
    [InlineData("Very long task title that should still work", "longemail@domain.com")]
    public void Todo_VariousTitlesAndEmails_CreatesSuccessfully(string title, string email)
    {
        // Act
        var todo = new Todo { Title = title, UserEmail = email };

        // Assert
        Assert.Equal(title, todo.Title);
        Assert.Equal(email, todo.UserEmail);
    }
}

public class AuthModelsTests
{
    [Fact]
    public void RegisterRequest_Create_WithEmailAndPassword()
    {
        // Act
        var request = new RegisterRequest("test@example.com", "Password123");

        // Assert
        Assert.Equal("test@example.com", request.Email);
        Assert.Equal("Password123", request.Password);
    }

    [Fact]
    public void LoginRequest_Create_WithEmailAndPassword()
    {
        // Act
        var request = new LoginRequest("test@example.com", "Password123");

        // Assert
        Assert.Equal("test@example.com", request.Email);
        Assert.Equal("Password123", request.Password);
    }

    [Fact]
    public void ForgotPasswordRequest_Create_WithEmail()
    {
        // Act
        var request = new ForgotPasswordRequest("test@example.com");

        // Assert
        Assert.Equal("test@example.com", request.Email);
    }

    [Fact]
    public void ResetPasswordRequest_Create_WithAllData()
    {
        // Act
        var request = new ResetPasswordRequest("test@example.com", "token123", "NewPassword456");

        // Assert
        Assert.Equal("test@example.com", request.Email);
        Assert.Equal("token123", request.Token);
        Assert.Equal("NewPassword456", request.NewPassword);
    }

    [Fact]
    public void AuthResponse_SuccessWithoutToken_CreatesCorrectly()
    {
        // Act
        var response = new AuthResponse(true);

        // Assert
        Assert.True(response.Success);
        Assert.Null(response.Token);
        Assert.Null(response.Errors);
    }

    [Fact]
    public void AuthResponse_SuccessWithToken_CreatesCorrectly()
    {
        // Act
        var response = new AuthResponse(true, Token: "jwt-token-123");

        // Assert
        Assert.True(response.Success);
        Assert.Equal("jwt-token-123", response.Token);
        Assert.Null(response.Errors);
    }

    [Fact]
    public void AuthResponse_FailureWithErrors_CreatesCorrectly()
    {
        // Arrange
        var errors = new[] { "Invalid email", "Password too weak" };

        // Act
        var response = new AuthResponse(false, Errors: errors);

        // Assert
        Assert.False(response.Success);
        Assert.Null(response.Token);
        Assert.NotNull(response.Errors);
        Assert.Equal(2, response.Errors.Length);
        Assert.Contains("Invalid email", response.Errors);
    }
}
