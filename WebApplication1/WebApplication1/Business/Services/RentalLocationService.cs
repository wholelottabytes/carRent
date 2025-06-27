using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services;

public class RentalLocationService : IRentalLocationService
{
    private readonly IRentalLocationRepository _repo;
    public RentalLocationService(IRentalLocationRepository repo) => _repo = repo;

    public async Task<RentalLocation> CreateAsync(CreateRentalLocationDto dto)
    {
        var loc = new RentalLocation { Country=dto.Country, City=dto.City, Name=dto.Name, Address=dto.Address };
        await _repo.AddAsync(loc);
        return loc;
    }
    public Task<IEnumerable<RentalLocation>> ListAsync() => _repo.ListAsync();
    public Task<RentalLocation> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);
    
    public Task<IEnumerable<Car>> GetAvailableCarsAsync(Guid locationId) =>
        _repo.GetAvailableCarsAsync(locationId);
    public async Task UpdateAsync(Guid id, UpdateRentalLocationDto dto)
    {
        var loc = await _repo.GetByIdAsync(id);
        loc.Country = dto.Country; loc.City = dto.City;
        loc.Name = dto.Name; loc.Address = dto.Address;
        await _repo.UpdateAsync(loc);
    }
    public async Task DeleteAsync(Guid id) => await _repo.SoftDeleteAsync(await _repo.GetByIdAsync(id));
    
    public async Task<IEnumerable<RentalLocation>> SearchAsync(string? country, string? city, DateTime? startDate, DateTime? endDate)
    {
        return await _repo.SearchAsync(country, city, startDate, endDate);
    }
}