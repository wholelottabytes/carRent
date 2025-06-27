using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.Constants;
using WebApplication1.Data.Models;
using WebApplication1.Business.Services;

namespace WebApplication1.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    public class CarImageController : ControllerBase
    {
        private readonly ICarImageService _service;

        public CarImageController(ICarImageService service)
        {
            _service = service;
        }

        [HttpPost("{carId:guid}")]
        [Authorize(Roles = Roles.AdminName)]
        public async Task<ActionResult> Upload(Guid carId, IFormFile file)
        {
            try
            {
                var imageUrl = await _service.AddImageAsync(carId, file);
                return Ok(new { ImageUrl = imageUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
            }
        }

        [HttpDelete("{imageId:guid}")]
        [Authorize(Roles = Roles.AdminName)]
        public async Task<IActionResult> Delete(Guid imageId)
        {
            try
            {
                await _service.DeleteImageAsync(imageId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound($"Image with id {imageId} not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error deleting image: {ex.Message}");
            }
        }

        [HttpGet("{carId:guid}")]
        [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
        public async Task<ActionResult<IEnumerable<CarImage>>> GetByCarId(Guid carId)
        {
            var images = await _service.GetImagesByCarIdAsync(carId);
            return Ok(images);
        }
    }
}