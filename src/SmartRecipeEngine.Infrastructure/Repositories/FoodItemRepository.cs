using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;
using SmartRecipeEngine.Infrastructure.Data;

namespace SmartRecipeEngine.Infrastructure.Repositories;

public class FoodItemRepository(AppDbContext db) : IFoodItemRepository
{
    public async Task<IEnumerable<FoodItem>> GetAllAsync() =>
        await db.FoodItems.OrderBy(i => i.ExpiryDate).ToListAsync();

    public async Task<IEnumerable<FoodItem>> GetActiveAsync() =>
        await db.FoodItems
            .Where(i => i.Status == FoodItemStatus.Active)
            .OrderBy(i => i.ExpiryDate)
            .ToListAsync();

    public async Task<IEnumerable<FoodItem>> GetByStatusAsync(FoodItemStatus status) =>
        await db.FoodItems.Where(i => i.Status == status).OrderBy(i => i.ExpiryDate).ToListAsync();

    public async Task<IEnumerable<FoodItem>> GetUrgentAsync()
    {
        var cutoff = DateTime.UtcNow.Date.AddDays(2);
        return await db.FoodItems
            .Where(i => i.Status == FoodItemStatus.Active && i.ExpiryDate.Date <= cutoff)
            .OrderBy(i => i.ExpiryDate)
            .ToListAsync();
    }

    public async Task<FoodItem?> GetByIdAsync(int id) =>
        await db.FoodItems.FindAsync(id);

    public async Task<FoodItem> AddAsync(FoodItem item)
    {
        db.FoodItems.Add(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task<FoodItem> UpdateAsync(FoodItem item)
    {
        db.FoodItems.Update(item);
        await db.SaveChangesAsync();
        return item;
    }

    public async Task DeleteAsync(int id)
    {
        var item = await db.FoodItems.FindAsync(id);
        if (item is not null)
        {
            db.FoodItems.Remove(item);
            await db.SaveChangesAsync();
        }
    }
}
