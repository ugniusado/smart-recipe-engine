namespace SmartRecipeEngine.Domain.Entities;

public class ItemPriceHistory
{
    public int Id { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal LastCost { get; set; }
    public DateTime LastPurchased { get; set; }
    public int DefaultExpiryDays { get; set; }
    public int DefaultUnit { get; set; }
}
