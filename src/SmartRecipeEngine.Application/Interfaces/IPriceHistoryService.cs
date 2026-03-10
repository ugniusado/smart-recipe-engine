using SmartRecipeEngine.Application.DTOs;

namespace SmartRecipeEngine.Application.Interfaces;

public interface IPriceHistoryService
{
    Task<ItemSuggestionDto?> GetSuggestionAsync(string itemName);
}
