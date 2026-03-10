using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Interfaces;
using SmartRecipeEngine.Infrastructure.Data;

namespace SmartRecipeEngine.Infrastructure.Repositories;

public class PantryStapleRepository(AppDbContext db) : IPantryStapleRepository
{
    public async Task<IEnumerable<PantryStaple>> GetEnabledAsync() =>
        await db.PantryStaples.Where(s => s.IsEnabled).OrderBy(s => s.Name).ToListAsync();

    public async Task<IEnumerable<PantryStaple>> GetAllAsync() =>
        await db.PantryStaples.OrderBy(s => s.Name).ToListAsync();

    public async Task<PantryStaple> AddAsync(PantryStaple staple)
    {
        db.PantryStaples.Add(staple);
        await db.SaveChangesAsync();
        return staple;
    }

    public async Task UpdateAsync(PantryStaple staple)
    {
        db.PantryStaples.Update(staple);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var staple = await db.PantryStaples.FindAsync(id);
        if (staple is not null)
        {
            db.PantryStaples.Remove(staple);
            await db.SaveChangesAsync();
        }
    }
}
