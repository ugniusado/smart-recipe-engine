using SmartRecipeEngine.Domain.Entities;

namespace SmartRecipeEngine.Domain.Interfaces;

public interface IWasteRecordRepository
{
    Task<IEnumerable<WasteRecord>> GetAllAsync();
    Task<IEnumerable<WasteRecord>> GetByMonthAsync(int year, int month);
    Task<WasteRecord> AddAsync(WasteRecord record);
    Task<Dictionary<string, int>> GetWasteFrequencyAsync();
}
