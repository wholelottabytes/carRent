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
    private readonly IRentalLocationService _svc;
    public RentalLocationController(IRentalLocationService svc) => _svc = svc;

    [HttpPost]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<ActionResult<RentalLocation>> Create([FromBody] CreateRentalLocationDto dto)
    {
        var loc = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = loc.Id }, loc);
    }
   

    [HttpGet("{id}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<RentalLocationDto>> Get(Guid id)
    {
        var loc = await _svc.GetByIdAsync(id);

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
                IsAvailable = c.IsAvailable
            }).ToList() ?? new List<CarDtoLocation>()
        };

        return Ok(dto);
    }
    
    [HttpPut("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalLocationDto dto)
    {
        await _svc.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.AdminName)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _svc.DeleteAsync(id);
        return NoContent();
    }
    [HttpGet("{locationId:guid}")]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<IEnumerable<CarWithCarModelDto>>> AvailableCars(Guid locationId)
    {
        var cars = await _svc.GetAvailableCarsAsync(locationId);
        var dtos = cars.Select(DtoMapper.ToDtoWithCar);
        return Ok(dtos);
    }
    [HttpGet]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<IEnumerable<RentalLocationDto>>> List()
    {
        var locations = await _svc.ListAsync();

        var dtos = locations.Select(loc => new RentalLocationDto
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
                IsAvailable = c.IsAvailable
            }).ToList() ?? new List<CarDtoLocation>()
        });

        return Ok(dtos);
    }
    [HttpGet]
    [Authorize(Roles = $"{Roles.AdminName},{Roles.UserName}")]
    public async Task<ActionResult<IEnumerable<RentalLocationDto>>> Search([FromQuery] string? country, [FromQuery] string? city, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        var startUtc = start?.ToUniversalTime();
        var endUtc = end?.ToUniversalTime();
        var locations = await _svc.SearchAsync(country, city, startUtc, endUtc);

        var dtos = locations.Select(loc => new RentalLocationDto
        {
            Id = loc.Id,
            Country = loc.Country,
            City = loc.City,
            Name = loc.Name,
            Address = loc.Address,
            Cars = loc.Cars?.Where(c => c.IsAvailable && !c.IsDeleted)
                .Select(c => new CarDtoLocation
                {
                    Id = c.Id,
                    ModelName = c.CarModel?.ModelName ?? "Unknown",
                    Make = c.CarModel?.Make ?? "Unknown",  
                    IsAvailable = c.IsAvailable
                }).ToList() ?? new List<CarDtoLocation>()
        });

        return Ok(dtos);
    }
}
