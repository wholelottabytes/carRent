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
    private readonly IRentalLocationService _rentalLocationService;
    public RentalLocationController(IRentalLocationService svc) => _rentalLocationService = svc;

    [HttpPost]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<ActionResult<RentalLocation>> Create([FromBody] CreateRentalLocationDto dto)
    {
        var loc = await _rentalLocationService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = loc.Id }, loc);
    }
   

    [HttpGet("{id}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<RentalLocationDto>> Get(Guid id)
    {
        var loc = await _rentalLocationService.GetByIdAsync(id);

        var dto = new RentalLocationDto
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
                IsEnabled = c.IsEnabled,
                CarModelId = c.CarModelId 
            }).ToList() ?? new List<CarDtoLocation>()
        };

        return Ok(dto);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalLocationDto dto)
    {
        await _rentalLocationService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _rentalLocationService.DeleteAsync(id);
        return NoContent();
    }
    
    [HttpGet]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<IEnumerable<RentalLocationDto>>> List()
    {
        var locations = await _rentalLocationService.ListAsync();

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
                IsEnabled = c.IsEnabled,
                CarModelId = c.CarModelId 
            }).ToList() ?? new List<CarDtoLocation>()
        });

        return Ok(dtos);
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RentalLocationSimpleDto>>> ListSimple()
    {
        var locations = await _rentalLocationService.ListSimpleAsync();

        return Ok(locations);
    }
    [HttpGet]
    public async Task<IActionResult> SearchCarModels([FromQuery] CarModelSearchParams searchParams)
    {
        var pagedResult = await _rentalLocationService.SearchCarModelsPagedAsync(searchParams);

        return Ok(new
        {
            searchParams.Page,
            searchParams.PageSize,
            TotalCount = pagedResult.TotalCount,
            Items = pagedResult.Items
        });
    }
}
