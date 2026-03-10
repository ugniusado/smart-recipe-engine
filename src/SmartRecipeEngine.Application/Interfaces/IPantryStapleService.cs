using SmartRecipeEngine.Application.DTOs;

namespace SmartRecipeEngine.Application.Interfaces;

public interface IPantryStapleService
{
    Task<IEnumerable<PantryStapleDto>> GetAllAsync();
    Task<PantryStapleDto> CreateAsync(CreatePantryStapleDto dto);
    Task ToggleAsync(int id);
    Task DeleteAsync(int id);
}
