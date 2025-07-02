using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public interface ICarImageRepository
    {
        Task AddAsync(CarImage image);
        Task DeleteAsync(CarImage image);
        Task<CarImage> GetByIdAsync(Guid id);
        Task<IEnumerable<CarImage>> GetByCarIdAsync(Guid carId);
    }
}