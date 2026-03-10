using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;
using SmartRecipeEngine.Infrastructure.Data;

namespace SmartRecipeEngine.Infrastructure.Repositories;

public class WasteRecordRepository(AppDbContext db) : IWasteRecordRepository
{
    public async Task<IEnumerable<WasteRecord>> GetAllAsync() =>
        await db.WasteRecords.OrderByDescending(r => r.RecordedAt).ToListAsync();

    public async Task<IEnumerable<WasteRecord>> GetByMonthAsync(int year, int month) =>
        await db.WasteRecords
            .Where(r => r.RecordedAt.Year == year && r.RecordedAt.Month == month)
            .ToListAsync();

    public async Task<WasteRecord> AddAsync(WasteRecord record)
    {
        db.WasteRecords.Add(record);
        await db.SaveChangesAsync();
        return record;
    }

    public async Task<Dictionary<string, int>> GetWasteFrequencyAsync()
    {
        return await db.WasteRecords
            .Where(r => r.Outcome == FoodItemStatus.Wasted)
            .GroupBy(r => r.ItemName)
            .Select(g => new { Name = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Name, x => x.Count);
    }
}
