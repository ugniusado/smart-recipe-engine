using SmartRecipeEngine.Domain.Enums;

namespace SmartRecipeEngine.Domain.Entities;

public class FoodItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public FoodCategory Category { get; set; }
    public double Quantity { get; set; }
    public FoodUnit Unit { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal Cost { get; set; }
    public FoodItemStatus Status { get; set; } = FoodItemStatus.Active;
    public DateTime? StatusChangedAt { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int DaysRemaining => (ExpiryDate.Date - DateTime.UtcNow.Date).Days;
    public bool IsExpired => DaysRemaining < 0;
    public bool IsUrgent => DaysRemaining >= 0 && DaysRemaining <= 2;   // orange: 0-2 days
    public bool IsSoon   => DaysRemaining >= 3 && DaysRemaining <= 7;   // cyan:   3-7 days
    public bool IsSafe   => DaysRemaining >= 8;                         // green:  8+ days
}
