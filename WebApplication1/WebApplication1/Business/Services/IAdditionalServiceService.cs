using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;

namespace WebApplication1.Business.Services
{
    public interface IAdditionalServiceService
    {
        Task<AdditionalService> CreateAsync(CreateAdditionalServiceDto dto);
        Task<AdditionalService> GetByIdAsync(Guid id);
        Task UpdateAsync(Guid id, UpdateAdditionalServiceDto dto);
        Task DeleteAsync(Guid id);
    }
}