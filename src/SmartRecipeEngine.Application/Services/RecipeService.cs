using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Application.Services;

public class RecipeService(
    IFoodItemRepository foodItemRepository,
    IPantryStapleRepository pantryStapleRepository) : IRecipeService
{
    public async Task<RecipeSearchDto> GetUrgentIngredientSearchAsync(bool includePantryStaples = true)
    {
        var urgent = (await foodItemRepository.GetUrgentAsync()).ToList();
        var urgentNames = urgent.Select(i => i.Name).ToList();

        var staples = new List<string>();
        if (includePantryStaples)
        {
            var pantryStaples = await pantryStapleRepository.GetEnabledAsync();
            staples = pantryStaples.Select(s => s.Name).ToList();
        }

        var query = string.Join(", ", urgentNames);
        var encoded = Uri.EscapeDataString(query + " recipe");
        var searchUrl = $"https://www.google.com/search?q={encoded}";

        return new RecipeSearchDto
        {
            UrgentIngredients = urgentNames,
            PantryStaples = staples,
            SearchQuery = query,
            SearchUrl = searchUrl
        };
    }
}
