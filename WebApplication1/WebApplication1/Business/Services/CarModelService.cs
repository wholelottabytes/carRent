using WebApplication1.Business.Services;
using WebApplication1.Common.DTOs;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarModelService : ICarModelService
{
    private readonly ICarModelRepository _carModelRepository;

    public CarModelService(ICarModelRepository repo)
    {
        _carModelRepository = repo;
    }

    public async Task<CarModel> CreateAsync(CreateCarModelDto dto)
    {
        var model = new CarModel
        {
            Make                     = dto.Make,
            ModelName                = dto.ModelName,
            Year                     = dto.Year,
            Transmission             = dto.Transmission,
            SeatingCapacity          = dto.SeatingCapacity,
            FuelConsumptionPer100Km  = dto.FuelConsumptionPer100Km
        };
        await _carModelRepository.AddAsync(model);
        return model;
    }

    public async Task<CarModelDto> GetByIdAsync(Guid id)
    {
        var model = await _carModelRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(CarModel), id);

        return DtoMapper.ToDto(model);
    }

    public async Task<IEnumerable<CarModelDto>> ListAsync()
    {
        var list = await _carModelRepository.ListAsync();
        return list.Select(DtoMapper.ToDto);
    }

    public async Task UpdateAsync(Guid id, UpdateCarModelDto dto)
    {
        var model = await _carModelRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(CarModel), id);

        model.Make                    = dto.Make;
        model.ModelName              = dto.ModelName;
        model.Year                   = dto.Year;
        model.Transmission           = dto.Transmission;
        model.SeatingCapacity        = dto.SeatingCapacity;
        model.FuelConsumptionPer100Km = dto.FuelConsumptionPer100Km;

        await _carModelRepository.UpdateAsync(model);
    }

    public async Task DeleteAsync(Guid id)
    {
        var model = await _carModelRepository.GetByIdAsync(id)
                    ?? throw new EntityNotFoundException(nameof(CarModel), id);

        await _carModelRepository.SoftDeleteAsync(model);
    }
}