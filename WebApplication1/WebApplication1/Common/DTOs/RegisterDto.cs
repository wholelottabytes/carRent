using System.ComponentModel.DataAnnotations;


namespace WebApplication1.Common.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(6)] 
        public string Password { get; set; } = null!;

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? LicenseNumber { get; set; }
    }
}