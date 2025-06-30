using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApplication1.Common.Constants;
using WebApplication1.Common.DTOs;
using WebApplication1.Data.Models;
using WebApplication1.Business.Services;

namespace WebApplication1.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/[action]")]
    [Authorize(Roles = Roles.AdminName)]
    public class CarModelController : ControllerBase
    {
        private readonly ICarModelService _carModelService;
        public CarModelController(ICarModelService svc) => _carModelService = svc;

        [HttpPost]
        public async Task<ActionResult<CarModel>> Create([FromBody] CreateCarModelDto dto)
        {
            var model = await _carModelService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<CarModelDto>> Get(Guid id)
        {
            var model = await _carModelService.GetByIdAsync(id);
            return Ok(model);
        }
        
        [HttpGet]
        public Task<IEnumerable<CarModelDto>> List() => _carModelService.ListAsync();

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCarModelDto dto)
        {
            await _carModelService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _carModelService.DeleteAsync(id);
            return NoContent();
        }
    }
}