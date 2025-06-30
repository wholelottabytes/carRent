using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Services;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.API.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class RentalLocationController : ControllerBase
{
    private readonly IRentalLocationService rentalLocationService;
    public RentalLocationController(IRentalLocationService svc) => rentalLocationService = svc;

    [HttpPost]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<ActionResult<RentalLocation>> Create([FromBody] CreateRentalLocationDto dto)
    {
        var loc = await rentalLocationService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = loc.Id }, loc);
    }
   

    [HttpGet("{id}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<RentalLocationDto>> Get(Guid id)
    {
        var loc = await rentalLocationService.GetByIdAsync(id);

        var dto = new RentalLocationDto
        {
            Id = loc.Id,
            Country = loc.Country,
            City = loc.City,
            Name = loc.Name,
            Address = loc.Address,
            Cars = loc.Cars?.Where(c => !c.IsDeleted).Select(c => new CarDtoLocation
            {
                Id = c.Id,
                ModelName = c.CarModel?.ModelName ?? "Unknown",
                Make = c.CarModel?.Make ?? "Unknown",    
                IsEnabled = c.IsEnabled
            }).ToList() ?? new List<CarDtoLocation>()
        };

        return Ok(dto);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalLocationDto dto)
    {
        await rentalLocationService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await rentalLocationService.DeleteAsync(id);
        return NoContent();
    }
    
    [HttpGet]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<IEnumerable<RentalLocationDto>>> List()
    {
        var locations = await rentalLocationService.ListAsync();

        var dtos = locations.Select(loc => new RentalLocationDto
        {
            Id = loc.Id,
            Country = loc.Country,
            City = loc.City,
            Name = loc.Name,
            Address = loc.Address,
            Cars = loc.Cars?.Select(c => new CarDtoLocation
            {
                Id = c.Id,
                ModelName = c.CarModel?.ModelName ?? "Unknown",
                Make = c.CarModel?.Make ?? "Unknown",  
                IsEnabled = c.IsEnabled
            }).ToList() ?? new List<CarDtoLocation>()
        });

        return Ok(dtos);
    }
    [HttpGet("SearchWithPagination")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<PagedResult<CarModelSummaryDto>>> SearchWithPagination(
        [FromQuery] string? country,
        [FromQuery] string? city,
        [FromQuery] DateTime? start,
        [FromQuery] DateTime? end,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var startUtc = start?.ToUniversalTime();
        var endUtc = end?.ToUniversalTime();

        var result = await rentalLocationService.SearchCarModelsPagedAsync(country, city, startUtc, endUtc, page, pageSize);
        return Ok(result);
    }
}
