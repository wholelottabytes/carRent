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
    public class AdditionalServiceController : ControllerBase
    {
        private readonly IAdditionalServiceService additionalServiceService;
        public AdditionalServiceController(IAdditionalServiceService svc) => additionalServiceService = svc;

        [HttpPost]
        public async Task<ActionResult<AdditionalService>> Create([FromBody] CreateAdditionalServiceDto dto)
        {
            var svcItem = await additionalServiceService.CreateAsync(dto);
            return NoContent();
        }

        [HttpGet("{locationId:guid}")]
        public async Task<IEnumerable<AdditionalService>> GetByLocation(Guid locationId)
        {
            return await additionalServiceService.GetByLocationIdAsync(locationId);
        }
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAdditionalServiceDto dto)
        {
            await additionalServiceService.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await additionalServiceService.DeleteAsync(id);
            return NoContent();
        }
    }
}