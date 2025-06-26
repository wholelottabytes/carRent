using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IRentalLocationService
{
    Task<RentalLocation> CreateAsync(CreateRentalLocationDto dto);
    Task<IEnumerable<RentalLocation>> ListAsync();
    Task<RentalLocation> GetByIdAsync(Guid id);
    Task UpdateAsync(Guid id, UpdateRentalLocationDto dto);
    Task DeleteAsync(Guid id);
}