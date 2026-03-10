namespace SmartRecipeEngine.Domain.Entities;

public class PantryStaple
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; } = true;
}
