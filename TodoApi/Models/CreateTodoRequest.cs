namespace TodoApi.Models
{
    public class CreateTodoRequest
    {
        public required string Title { get; set; }
        public DateOnly? DueDate { get; set; } = null;
    }
}
