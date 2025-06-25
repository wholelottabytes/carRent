using WebApplication1.Common.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;  // для CreateScope
using System;
using System.Threading.Tasks;

namespace WebApplication1.Common.Extensions
{
    public static class ServicesIdentityExtensions
    {
        public static async Task SeedIdentityAsync(this IServiceProvider services)
        {
            using var scope = services.CreateScope(); 
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

            var roles = new[]
            {
                new IdentityRole { Id = Roles.AdminId, Name = Roles.AdminName, NormalizedName = Roles.AdminName.ToUpper() },
                new IdentityRole { Id = Roles.UserId, Name = Roles.UserName, NormalizedName = Roles.UserName.ToUpper() }
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role.Name))
                {
                    await roleManager.CreateAsync(role);
                }
            }
        }
    }
}