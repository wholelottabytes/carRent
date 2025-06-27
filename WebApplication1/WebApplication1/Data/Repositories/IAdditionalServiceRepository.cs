using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Data.Models;

namespace WebApplication1.Data.Repositories
{
    public interface IAdditionalServiceRepository
    {
        Task<AdditionalService> GetByIdAsync(Guid id);
        Task AddAsync(AdditionalService service);
        Task UpdateAsync(AdditionalService service);
        Task SoftDeleteAsync(AdditionalService service);
        Task<IEnumerable<AdditionalService>> GetByLocationIdAsync(Guid locationId);

    }
}