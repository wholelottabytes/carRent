namespace WebApplication1.Common.DTOs
{
    public class CarModelImageDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; } = null!;
        public Guid CarModelId { get; set; }
    }
}