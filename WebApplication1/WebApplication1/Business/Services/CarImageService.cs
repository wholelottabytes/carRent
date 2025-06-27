using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using WebApplication1.Data.Models;
using WebApplication1.Data.Repositories;

namespace WebApplication1.Business.Services
{
    public class CarImageService : ICarImageService
    {
        private readonly ICarImageRepository _repo;
        private readonly IWebHostEnvironment _environment;

        public CarImageService(ICarImageRepository repo, IWebHostEnvironment environment)
        {
            _repo = repo;
            _environment = environment;
        }

        public async Task<string> AddImageAsync(Guid carId, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Invalid file type. Only JPG and PNG are allowed");
            }

            if (file.Length > 5 * 1024 * 1024)
            {
                throw new ArgumentException("File size exceeds 5MB limit");
            }

            if (string.IsNullOrEmpty(_environment.WebRootPath))
            {
                throw new InvalidOperationException("WebRootPath is not configured. Ensure static files are enabled.");
            }

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = Guid.NewGuid().ToString() + extension;
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var imageUrl = $"/uploads/{fileName}";
            var image = new CarImage
            {
                Url = imageUrl,
                CarId = carId
            };

            await _repo.AddAsync(image);
            return imageUrl;
        }

        public async Task DeleteImageAsync(Guid imageId)
        {
            var image = await _repo.GetByIdAsync(imageId);

            if (string.IsNullOrEmpty(_environment.WebRootPath))
            {
                throw new InvalidOperationException("WebRootPath is not configured. Ensure static files are enabled.");
            }

            var filePath = Path.Combine(_environment.WebRootPath, image.Url.TrimStart('/'));
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }

            await _repo.DeleteAsync(imageId);
        }

        public Task<IEnumerable<CarImage>> GetImagesByCarIdAsync(Guid carId)
        {
            return _repo.GetByCarIdAsync(carId);
        }
    }
}