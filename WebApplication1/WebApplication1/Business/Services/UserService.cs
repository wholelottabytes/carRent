using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using WebApplication1.Common.DTOs;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;

namespace WebApplication1.Business.Services
{
    public class UserService: IUserService
    {
        private readonly IUserRepository _userRepo;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _config;
        public UserService(IUserRepository userRepo, UserManager<ApplicationUser> userManager, IConfiguration config)
        {
            _userRepo = userRepo;
            _userManager = userManager;
            _config = config;
        }

        public async Task<string?> AuthenticateAsync(string email, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user is null || user.IsDeleted) return null;
            var result = await _userManager.CheckPasswordAsync(user, password);
            if (!result) return null;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim(ClaimTypes.Name, user.UserName!),
            };
            var roles = await _userManager.GetRolesAsync(user);
            foreach(var r in roles)
                claims = claims.Append(new Claim(ClaimTypes.Role, r)).ToArray();

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task SoftDeleteAsync(string id)
        {
            var user = await _userRepo.GetByIdAsync(id);
            if (user is not null)
                await _userRepo.DeleteSoftAsync(user);
        }
    }
}