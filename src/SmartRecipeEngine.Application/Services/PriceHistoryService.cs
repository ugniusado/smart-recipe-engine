using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Application.Services;

public class PriceHistoryService(IPriceHistoryRepository repository) : IPriceHistoryService
{
    public async Task<ItemSuggestionDto?> GetSuggestionAsync(string itemName)
    {
        var history = await repository.GetByNameAsync(itemName.ToLowerInvariant());
        if (history is null) return null;

        return new ItemSuggestionDto
        {
            Name = itemName,
            SuggestedCost = history.LastCost,
            SuggestedExpiryDays = history.DefaultExpiryDays,
            SuggestedUnitId = history.DefaultUnit,
            SuggestedUnit = ((Domain.Enums.FoodUnit)history.DefaultUnit).ToString()
        };
    }
}
