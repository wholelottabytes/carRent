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
        public async Task<IActionResult> Get()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return NotFound();
            return Ok(new ProfileDto { Id = user.Id, Email = user.Email!, FirstName = user.FirstName, LastName = user.LastName, LicenseNumber = user.LicenseNumber });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateProfileDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return NotFound();
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.LicenseNumber = dto.LicenseNumber;
            var res = await _userManager.UpdateAsync(user);
            return res.Succeeded ? Ok() : BadRequest(res.Errors);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            var id = _userManager.GetUserId(User);
            await _userService.SoftDeleteAsync(id);
            return Ok();
        }
    }
}