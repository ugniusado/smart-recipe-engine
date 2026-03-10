using Microsoft.AspNetCore.Mvc;
using SmartRecipeEngine.Application.Interfaces;

namespace SmartRecipeEngine.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RecipesController(IRecipeService service) : ControllerBase
{
    [HttpGet("urgent-search")]
    public async Task<IActionResult> GetUrgentSearch([FromQuery] bool includePantryStaples = true) =>
        Ok(await service.GetUrgentIngredientSearchAsync(includePantryStaples));
}
