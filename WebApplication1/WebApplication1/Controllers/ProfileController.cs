using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Business.Services;
using System.Threading.Tasks;

namespace WebApplication1.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly UserService _userService;

        public ProfileController(UserManager<ApplicationUser> userManager, UserService userService)
        {
            _userManager = userManager;
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<ProfileDto>> Get()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null) return NotFound("User not found");

            var response = new ProfileDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                LicenseNumber = user.LicenseNumber
            };

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateProfileDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user is null) return NotFound("User not found");

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.LicenseNumber = dto.LicenseNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            var response = new ProfileDto
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                LicenseNumber = user.LicenseNumber
            };

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            var id = _userManager.GetUserId(User);
            await _userService.SoftDeleteAsync(id);
            return Ok(new { Message = "Profile deleted" });
        }
    }
}
