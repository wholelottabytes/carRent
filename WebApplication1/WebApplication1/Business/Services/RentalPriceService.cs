using WebApplication1.Business.Services;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalPriceService : IRentalPriceService
{
    private readonly IRentalPriceRepository rentalPriceRepository;

    public RentalPriceService(IRentalPriceRepository repo) => rentalPriceRepository = repo;

    public async Task<RentalPrice> CreateAsync(CreateRentalPriceDto dto)
    {
        var price = new RentalPrice
        {
            CarModelId     = dto.CarModelId,
            PriceType = dto.PriceType,
            Price     = dto.Price
        };
        await rentalPriceRepository.AddAsync(price);
        return price;
    }

    public async Task<RentalPriceDto> GetByIdAsync(Guid id)
    {
        var price = await rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException("RentalPrice", id);

        return new RentalPriceDto
        {
            Id        = price.Id,
            Price     = price.Price,
            PriceType = price.PriceType,
            CarModelId     = price.CarModelId
        };
    }

    public async Task UpdateAsync(Guid id, UpdateRentalPriceDto dto)
    {
        var price = await rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException("RentalPrice", id);

        price.PriceType = dto.PriceType;
        price.Price     = dto.Price;

        await rentalPriceRepository.UpdateAsync(price);
    }

    public async Task DeleteAsync(Guid id)
    {
        var price = await rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException("RentalPrice", id);

        await rentalPriceRepository.DeleteAsync(price);
    }
}