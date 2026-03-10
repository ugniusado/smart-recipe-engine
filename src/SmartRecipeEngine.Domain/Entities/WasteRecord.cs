using SmartRecipeEngine.Domain.Enums;

namespace SmartRecipeEngine.Domain.Entities;

public class WasteRecord
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public FoodCategory Category { get; set; }
    public decimal Cost { get; set; }
    public FoodItemStatus Outcome { get; set; }
    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public int FoodItemId { get; set; }
}
