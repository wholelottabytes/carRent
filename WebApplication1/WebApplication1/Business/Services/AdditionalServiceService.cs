using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class AdditionalServiceService : IAdditionalServiceService
    {
        private readonly IAdditionalServiceRepository _additionalServiceRepository;

        public AdditionalServiceService(IAdditionalServiceRepository repo) => _additionalServiceRepository = repo;

        public async Task<AdditionalService> CreateAsync(CreateAdditionalServiceDto dto)
        {
            var svc = new AdditionalService
            {
                Name              = dto.Name,
                Price             = dto.Price,
                RentalLocationId  = dto.RentalLocationId
            };
            await _additionalServiceRepository.AddAsync(svc);
            return svc;
        }

        public async Task<IEnumerable<AdditionalService>> GetByLocationIdAsync(Guid locationId)
        {
            return await _additionalServiceRepository.GetByLocationIdAsync(locationId);
        }

        public async Task<AdditionalService> GetByIdAsync(Guid id)
        {
            var svc = await _additionalServiceRepository.GetByIdAsync(id);
            if (svc is null)
                throw new EntityNotFoundException(nameof(AdditionalService), id);

            return svc;
        }

        public async Task UpdateAsync(Guid id, UpdateAdditionalServiceDto dto)
        {
            var svc = await _additionalServiceRepository.GetByIdAsync(id);
            if (svc is null)
                throw new EntityNotFoundException(nameof(AdditionalService), id);

            svc.Name             = dto.Name;
            svc.Price            = dto.Price;
            svc.RentalLocationId = dto.RentalLocationId;
            await _additionalServiceRepository.UpdateAsync(svc);
        }

        public async Task DeleteAsync(Guid id)
        {
            var svc = await _additionalServiceRepository.GetByIdAsync(id);
            if (svc is null)
                throw new EntityNotFoundException(nameof(AdditionalService), id);

            await _additionalServiceRepository.SoftDeleteAsync(svc);
        }
    }
}
