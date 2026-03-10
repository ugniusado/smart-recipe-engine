using SmartRecipeEngine.Application.DTOs;

namespace SmartRecipeEngine.Application.Interfaces;

public interface IReportService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync();
    Task<IEnumerable<MonthlyReportDto>> GetMonthlyReportsAsync(int months = 6);
    Task<IEnumerable<WasteFrequencyDto>> GetWasteFrequencyAsync();
    Task<SavingsMilestoneDto> GetSavingsMilestoneAsync();
}
