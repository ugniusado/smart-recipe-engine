namespace SmartRecipeEngine.Application.DTOs;

public class ItemSuggestionDto
{
    public string Name { get; set; } = string.Empty;
    public decimal SuggestedCost { get; set; }
    public int SuggestedExpiryDays { get; set; }
    public int SuggestedUnitId { get; set; }
    public string SuggestedUnit { get; set; } = string.Empty;
}
