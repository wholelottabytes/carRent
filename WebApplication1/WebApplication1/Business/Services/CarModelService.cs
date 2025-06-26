using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class CarModelService : ICarModelService
    {
        private readonly ICarModelRepository _repo;

        public CarModelService(ICarModelRepository repo)
        {
            _repo = repo;
        }

        public async Task<CarModel> CreateAsync(CreateCarModelDto dto)
        {
            var model = new CarModel
            {
                Make                  = dto.Make,
                ModelName             = dto.ModelName,
                Year                  = dto.Year,
                Transmission          = dto.Transmission,
                SeatingCapacity       = dto.SeatingCapacity,
                FuelConsumptionPer100Km = dto.FuelConsumptionPer100Km
            };
            await _repo.AddAsync(model);
            return model;
        }

        public async Task<CarModelDto> GetByIdAsync(Guid id)
        {
            var model = await _repo.GetByIdAsync(id);
            return DtoMapper.ToDto(model);
        }

        public async Task<IEnumerable<CarModelDto>> ListAsync()
        {
            var list = await _repo.ListAsync();
            return list.Select(DtoMapper.ToDto);
        }

        public async Task UpdateAsync(Guid id, UpdateCarModelDto dto)
        {
            var model = await _repo.GetByIdAsync(id);
            model.Make                    = dto.Make;
            model.ModelName               = dto.ModelName;
            model.Year                    = dto.Year;
            model.Transmission            = dto.Transmission;
            model.SeatingCapacity         = dto.SeatingCapacity;
            model.FuelConsumptionPer100Km = dto.FuelConsumptionPer100Km;
            await _repo.UpdateAsync(model);
        }

        public async Task DeleteAsync(Guid id)
        {
            var model = await _repo.GetByIdAsync(id);
            await _repo.SoftDeleteAsync(model);
        }
    }
}
