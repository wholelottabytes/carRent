using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class AdditionalServiceService : IAdditionalServiceService
    {
        private readonly IAdditionalServiceRepository _repo;

        public AdditionalServiceService(IAdditionalServiceRepository repo) => _repo = repo;

        public async Task<AdditionalService> CreateAsync(CreateAdditionalServiceDto dto)
        {
            var svc = new AdditionalService
            {
                Name              = dto.Name,
                Price             = dto.Price,
                RentalLocationId  = dto.RentalLocationId
            };
            await _repo.AddAsync(svc);
            return svc;
        }

        public async Task<IEnumerable<AdditionalService>> GetByLocationIdAsync(Guid locationId)
        {
            return await _repo.GetByLocationIdAsync(locationId);
        }
        public Task<AdditionalService> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

        public async Task UpdateAsync(Guid id, UpdateAdditionalServiceDto dto)
        {
            var svc = await _repo.GetByIdAsync(id);
            svc.Name             = dto.Name;
            svc.Price            = dto.Price;
            svc.RentalLocationId = dto.RentalLocationId;
            await _repo.UpdateAsync(svc);
        }

        public async Task DeleteAsync(Guid id)
        {
            var svc = await _repo.GetByIdAsync(id);
            await _repo.SoftDeleteAsync(svc);
        }
    }
}