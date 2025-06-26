using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Services;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.API.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize(Roles = Roles.AdminName)]
public class RentalLocationController : ControllerBase
{
    private readonly IRentalLocationService _svc;
    public RentalLocationController(IRentalLocationService svc) => _svc = svc;

    [HttpPost]
    public async Task<ActionResult<RentalLocation>> Create([FromBody] CreateRentalLocationDto dto)
    {
        var loc = await _svc.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = loc.Id }, loc);
    }
    [HttpGet]
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
                IsAvailable = c.IsAvailable
            }).ToList() ?? new List<CarDtoLocation>()
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
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
                IsAvailable = c.IsAvailable
            }).ToList() ?? new List<CarDtoLocation>()
        };

        return Ok(dto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalLocationDto dto)
    {
        await _svc.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _svc.DeleteAsync(id);
        return NoContent();
    }
}
