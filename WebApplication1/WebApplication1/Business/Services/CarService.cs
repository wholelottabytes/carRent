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
        private readonly ICarRepository carRepository;

        public CarService(ICarRepository repo) => carRepository = repo;

        public async Task<Car> CreateAsync(CreateCarDto dto)
        {
            var car = new Car
            {
                CarModelId        = dto.CarModelId,
                RentalLocationId  = dto.RentalLocationId,
                IsEnabled      = true
            };
            await carRepository.AddAsync(car);
            return car;
        }

        public Task<IEnumerable<Car>> ListAsync() => carRepository.ListAsync();
        
        public async Task<Car> GetByIdAsync(Guid id)
        {
            var car = await carRepository.GetByIdAsync(id);
            if (car == null)
                throw new EntityNotFoundException("Car", id);

            return car;
        }

        public async Task UpdateAsync(Guid id, UpdateCarDto dto)
        {
            var car = await carRepository.GetByIdAsync(id);
            car.IsEnabled = dto.IsEnabled ?? car.IsEnabled;
            await carRepository.UpdateAsync(car);
        }

        public async Task DeleteAsync(Guid id)
        {
            var car = await carRepository.GetByIdAsync(id);
            await carRepository.SoftDeleteAsync(car);
        }
    }
}