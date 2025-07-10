using WebApplication1.Common.Constants;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;  
using System;
using System.Threading.Tasks;
using WebApplication1.Data.Models; 

namespace WebApplication1.Common.Extensions
{
    public static class ServicesIdentityExtensions
    {
        public static async Task SeedIdentityAsync(this IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

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

            var adminEmail = "admin@yourdomain.com";
            var adminPassword = "Aa123456.";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true, 
                };

                var createResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (createResult.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, Roles.AdminName);
                }
                else
                {
                    throw new Exception("Failed to create admin user: " + string.Join(", ", createResult.Errors));
                }
            }
        }
    }
}
