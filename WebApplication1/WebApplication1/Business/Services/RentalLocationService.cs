using WebApplication1.Business.Services;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalLocationService : IRentalLocationService
{
    private readonly IRentalLocationRepository rentalLocationRepository;

    public RentalLocationService(IRentalLocationRepository repo) => rentalLocationRepository = repo;

    public async Task<RentalLocation> CreateAsync(CreateRentalLocationDto dto)
    {
        var loc = new RentalLocation
        {
            Country = dto.Country,
            City = dto.City,
            Name = dto.Name,
            Address = dto.Address
        };

        await rentalLocationRepository.AddAsync(loc);
        return loc;
    }

    public async Task<IEnumerable<RentalLocation>> ListAsync()
        => await rentalLocationRepository.ListAsync();

    public async Task<RentalLocation> GetByIdAsync(Guid id)
        => await rentalLocationRepository.GetByIdAsync(id)
           ?? throw new EntityNotFoundException("RentalLocation", id);

  
    public async Task UpdateAsync(Guid id, UpdateRentalLocationDto dto)
    {
        var loc = await rentalLocationRepository.GetByIdAsync(id)
                  ?? throw new EntityNotFoundException("RentalLocation", id);

        loc.Country = dto.Country;
        loc.City = dto.City;
        loc.Name = dto.Name;
        loc.Address = dto.Address;

        await rentalLocationRepository.UpdateAsync(loc);
    }

    public async Task DeleteAsync(Guid id)
    {
        var loc = await rentalLocationRepository.GetByIdAsync(id)
                  ?? throw new EntityNotFoundException("RentalLocation", id);

        await rentalLocationRepository.SoftDeleteAsync(loc);
    }

    public async Task<PagedResult<CarModelSummaryDto>> SearchCarModelsPagedAsync(string? country, string? city, DateTime? startDate, DateTime? endDate, int page, int pageSize)
    {
        var (items, totalCount) = await rentalLocationRepository.SearchCarModelsAsync(country, city, startDate, endDate, page, pageSize);
        return new PagedResult<CarModelSummaryDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}