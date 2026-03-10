using SmartRecipeEngine.Application.DTOs;

namespace SmartRecipeEngine.Application.Interfaces;

public interface IRecipeService
{
    Task<RecipeSearchDto> GetUrgentIngredientSearchAsync(bool includePantryStaples = true);
}
