namespace SmartRecipeEngine.Application.DTOs;

public class RecipeSearchDto
{
    public List<string> UrgentIngredients { get; set; } = new();
    public List<string> PantryStaples { get; set; } = new();
    public string SearchUrl { get; set; } = string.Empty;
    public string SearchQuery { get; set; } = string.Empty;
}
