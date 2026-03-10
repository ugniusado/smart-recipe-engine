namespace SmartRecipeEngine.Application.DTOs;

public class MonthlyReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string MonthName { get; set; } = string.Empty;
    public decimal TotalConsumed { get; set; }
    public decimal TotalWasted { get; set; }
    public decimal TotalSaved => TotalConsumed;
}

public class WasteFrequencyDto
{
    public string ItemName { get; set; } = string.Empty;
    public int TimesWasted { get; set; }
    public int TimesPurchased { get; set; }
    public double WastePercentage { get; set; }
    public decimal TotalValueWasted { get; set; }
}

public class DashboardSummaryDto
{
    public int TotalActiveItems { get; set; }
    public int ExpiredCount { get; set; }
    public int UrgentCount { get; set; }
    public int SafeCount { get; set; }
    public decimal AtRiskValue { get; set; }
    public decimal ExpiredValue { get; set; }
    public int DaysWithoutWaste { get; set; }
    public decimal WeeklySavings { get; set; }
}

public class SavingsMilestoneDto
{
    public int DaysWithoutWaste { get; set; }
    public decimal AmountSaved { get; set; }
    public bool HasMilestone { get; set; }
    public string? MilestoneMessage { get; set; }
}
