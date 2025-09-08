using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Services;
using WebApplication1.Common.Constants;
using WebApplication1.Data.Models;

[ApiController]
[Route("api/[controller]/[action]")]
public class CarImageController : ControllerBase
{
    private readonly ICarImageService _carImageService;

    public CarImageController(ICarImageService service)
    {
        _carImageService = service;
    }

    [HttpPost("{carId:guid}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<ActionResult> Upload(Guid carId, IFormFile file)
    {
        var imageUrl = await _carImageService.AddImageAsync(carId, file);
        return Ok(new { ImageUrl = imageUrl });
    }

    [HttpDelete("{imageId:guid}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Delete(Guid imageId)
    {
        await _carImageService.DeleteImageAsync(imageId);
        return NoContent();
    }

    [HttpGet("{carId:guid}")]
    public async Task<ActionResult<IEnumerable<CarImage>>> GetByCarId(Guid carId)
    {
        var images = await _carImageService.GetImagesByCarIdAsync(carId);
        return Ok(images);
    }
}