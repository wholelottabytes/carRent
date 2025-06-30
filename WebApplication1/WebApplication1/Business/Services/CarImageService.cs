using WebApplication1.Business.Services;
using WebApplication1.Common.Exceptions;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

public class CarImageService : ICarImageService
{
    private readonly ICarImageRepository _carImageRepository;
    private readonly IWebHostEnvironment _environment;

    public CarImageService(ICarImageRepository repo, IWebHostEnvironment environment)
    {
        _carImageRepository = repo;
        _environment = environment;
    }

    public async Task<string> AddImageAsync(Guid CarModelId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new BadRequestException("No file uploaded");

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
        var extension = Path.GetExtension(file.FileName).ToLower();
        if (!allowedExtensions.Contains(extension))
            throw new BadRequestException("Invalid file type. Only JPG and PNG are allowed");

        if (file.Length > 5 * 1024 * 1024)
            throw new BadRequestException("File size exceeds 5MB limit");

        if (string.IsNullOrEmpty(_environment.WebRootPath))
            throw new InvalidOperationException("WebRootPath is not configured");

        var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
        if (!Directory.Exists(uploadsFolder))
            Directory.CreateDirectory(uploadsFolder);

        var fileName = Guid.NewGuid() + extension;
        var filePath = Path.Combine(uploadsFolder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var imageUrl = $"/uploads/{fileName}";
        var image = new CarImage
        {
            Url = imageUrl,
            CarModelId = CarModelId
        };

        await _carImageRepository.AddAsync(image);
        return imageUrl;
    }

    public async Task DeleteImageAsync(Guid imageId)
    {
        var image = await _carImageRepository.GetByIdAsync(imageId);
        if (image == null)
            throw new EntityNotFoundException("CarImage", imageId);

        if (string.IsNullOrEmpty(_environment.WebRootPath))
            throw new InvalidOperationException("WebRootPath is not configured");

        var filePath = Path.Combine(_environment.WebRootPath, image.Url.TrimStart('/'));
        if (File.Exists(filePath))
            File.Delete(filePath);

        await _carImageRepository.DeleteAsync(image);
    }

    public Task<IEnumerable<CarImage>> GetImagesByCarIdAsync(Guid carId)
    {
        return _carImageRepository.GetByCarIdAsync(carId);
    }
}
