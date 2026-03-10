using SmartRecipeEngine.Application.DTOs;

namespace SmartRecipeEngine.Application.Interfaces;

public interface IFoodItemService
{
    Task<IEnumerable<FoodItemDto>> GetAllActiveAsync();
    Task<IEnumerable<FoodItemDto>> GetAllAsync();
    Task<FoodItemDto?> GetByIdAsync(int id);
    Task<FoodItemDto> CreateAsync(CreateFoodItemDto dto);
    Task<FoodItemDto> UpdateAsync(UpdateFoodItemDto dto);
    Task DeleteAsync(int id);
    Task<FoodItemDto> ChangeStatusAsync(ChangeStatusDto dto);
    Task<IEnumerable<FoodItemDto>> GetUrgentAsync();
    Task AutoCleanupExpiredAsync();
}
