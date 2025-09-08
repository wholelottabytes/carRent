using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories;

public interface ICarModelRepository
{
    Task<CarModel> GetByIdAsync(Guid id);
    Task<IEnumerable<CarModel>> ListAsync();
    Task AddAsync(CarModel m);
    Task UpdateAsync(CarModel m);
    Task SoftDeleteAsync(CarModel m);
    Task<(IEnumerable<CarModelDto> Items, int TotalCount)> SearchAsync(CarModelSearchParamsModel searchParams);
    Task<CarModel> AddFullModelAsync(
        CarModel model,
        List<RentalPrice> prices,
        List<IFormFile> images,
        IWebHostEnvironment env);
}