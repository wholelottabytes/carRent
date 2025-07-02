using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Business.Services;
using WebApplication1.Common.Exceptions;

namespace WebApplication1.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [Authorize(Roles = Roles.AdminName)]
    public class CarController : ControllerBase
    {
        private readonly ICarService _carService;
        public CarController(ICarService svc) => _carService = svc;

        [HttpPost]
        public async Task<ActionResult<Car>> Create([FromBody] CreateCarDto dto)
        {
            var car = await _carService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = car.Id }, car);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Car>>> List()
        {
            var cars = await _carService.ListAsync();
            return Ok(cars);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CarWithCarModelDto>> Get(Guid id)
        {
              var car = await _carService.GetByIdAsync(id);
                var dto = DtoMapper.ToDtoWithCar(car);
                return Ok(dto);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCarDto dto)
        {
            await _carService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _carService.DeleteAsync(id);
            return NoContent();
        }
    }
}