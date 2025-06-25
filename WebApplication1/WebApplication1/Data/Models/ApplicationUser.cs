using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using WebApplication1.Common.Interfaces;

namespace WebApplication1.Data.Models
{
    public class ApplicationUser : IdentityUser, ISoftDeletable
    {
        public bool IsDeleted { get; set; } = false;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? LicenseNumber { get; set; }
        public ICollection<Booking>? Bookings { get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}