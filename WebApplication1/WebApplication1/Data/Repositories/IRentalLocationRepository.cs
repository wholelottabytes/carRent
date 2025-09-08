using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public interface IRentalLocationRepository
{
    Task<RentalLocation> GetByIdAsync(Guid id);
    Task<RentalLocation?> GetByIdPagedAsync(Guid id, int page, int pageSize);
    Task<IEnumerable<RentalLocation>> ListAsync();
    Task AddAsync(RentalLocation loc);
    Task<(IEnumerable<RentalLocationSimpleDto> Items, int TotalCount)> SearchDeletedAsync(LocationSearchParams searchParams);

    Task UpdateAsync(RentalLocation loc);
    Task SoftDeleteAsync(RentalLocation location);
    Task RestoreAsync(Guid id);
    Task<(IEnumerable<CarModelSummaryDto> Items, int TotalCount)> SearchCarModelsAsync(CarModelSearchParams searchParams);
    Task<(IEnumerable<RentalLocationSimpleDto> Items, int TotalCount)> SearchAsync(LocationSearchParams searchParams);
}
