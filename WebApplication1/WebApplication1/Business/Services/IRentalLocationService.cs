using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface IRentalLocationService
{
    Task<RentalLocation> CreateAsync(CreateRentalLocationDto dto);
    Task<IEnumerable<RentalLocation>> ListAsync();
    Task<RentalLocation> GetByIdAsync(Guid id);
    Task<RentalLocation> GetByIdPagedAsync(Guid id, int page, int pageSize);
    Task RestoreAsync(Guid id);
    Task UpdateAsync(Guid id, UpdateRentalLocationDto dto);
    Task DeleteAsync(Guid id);
    Task<PagedResult<RentalLocationSimpleDto>> SearchDeletedPagedAsync(LocationSearchParams searchParams);
    Task<IEnumerable<RentalLocationSimpleDto>> ListSimpleAsync();
    Task<PagedResult<RentalLocationSimpleDto>> SearchPagedAsync(LocationSearchParams searchParams);
    Task<PagedResult<CarModelSummaryDto>> SearchCarModelsPagedAsync(CarModelSearchParams searchParams);

}