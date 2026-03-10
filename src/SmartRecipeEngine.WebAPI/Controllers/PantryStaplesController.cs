using Microsoft.AspNetCore.Mvc;
using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;

namespace SmartRecipeEngine.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PantryStaplesController(IPantryStapleService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await service.GetAllAsync());

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePantryStapleDto dto)
    {
        var created = await service.CreateAsync(dto);
        return Ok(created);
    }

    [HttpPatch("{id:int}/toggle")]
    public async Task<IActionResult> Toggle(int id)
    {
        try
        {
            await service.ToggleAsync(id);
            return NoContent();
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
}
