using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class CarService : ICarService
    {
        private readonly ICarRepository _carRepository;

        public CarService(ICarRepository repo) => _carRepository = repo;

        public async Task<Car> CreateAsync(CreateCarDto dto)
        {
            var car = new Car
            {
                CarModelId        = dto.CarModelId,
                RentalLocationId  = dto.RentalLocationId,
                IsEnabled      = true
            };
            await _carRepository.AddAsync(car);
            return car;
        }

        public Task<IEnumerable<Car>> ListAsync() => _carRepository.ListAsync();
        
        public async Task<Car> GetByIdAsync(Guid id)
        {
            var car = await _carRepository.GetByIdAsync(id);
            if (car is null)
                throw new EntityNotFoundException(nameof(Car), id);

            return car;
        }

        public async Task UpdateAsync(Guid id, UpdateCarDto dto)
        {
            var car = await _carRepository.GetByIdAsync(id);
            car.IsEnabled = dto.IsEnabled ?? car.IsEnabled;
            await _carRepository.UpdateAsync(car);
        }

        public async Task DeleteAsync(Guid id)
        {
            var car = await _carRepository.GetByIdAsync(id);
            await _carRepository.SoftDeleteAsync(car);
        }
    }
}