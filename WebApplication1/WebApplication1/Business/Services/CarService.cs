using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class CarService : ICarService
    {
        private readonly ICarRepository _repo;

        public CarService(ICarRepository repo) => _repo = repo;

        public async Task<Car> CreateAsync(CreateCarDto dto)
        {
            var car = new Car
            {
                CarModelId        = dto.CarModelId,
                RentalLocationId  = dto.RentalLocationId,
                IsAvailable       = true
            };
            await _repo.AddAsync(car);
            return car;
        }

        public Task<IEnumerable<Car>> ListAsync() => _repo.ListAsync();

        public Task<Car> GetByIdAsync(Guid id) => _repo.GetByIdAsync(id);

        public async Task UpdateAsync(Guid id, UpdateCarDto dto)
        {
            var car = await _repo.GetByIdAsync(id);
            if (dto.CarModelId != default)       car.CarModelId       = dto.CarModelId;
            if (dto.RentalLocationId != default) car.RentalLocationId = dto.RentalLocationId;
            if (dto.IsAvailable.HasValue)        car.IsAvailable      = dto.IsAvailable.Value;
            await _repo.UpdateAsync(car);
        }

        public async Task DeleteAsync(Guid id)
        {
            var car = await _repo.GetByIdAsync(id);
            await _repo.SoftDeleteAsync(car);
        }
    }
}