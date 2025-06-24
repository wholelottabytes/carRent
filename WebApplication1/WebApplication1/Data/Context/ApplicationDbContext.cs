using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Context
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<RentalLocation> RentalLocations { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<CarImage> CarImages { get; set; }
        public DbSet<AdditionalService> AdditionalServices { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingAdditionalService> BookingAdditionalServices { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // сохранять как строку
            builder.Entity<Car>()
                .Property(c => c.Transmission)
                .HasConversion<string>();

            // составной ключ
            builder.Entity<BookingAdditionalService>()
                .HasKey(bas => new { bas.BookingId, bas.AdditionalServiceId });

            // многие ко многим
            builder.Entity<BookingAdditionalService>()
                .HasOne(bas => bas.Booking)
                .WithMany(b => b.BookingServices)
                .HasForeignKey(bas => bas.BookingId);

            builder.Entity<BookingAdditionalService>()
                .HasOne(bas => bas.AdditionalService)
                .WithMany(a => a.BookingServices)
                .HasForeignKey(bas => bas.AdditionalServiceId);

            // предотвратить каскадное удаление, навсякий хз надо ли
            builder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
