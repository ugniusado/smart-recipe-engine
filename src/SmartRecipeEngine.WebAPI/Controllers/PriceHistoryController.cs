using Microsoft.AspNetCore.Mvc;
using SmartRecipeEngine.Application.Interfaces;

namespace SmartRecipeEngine.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PriceHistoryController(IPriceHistoryService service) : ControllerBase
{
    [HttpGet("suggestion")]
    public async Task<IActionResult> GetSuggestion([FromQuery] string name)
    {
        var suggestion = await service.GetSuggestionAsync(name);
        return suggestion is null ? NotFound() : Ok(suggestion);
    }
}
