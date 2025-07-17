using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services;

public interface ICarModelService
{
    Task<CarModel> CreateAsync(CreateCarModelDto dto);
    Task<IEnumerable<CarModelDto>> ListAsync();
    Task<CarModelDto> GetByIdAsync(Guid id);
    Task UpdateAsync(Guid id, UpdateCarModelDto dto);
    Task DeleteAsync(Guid id);
    Task<CarModelDto> CreateFullAsync(CreateFullCarModelDto dto, IFormFile[] files);
    Task<PagedResult<CarModelDto>> SearchPagedAsync(CarModelSearchParamsModel searchParams);

}