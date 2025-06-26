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
        private readonly ICarModelService _svc;
        public CarModelController(ICarModelService svc) => _svc = svc;

        [HttpPost]
        public async Task<ActionResult<CarModel>> Create([FromBody] CreateCarModelDto dto)
        {
            var model = await _svc.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = model.Id }, model);
        }

        [HttpGet("{id:guid}")]
        public Task<CarModelDto> Get(Guid id) => _svc.GetByIdAsync(id);

        [HttpGet]
        public Task<IEnumerable<CarModelDto>> List() => _svc.ListAsync();

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCarModelDto dto)
        {
            await _svc.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _svc.DeleteAsync(id);
            return NoContent();
        }
    }
}