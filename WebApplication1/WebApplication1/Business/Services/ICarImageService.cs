using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services
{
    public interface ICarImageService
    {
        Task<string> AddImageAsync(Guid carId, IFormFile file);
        Task DeleteImageAsync(Guid imageId);
        Task<IEnumerable<CarImage>> GetImagesByCarIdAsync(Guid carId);
    }
}