using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;

namespace SmartRecipeEngine.Domain.Interfaces;

public interface IFoodItemRepository
{
    Task<IEnumerable<FoodItem>> GetAllAsync();
    Task<IEnumerable<FoodItem>> GetActiveAsync();
    Task<IEnumerable<FoodItem>> GetByStatusAsync(FoodItemStatus status);
    Task<IEnumerable<FoodItem>> GetUrgentAsync();
    Task<FoodItem?> GetByIdAsync(int id);
    Task<FoodItem> AddAsync(FoodItem item);
    Task<FoodItem> UpdateAsync(FoodItem item);
    Task DeleteAsync(int id);
}
