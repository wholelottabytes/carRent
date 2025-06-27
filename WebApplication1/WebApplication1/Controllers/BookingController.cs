using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApplication1.Business.Services;
using WebApplication1.Common.Constants;
using WebApplication1.Data.Models;
using WebApplication1.Common.DTOs;

namespace WebApplication1.API.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
[Authorize(Roles = Roles.UserName)]
public class BookingController : ControllerBase
{
    private readonly IBookingService _svc;

    public BookingController(IBookingService svc)
    {
        _svc = svc;
    }

    [HttpPost]
    public async Task<ActionResult<Booking>> Create([FromBody] BookingRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? throw new UnauthorizedAccessException("No user ID");

        var booking = new Booking
        {
            CarId = dto.CarId,
            RentalLocationId = dto.RentalLocationId,
            StartDate = dto.StartDate.ToUniversalTime(),
            EndDate = dto.EndDate.ToUniversalTime(),
            PickupTime = dto.PickupTime?.ToUniversalTime(),
            ReturnTime = dto.ReturnTime?.ToUniversalTime(),
            UserId = userId
        };

        var result = await _svc.CreateBookingAsync(booking, dto.AdditionalServiceIds ?? []);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> MyBookings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? throw new UnauthorizedAccessException("No user ID");

        var bookings = await _svc.GetUserBookingsAsync(userId);
        return Ok(bookings);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _svc.DeleteAsync(id);
        return NoContent();
    }
}