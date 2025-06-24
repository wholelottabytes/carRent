// using Microsoft.AspNetCore.Mvc;
// using WebApplication1.Business.Services;
// using WebApplication1.Data.Models;
// using System.Collections.Generic;
// using System.Threading.Tasks;
//
// namespace WebApplication1.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class UsersController : ControllerBase
//     {
//         private readonly UserService _userService;
//         public UsersController(UserService userService)
//         {
//             _userService = userService;
//         }
//
//         [HttpGet]
//         public async Task<IEnumerable<User>> Get() => await _userService.GetAllUsersAsync();
//
//         [HttpGet("{id}")]
//         public async Task<ActionResult<User>> Get(int id)
//         {
//             var user = await _userService.GetUserByIdAsync(id);
//             if (user == null) return NotFound();
//             return user;
//         }
//
//         [HttpPost]
//         public async Task<IActionResult> Post([FromBody] User user)
//         {
//             await _userService.AddUserAsync(user);
//             return CreatedAtAction(nameof(Get), new { id = user.Id }, user);
//         }
//
//         [HttpPut("{id}")]
//         public async Task<IActionResult> Put(int id, [FromBody] User user)
//         {
//             if (id != user.Id) return BadRequest();
//             await _userService.UpdateUserAsync(user);
//             return NoContent();
//         }
//
//         [HttpDelete("{id}")]
//         public async Task<IActionResult> Delete(int id)
//         {
//             await _userService.DeleteUserAsync(id);
//             return NoContent();
//         }
//     }
// }