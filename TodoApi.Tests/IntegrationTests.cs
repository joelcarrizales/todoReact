using Xunit;
using System.Net;
using System.Net.Http.Json;
using TodoApi.Models;

namespace TodoApi.Tests;

public class IntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public IntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    private async Task<string> RegisterAndLoginAsync(string email, string password)
    {
        var registerRequest = new RegisterRequest(email, password);
        await _client.PostAsJsonAsync("/api/auth/register", registerRequest);

        var loginRequest = new LoginRequest(email, password);
        var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
        var content = await response.Content.ReadFromJsonAsync<AuthResponse>();
        return content.Token ?? throw new InvalidOperationException("Failed to get token");
    }

    private HttpClient GetAuthorizedClient(string token)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task FullUserJourney_RegisterLoginCreateUpdateDeleteTodos()
    {
        // Arrange
        var email = "journey@example.com";
        var password = "JourneyPassword123";

        // Act - Register
        var registerResponse = await _client.PostAsJsonAsync("/api/auth/register", new RegisterRequest(email, password));
        Assert.Equal(HttpStatusCode.OK, registerResponse.StatusCode);

        // Act - Login
        var token = await RegisterAndLoginAsync(email, password);
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var authorizedClient = GetAuthorizedClient(token);

        // Act - Create todos
        var todo1Response = await authorizedClient.PostAsJsonAsync("/api/todos", 
            new CreateTodoRequest { Title = "First task" });
        var todo1 = await todo1Response.Content.ReadFromJsonAsync<Todo>();

        var todo2Response = await authorizedClient.PostAsJsonAsync("/api/todos", 
            new CreateTodoRequest { Title = "Second task", DueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(7)) });
        var todo2 = await todo2Response.Content.ReadFromJsonAsync<Todo>();

        // Act - Get all todos
        var getTodosResponse = await authorizedClient.GetAsync("/api/todos");
        var todos = await getTodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Equal(2, todos.Count);

        // Act - Update todo
        var updatedTodo = new Todo 
        { 
            Title = "First task - Updated", 
            IsCompleted = true,
            UserEmail = email,
            DueDate = todo1.DueDate
        };
        var updateResponse = await authorizedClient.PutAsJsonAsync($"/api/todos/{todo1.Id}", updatedTodo);
        var updated = await updateResponse.Content.ReadFromJsonAsync<Todo>();
        Assert.Equal("First task - Updated", updated.Title);
        Assert.True(updated.IsCompleted);

        // Act - Delete todo
        var deleteResponse = await authorizedClient.DeleteAsync($"/api/todos/{todo2.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        // Act - Verify deletion
        var finalTodosResponse = await authorizedClient.GetAsync("/api/todos");
        var finalTodos = await finalTodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Single(finalTodos);
        Assert.Equal(todo1.Id, finalTodos[0].Id);
    }

    [Fact]
    public async Task MultipleUsers_CannotAccessEachOthersTodos()
    {
        // Arrange
        var user1Email = "user1@example.com";
        var user1Password = "Password123";
        var user2Email = "user2@example.com";
        var user2Password = "Password456";

        // Act - User 1 setup
        var token1 = await RegisterAndLoginAsync(user1Email, user1Password);
        var client1 = GetAuthorizedClient(token1);

        // Create todos for User 1
        var user1Todo = new CreateTodoRequest { Title = "User 1's secret todo" };
        var createResponse = await client1.PostAsJsonAsync("/api/todos", user1Todo);
        var todo = await createResponse.Content.ReadFromJsonAsync<Todo>();
        var todoId = todo.Id;

        // Act - User 2 setup
        var token2 = await RegisterAndLoginAsync(user2Email, user2Password);
        var client2 = GetAuthorizedClient(token2);

        // Assert - User 2 cannot see User 1's todos
        var user2TodosResponse = await client2.GetAsync("/api/todos");
        var user2Todos = await user2TodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Empty(user2Todos);

        // Assert - User 2 cannot update User 1's todos
        var updateAttempt = await client2.PutAsJsonAsync($"/api/todos/{todoId}", 
            new Todo { Title = "Hacked", UserEmail="test@test.com", IsCompleted = true });
        Assert.Equal(HttpStatusCode.Forbidden, updateAttempt.StatusCode);

        // Assert - User 2 cannot delete User 1's todos
        var deleteAttempt = await client2.DeleteAsync($"/api/todos/{todoId}");
        Assert.Equal(HttpStatusCode.Forbidden, deleteAttempt.StatusCode);

        // Assert - Todo still exists for User 1
        var user1TodosResponse = await client1.GetAsync("/api/todos");
        var user1Todos = await user1TodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Single(user1Todos);
    }

    [Fact]
    public async Task PasswordValidation_EnforcesAllRequirements()
    {
        // Test minimum length requirement
        var request1 = new RegisterRequest("test1@example.com", "Short1");
        var response1 = await _client.PostAsJsonAsync("/api/auth/register", request1);
        Assert.Equal(HttpStatusCode.BadRequest, response1.StatusCode);

        // Test digit requirement
        var request2 = new RegisterRequest("test2@example.com", "NoDigits");
        var response2 = await _client.PostAsJsonAsync("/api/auth/register", request2);
        Assert.Equal(HttpStatusCode.BadRequest, response2.StatusCode);

        // Test lowercase requirement
        var request3 = new RegisterRequest("test3@example.com", "NOLOWERCASE1");
        var response3 = await _client.PostAsJsonAsync("/api/auth/register", request3);
        Assert.Equal(HttpStatusCode.BadRequest, response3.StatusCode);

        // Test uppercase requirement
        var request4 = new RegisterRequest("test4@example.com", "nouppercase1");
        var response4 = await _client.PostAsJsonAsync("/api/auth/register", request4);
        Assert.Equal(HttpStatusCode.BadRequest, response4.StatusCode);

        // Valid password should work
        var validRequest = new RegisterRequest("valid@example.com", "ValidPassword123");
        var validResponse = await _client.PostAsJsonAsync("/api/auth/register", validRequest);
        Assert.Equal(HttpStatusCode.OK, validResponse.StatusCode);
    }

    [Fact]
    public async Task TodoDataIntegrity_PreservesDataCorrectly()
    {
        // Arrange
        var email = "integrity@example.com";
        var password = "IntegrityPass123";
        var token = await RegisterAndLoginAsync(email, password);
        var client = GetAuthorizedClient(token);

        var dueDate = DateOnly.FromDateTime(DateTime.Now.AddDays(10));
        var createRequest = new CreateTodoRequest 
        { 
            Title = "Important task",
            DueDate = dueDate
        };

        // Act - Create and retrieve
        var createResponse = await client.PostAsJsonAsync("/api/todos", createRequest);
        var createdTodo = await createResponse.Content.ReadFromJsonAsync<Todo>();

        var getTodosResponse = await client.GetAsync("/api/todos");
        var todos = await getTodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        var retrievedTodo = todos.First(t => t.Id == createdTodo.Id);

        // Assert - Data integrity
        Assert.Equal("Important task", retrievedTodo.Title);
        Assert.False(retrievedTodo.IsCompleted);
        Assert.Equal(dueDate, retrievedTodo.DueDate);
        Assert.Equal(email, retrievedTodo.UserEmail);
        Assert.Null(retrievedTodo.CompletedAt);
    }

    [Fact]
    public async Task ConcurrentOperations_HandleMultipleTodosPerUser()
    {
        // Arrange
        var email = "concurrent@example.com";
        var password = "ConcurrentPass123";
        var token = await RegisterAndLoginAsync(email, password);
        var client = GetAuthorizedClient(token);

        // Act - Create multiple todos
        var taskCount = 10;
        var taskIds = new List<int>();

        for (int i = 1; i <= taskCount; i++)
        {
            var request = new CreateTodoRequest { Title = $"Task {i}" };
            var response = await client.PostAsJsonAsync("/api/todos", request);
            var todo = await response.Content.ReadFromJsonAsync<Todo>();
            taskIds.Add(todo.Id);
        }

        // Assert - All todos were created
        var getTodosResponse = await client.GetAsync("/api/todos");
        var todos = await getTodosResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Equal(taskCount, todos.Count);

        // Act - Update alternate todos
        for (int i = 0; i < taskCount; i += 2)
        {
            var todo = todos[i];
            var updateRequest = new Todo 
            { 
                Title = todo.Title, 
                IsCompleted = true,
                UserEmail = email
            };
            await client.PutAsJsonAsync($"/api/todos/{todo.Id}", updateRequest);
        }

        // Act - Delete odd-numbered todos
        for (int i = 1; i < taskCount; i += 2)
        {
            await client.DeleteAsync($"/api/todos/{taskIds[i]}");
        }

        // Assert - Correct number of todos remain
        var finalResponse = await client.GetAsync("/api/todos");
        var finalTodos = await finalResponse.Content.ReadFromJsonAsync<List<Todo>>();
        Assert.Equal(5, finalTodos.Count); // Half were deleted

        // Assert - Correct todos were updated
        var completedTodos = finalTodos.Where(t => t.IsCompleted).ToList();
        Assert.Equal(5, completedTodos.Count); // All remaining were marked complete
    }

    [Fact]
    public async Task TodoCreatedDate_IsSetToToday()
    {
        // Arrange
        var email = "createddate@example.com";
        var password = "CreatedDatePass123";
        var token = await RegisterAndLoginAsync(email, password);
        var client = GetAuthorizedClient(token);
        var today = DateOnly.FromDateTime(DateTime.Now);

        // Act
        var request = new CreateTodoRequest { Title = "Today's task" };
        var response = await client.PostAsJsonAsync("/api/todos", request);
        var todo = await response.Content.ReadFromJsonAsync<Todo>();

        // Assert
        Assert.Equal(today, todo.CreatedAt);
    }

    [Fact]
    public async Task TodoCompletion_SetsCompletedAtDate()
    {
        // Arrange
        var email = "completion@example.com";
        var password = "CompletionPass123";
        var token = await RegisterAndLoginAsync(email, password);
        var client = GetAuthorizedClient(token);
        var today = DateOnly.FromDateTime(DateTime.Now);

        var createRequest = new CreateTodoRequest { Title = "Task to complete" };
        var createResponse = await client.PostAsJsonAsync("/api/todos", createRequest);
        var createdTodo = await createResponse.Content.ReadFromJsonAsync<Todo>();

        // Act - Mark as completed
        var updateRequest = new Todo 
        { 
            Title = createdTodo.Title,
            IsCompleted = true,
            CompletedAt = today,
            UserEmail = email
        };
        var updateResponse = await client.PutAsJsonAsync($"/api/todos/{createdTodo.Id}", updateRequest);
        var updatedTodo = await updateResponse.Content.ReadFromJsonAsync<Todo>();

        // Assert
        Assert.True(updatedTodo.IsCompleted);
        Assert.Equal(today, updatedTodo.CompletedAt);
    }

    [Fact]
    public async Task InvalidTokens_AreRejected()
    {
        // Arrange
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", "invalid-token-xyz");

        // Act
        var response = await client.GetAsync("/api/todos");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task MissingAuthorizationHeader_ReturnsUnauthorized()
    {
        // Act
        var response = await _client.GetAsync("/api/todos");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
