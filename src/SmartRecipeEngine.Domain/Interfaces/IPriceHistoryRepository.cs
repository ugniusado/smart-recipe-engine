using SmartRecipeEngine.Domain.Entities;

namespace SmartRecipeEngine.Domain.Interfaces;

public interface IPriceHistoryRepository
{
    Task<ItemPriceHistory?> GetByNameAsync(string itemName);
    Task UpsertAsync(ItemPriceHistory history);
    Task<IEnumerable<ItemPriceHistory>> GetAllAsync();
}
