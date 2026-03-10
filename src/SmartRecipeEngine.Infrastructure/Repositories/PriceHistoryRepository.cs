using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Interfaces;
using SmartRecipeEngine.Infrastructure.Data;

namespace SmartRecipeEngine.Infrastructure.Repositories;

public class PriceHistoryRepository(AppDbContext db) : IPriceHistoryRepository
{
    public async Task<ItemPriceHistory?> GetByNameAsync(string itemName) =>
        await db.ItemPriceHistories
            .FirstOrDefaultAsync(h => h.ItemName == itemName.ToLowerInvariant());

    public async Task UpsertAsync(ItemPriceHistory history)
    {
        var existing = await db.ItemPriceHistories
            .FirstOrDefaultAsync(h => h.ItemName == history.ItemName);

        if (existing is null)
        {
            db.ItemPriceHistories.Add(history);
        }
        else
        {
            existing.LastCost = history.LastCost;
            existing.LastPurchased = history.LastPurchased;
            existing.DefaultExpiryDays = history.DefaultExpiryDays;
            existing.DefaultUnit = history.DefaultUnit;
        }
        await db.SaveChangesAsync();
    }

    public async Task<IEnumerable<ItemPriceHistory>> GetAllAsync() =>
        await db.ItemPriceHistories.OrderBy(h => h.ItemName).ToListAsync();
}
