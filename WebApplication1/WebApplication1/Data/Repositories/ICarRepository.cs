using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public interface ICarRepository
    {
        
        Task<Car> GetByIdAsync(Guid id);
        Task<IEnumerable<Car>> ListAsync();
        Task AddAsync(Car car);
        Task UpdateAsync(Car car);
        Task SoftDeleteAsync(Car car);
    }
}