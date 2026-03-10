using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Application.Services;

public class ReportService(
    IFoodItemRepository foodItemRepository,
    IWasteRecordRepository wasteRecordRepository) : IReportService
{
    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
    {
        var active = (await foodItemRepository.GetActiveAsync()).ToList();
        var expired = active.Where(i => i.IsExpired).ToList();
        var urgent = active.Where(i => i.IsUrgent).ToList();
        var safe = active.Where(i => i.IsSafe).ToList();

        var allRecords = (await wasteRecordRepository.GetAllAsync()).ToList();
        var lastWaste = allRecords
            .Where(r => r.Outcome == FoodItemStatus.Wasted)
            .OrderByDescending(r => r.RecordedAt)
            .FirstOrDefault();

        int daysWithoutWaste = lastWaste is null
            ? (int)(DateTime.UtcNow - (allRecords.FirstOrDefault()?.RecordedAt ?? DateTime.UtcNow)).TotalDays
            : (int)(DateTime.UtcNow - lastWaste.RecordedAt).TotalDays;

        var weekAgo = DateTime.UtcNow.AddDays(-7);
        var weeklySavings = allRecords
            .Where(r => r.Outcome == FoodItemStatus.Consumed && r.RecordedAt >= weekAgo)
            .Sum(r => r.Cost);

        return new DashboardSummaryDto
        {
            TotalActiveItems = active.Count,
            ExpiredCount = expired.Count,
            UrgentCount = urgent.Count,
            SafeCount = safe.Count,
            AtRiskValue = urgent.Sum(i => i.Cost),
            ExpiredValue = expired.Sum(i => i.Cost),
            DaysWithoutWaste = Math.Max(0, daysWithoutWaste),
            WeeklySavings = weeklySavings
        };
    }

    public async Task<IEnumerable<MonthlyReportDto>> GetMonthlyReportsAsync(int months = 6)
    {
        var result = new List<MonthlyReportDto>();
        for (int i = months - 1; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddMonths(-i);
            var records = (await wasteRecordRepository.GetByMonthAsync(date.Year, date.Month)).ToList();
            result.Add(new MonthlyReportDto
            {
                Year = date.Year,
                Month = date.Month,
                MonthName = date.ToString("MMM yyyy"),
                TotalConsumed = records.Where(r => r.Outcome == FoodItemStatus.Consumed).Sum(r => r.Cost),
                TotalWasted = records.Where(r => r.Outcome == FoodItemStatus.Wasted).Sum(r => r.Cost)
            });
        }
        return result;
    }

    public async Task<IEnumerable<WasteFrequencyDto>> GetWasteFrequencyAsync()
    {
        var frequency = await wasteRecordRepository.GetWasteFrequencyAsync();
        var all = (await wasteRecordRepository.GetAllAsync()).ToList();

        var wastedRecords = all.Where(r => r.Outcome == FoodItemStatus.Wasted).ToList();

        return frequency
            .Select(kvp =>
            {
                var totalPurchased = all.Count(r => r.ItemName.Equals(kvp.Key, StringComparison.OrdinalIgnoreCase));
                var totalValueWasted = wastedRecords
                    .Where(r => r.ItemName.Equals(kvp.Key, StringComparison.OrdinalIgnoreCase))
                    .Sum(r => r.Cost);
                return new WasteFrequencyDto
                {
                    ItemName = kvp.Key,
                    TimesWasted = kvp.Value,
                    TimesPurchased = totalPurchased,
                    WastePercentage = totalPurchased > 0 ? Math.Round((double)kvp.Value / totalPurchased * 100, 1) : 0,
                    TotalValueWasted = totalValueWasted
                };
            })
            .OrderByDescending(x => x.WastePercentage);
    }

    public async Task<SavingsMilestoneDto> GetSavingsMilestoneAsync()
    {
        var allRecords = (await wasteRecordRepository.GetAllAsync()).ToList();
        var lastWaste = allRecords
            .Where(r => r.Outcome == FoodItemStatus.Wasted)
            .OrderByDescending(r => r.RecordedAt)
            .FirstOrDefault();

        int days = lastWaste is null ? 0 : (int)(DateTime.UtcNow - lastWaste.RecordedAt).TotalDays;
        var weekAgo = DateTime.UtcNow.AddDays(-7);
        decimal saved = allRecords
            .Where(r => r.Outcome == FoodItemStatus.Consumed && r.RecordedAt >= weekAgo)
            .Sum(r => r.Cost);

        bool hasMilestone = days >= 7;
        string? message = hasMilestone
            ? $"You've gone {days} days without wasting any food! You saved ${saved:F2} this week."
            : null;

        return new SavingsMilestoneDto
        {
            DaysWithoutWaste = days,
            AmountSaved = saved,
            HasMilestone = hasMilestone,
            MilestoneMessage = message
        };
    }
}
