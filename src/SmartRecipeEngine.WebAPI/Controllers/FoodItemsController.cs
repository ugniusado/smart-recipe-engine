using Microsoft.AspNetCore.Mvc;
using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;

namespace SmartRecipeEngine.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodItemsController(IFoodItemService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool activeOnly = true)
    {
        var items = activeOnly
            ? await service.GetAllActiveAsync()
            : await service.GetAllAsync();
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var item = await service.GetByIdAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpGet("urgent")]
    public async Task<IActionResult> GetUrgent()
    {
        var items = await service.GetUrgentAsync();
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFoodItemDto dto)
    {
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateFoodItemDto dto)
    {
        if (id != dto.Id) return BadRequest();
        try
        {
            var updated = await service.UpdateAsync(dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPatch("status")]
    public async Task<IActionResult> ChangeStatus([FromBody] ChangeStatusDto dto)
    {
        try
        {
            var updated = await service.ChangeStatusAsync(dto);
            return Ok(updated);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("auto-cleanup")]
    public async Task<IActionResult> AutoCleanup()
    {
        await service.AutoCleanupExpiredAsync();
        return Ok(new { message = "Auto-cleanup completed." });
    }
}
