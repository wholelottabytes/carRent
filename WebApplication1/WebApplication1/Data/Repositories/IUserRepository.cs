using WebApplication1.Data.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace WebApplication1.Data.Repositories
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> GetByIdAsync(string id);
        Task<IEnumerable<ApplicationUser>> GetAllAsync();
        Task DeleteSoftAsync(ApplicationUser user);
        Task UpdateAsync(ApplicationUser user);
    }
}