namespace SmartRecipeEngine.Application.DTOs;

public class PantryStapleDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
}

public class CreatePantryStapleDto
{
    public string Name { get; set; } = string.Empty;
}
