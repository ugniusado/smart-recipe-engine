using SmartRecipeEngine.Domain.Entities;

namespace SmartRecipeEngine.Domain.Interfaces;

public interface IPantryStapleRepository
{
    Task<IEnumerable<PantryStaple>> GetEnabledAsync();
    Task<IEnumerable<PantryStaple>> GetAllAsync();
    Task<PantryStaple> AddAsync(PantryStaple staple);
    Task UpdateAsync(PantryStaple staple);
    Task DeleteAsync(int id);
}
