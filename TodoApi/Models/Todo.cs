namespace TodoApi.Models
{
    public class Todo
    {
        public int Id { get; set; }
        public required string Title { get; set; } 
        public bool IsCompleted { get; set; } = false;
        public DateOnly CreatedAt { get; set; } = new DateOnly();
        public DateOnly? DueDate { get; set; } = null;
        public DateOnly? CompletedAt { get; set; } = null;
    }
}
