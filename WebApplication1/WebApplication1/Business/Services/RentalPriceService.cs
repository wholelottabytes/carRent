using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class RentalPriceService : IRentalPriceService
    {
        private readonly IRentalPriceRepository _repo;

        public RentalPriceService(IRentalPriceRepository repo) => _repo = repo;

        public async Task<RentalPrice> CreateAsync(CreateRentalPriceDto dto)
        {
            var price = new RentalPrice
            {
                CarId     = dto.CarId,
                PriceType = dto.PriceType,
                Price     = dto.Price
            };
            await _repo.AddAsync(price);
            return price;
        }


        public async Task<RentalPriceDto> GetByIdAsync(Guid id)
        {
            var price = await _repo.GetByIdAsync(id);

            return new RentalPriceDto
            {
                Id = price.Id,
                Price = price.Price,
                PriceType = price.PriceType,
                CarId = price.CarId,
               
            };
        }
        public async Task UpdateAsync(Guid id, UpdateRentalPriceDto dto)
        {
            var price = await _repo.GetByIdAsync(id);
            price.PriceType = dto.PriceType;
            price.Price     = dto.Price;
            await _repo.UpdateAsync(price);
        }

        public async Task DeleteAsync(Guid id)
        {
            var price = await _repo.GetByIdAsync(id);
            await _repo.DeleteAsync(price);
        }
    }
}