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
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService svc)
    {
        _bookingService = svc;
    }

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create([FromBody] BookingRequestDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? throw new UnauthorizedAccessException("No user ID");

        var booking = await _bookingService.CreateBookingAsync(
            dto.CarModelId, 
            dto.RentalLocationId,
            dto.StartDate.ToUniversalTime(),
            dto.EndDate.ToUniversalTime(),
            dto.PickupTime?.ToUniversalTime(),
            dto.ReturnTime?.ToUniversalTime(),
            userId,
            dto.AdditionalServiceIds ?? []
        );

        var result = new BookingDto
        {
            Id = booking.Id,
            CarId = booking.CarId,
            RentalLocationId = booking.RentalLocationId,
            StartDate = booking.StartDate,
            EndDate = booking.EndDate,
            PickupTime = booking.PickupTime,
            ReturnTime = booking.ReturnTime,
            TotalPrice = booking.TotalPrice,
        };

        return Ok(result);
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> MyBookings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? throw new UnauthorizedAccessException("No user ID");

        var bookings = await _bookingService.GetUserBookingsAsync(userId);
        return Ok(bookings);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _bookingService.DeleteAsync(id);
        return NoContent();
    }
}