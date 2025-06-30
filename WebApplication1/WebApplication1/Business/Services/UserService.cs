using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using WebApplication1.Business.Services;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class UserService : IUserService
{
    private readonly IUserRepository userRepository;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _config;

    public UserService(IUserRepository userRepo, UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        userRepository = userRepo;
        _userManager = userManager;
        _config = config;
    }

    public async Task<string?> AuthenticateAsync(string email, string password)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user is null || user.IsDeleted) return null;

        var result = await _userManager.CheckPasswordAsync(user, password);
        if (!result) return null;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(ClaimTypes.Name, user.UserName!)
        };

        var roles = await _userManager.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task SoftDeleteAsync(string id)
    {
        var user = await userRepository.GetByIdAsync(id)
                   ?? throw new EntityNotFoundException("User", id);

        await userRepository.DeleteSoftAsync(user);
    }
}