using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Business.Services;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize(Roles = Roles.AdminName)]
public class RentalPriceController : ControllerBase
{
    private readonly IRentalPriceService _rentalPriceService;
    public RentalPriceController(IRentalPriceService svc) => _rentalPriceService = svc;

    [HttpPost]
    public async Task<ActionResult<RentalPriceDto>> Create([FromBody] CreateRentalPriceDto dto)
    {
        var created = await _rentalPriceService.CreateAsync(dto);
        var result = await _rentalPriceService.GetByIdAsync(created.Id);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RentalPriceDto>> Get(Guid id)
    {
        var price = await _rentalPriceService.GetByIdAsync(id);
        return Ok(price);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRentalPriceDto dto)
    {
        await _rentalPriceService.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _rentalPriceService.DeleteAsync(id);
        return NoContent();
    }
}