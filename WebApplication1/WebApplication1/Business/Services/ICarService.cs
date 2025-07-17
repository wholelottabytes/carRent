using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services
{
    public interface ICarService
    {
        Task<Car> CreateAsync(CreateCarDto dto);
        Task<IEnumerable<Car>> ListAsync();
        Task<Car> GetByIdAsync(Guid id);
        Task UpdateAsync(Guid id, UpdateCarDto dto);
        Task DeleteAsync(Guid id);
        Task<PagedResult<RentalLocation>> SearchPagedAsync(CarSearchParams searchParams);

    }
}