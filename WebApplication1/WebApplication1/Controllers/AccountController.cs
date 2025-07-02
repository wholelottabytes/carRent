using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

[ApiController]
[Route("api/[controller]/[action]")]
public class AccountController : ControllerBase
{
    private readonly UserService _userService;
    private readonly UserManager<ApplicationUser> _userManager;

    public AccountController(UserService userService, UserManager<ApplicationUser> userManager)
    {
        _userService = userService;
        _userManager = userManager;
    }

    [HttpPost]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto dto)
    {
        var token = await _userService.AuthenticateAsync(dto.Email, dto.Password);
        if (token is null) return Unauthorized("Invalid email or password");

        var response = new LoginResponseDto { Token = token };
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromBody] RegisterDto dto)
    {
        var user = new ApplicationUser
        {
            UserName      = dto.Email,
            Email         = dto.Email,
            FirstName     = dto.FirstName,
            LastName      = dto.LastName,
            LicenseNumber = dto.LicenseNumber
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        await _userManager.AddToRoleAsync(user, Roles.UserName);

        var token = await _userService.AuthenticateAsync(dto.Email, dto.Password);
        if (token is null) return Unauthorized();

        var response = new RegisterResponseDto { Token = token };
        return Ok(response);
    }
}