using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IRentalLocationService
{
    Task<IEnumerable<Car>> GetAvailableCarsAsync(Guid locationId);
    Task<RentalLocation> CreateAsync(CreateRentalLocationDto dto);
    Task<IEnumerable<RentalLocation>> ListAsync();
    Task<RentalLocation> GetByIdAsync(Guid id);
    Task UpdateAsync(Guid id, UpdateRentalLocationDto dto);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<RentalLocation>> SearchAsync(string? country, string? city, DateTime? startDate, DateTime? endDate);

}