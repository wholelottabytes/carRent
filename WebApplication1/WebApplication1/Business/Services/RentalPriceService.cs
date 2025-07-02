using WebApplication1.Business.Services;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class RentalPriceService : IRentalPriceService
{
    private readonly IRentalPriceRepository _rentalPriceRepository;

    public RentalPriceService(IRentalPriceRepository repo) => _rentalPriceRepository = repo;

    public async Task<RentalPrice> CreateAsync(CreateRentalPriceDto dto)
    {
        var price = new RentalPrice
        {
            CarModelId     = dto.CarModelId,
            PriceType = dto.PriceType,
            Price     = dto.Price
        };
        await _rentalPriceRepository.AddAsync(price);
        return price;
    }

    public async Task<RentalPriceDto> GetByIdAsync(Guid id)
    {
        var price = await _rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(RentalPrice), id);

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
        var price = await _rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(RentalPrice), id);

        price.PriceType = dto.PriceType;
        price.Price     = dto.Price;

        await _rentalPriceRepository.UpdateAsync(price);
    }

    public async Task DeleteAsync(Guid id)
    {
        var price = await _rentalPriceRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(RentalPrice), id);

        await _rentalPriceRepository.DeleteAsync(price);
    }
}