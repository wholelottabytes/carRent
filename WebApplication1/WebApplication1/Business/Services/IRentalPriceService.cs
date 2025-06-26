using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services
{
    public interface IRentalPriceService
    {
        Task<RentalPrice> CreateAsync(CreateRentalPriceDto dto);
        Task<RentalPriceDto> GetByIdAsync(Guid id);
        Task UpdateAsync(Guid id, UpdateRentalPriceDto dto);
        Task DeleteAsync(Guid id);
    }
}