using Moq;
using SmartRecipeEngine.Application.Services;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Tests;

public class ReportServiceTests
{
    private readonly Mock<IFoodItemRepository> _foodRepo = new();
    private readonly Mock<IWasteRecordRepository> _wasteRepo = new();
    private readonly ReportService _sut;

    public ReportServiceTests()
    {
        _sut = new ReportService(_foodRepo.Object, _wasteRepo.Object);
    }

    private static FoodItem MakeItem(int daysRemaining, decimal cost = 5m) => new()
    {
        Name = "Test",
        Category = FoodCategory.Produce,
        Unit = FoodUnit.Piece,
        Quantity = 1,
        PurchaseDate = DateTime.UtcNow.AddDays(-1),
        ExpiryDate = DateTime.UtcNow.Date.AddDays(daysRemaining),
        Cost = cost,
        Status = FoodItemStatus.Active
    };

    [Fact]
    public async Task GetDashboardSummaryAsync_CountsCorrectly()
    {
        _foodRepo.Setup(r => r.GetActiveAsync()).ReturnsAsync([
            MakeItem(-1),         // expired
            MakeItem(1),          // urgent
            MakeItem(2),          // urgent
            MakeItem(5),          // soon
            MakeItem(10),         // safe
            MakeItem(30),         // safe
        ]);
        _wasteRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([]);

        var result = await _sut.GetDashboardSummaryAsync();

        Assert.Equal(6, result.TotalActiveItems);
        Assert.Equal(1, result.ExpiredCount);
        Assert.Equal(2, result.UrgentCount);
        Assert.Equal(2, result.SafeCount);
    }

    [Fact]
    public async Task GetDashboardSummaryAsync_WeeklySavings_OnlyCountsConsumedThisWeek()
    {
        _foodRepo.Setup(r => r.GetActiveAsync()).ReturnsAsync([]);
        _wasteRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([
            new WasteRecord { ItemName = "Milk", Cost = 3.49m, Outcome = FoodItemStatus.Consumed, RecordedAt = DateTime.UtcNow.AddDays(-2) },
            new WasteRecord { ItemName = "Eggs", Cost = 4.99m, Outcome = FoodItemStatus.Consumed, RecordedAt = DateTime.UtcNow.AddDays(-1) },
            new WasteRecord { ItemName = "Bread", Cost = 2.99m, Outcome = FoodItemStatus.Wasted,   RecordedAt = DateTime.UtcNow.AddDays(-1) }, // wasted — should not count
            new WasteRecord { ItemName = "Chicken", Cost = 8.99m, Outcome = FoodItemStatus.Consumed, RecordedAt = DateTime.UtcNow.AddDays(-10) }, // too old
        ]);

        var result = await _sut.GetDashboardSummaryAsync();

        Assert.Equal(3.49m + 4.99m, result.WeeklySavings);
    }

    [Fact]
    public async Task GetDashboardSummaryAsync_DaysWithoutWaste_IsZeroWhenNoRecords()
    {
        _foodRepo.Setup(r => r.GetActiveAsync()).ReturnsAsync([]);
        _wasteRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([]);

        var result = await _sut.GetDashboardSummaryAsync();

        Assert.Equal(0, result.DaysWithoutWaste);
    }

    [Fact]
    public async Task GetMonthlyReportsAsync_Returns6MonthsByDefault()
    {
        _wasteRepo.Setup(r => r.GetByMonthAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync([]);

        var result = (await _sut.GetMonthlyReportsAsync()).ToList();

        Assert.Equal(6, result.Count);
    }

    [Fact]
    public async Task GetMonthlyReportsAsync_Returns12MonthsWhenRequested()
    {
        _wasteRepo.Setup(r => r.GetByMonthAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync([]);

        var result = (await _sut.GetMonthlyReportsAsync(12)).ToList();

        Assert.Equal(12, result.Count);
    }

    [Fact]
    public async Task GetMonthlyReportsAsync_SumsConsumedAndWastedSeparately()
    {
        var records = new List<WasteRecord>
        {
            new() { ItemName = "A", Cost = 10m, Outcome = FoodItemStatus.Consumed, RecordedAt = DateTime.UtcNow },
            new() { ItemName = "B", Cost = 5m,  Outcome = FoodItemStatus.Wasted,   RecordedAt = DateTime.UtcNow },
        };
        _wasteRepo.Setup(r => r.GetByMonthAsync(It.IsAny<int>(), It.IsAny<int>()))
            .ReturnsAsync(records);

        var result = (await _sut.GetMonthlyReportsAsync(1)).First();

        Assert.Equal(10m, result.TotalConsumed);
        Assert.Equal(5m,  result.TotalWasted);
    }

    [Fact]
    public async Task GetSavingsMilestoneAsync_HasMilestone_After7DaysWithoutWaste()
    {
        _wasteRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([
            new WasteRecord { Outcome = FoodItemStatus.Wasted, RecordedAt = DateTime.UtcNow.AddDays(-10) },
        ]);

        var result = await _sut.GetSavingsMilestoneAsync();

        Assert.True(result.HasMilestone);
        Assert.NotNull(result.MilestoneMessage);
    }

    [Fact]
    public async Task GetSavingsMilestoneAsync_NoMilestone_WhenRecentWaste()
    {
        _wasteRepo.Setup(r => r.GetAllAsync()).ReturnsAsync([
            new WasteRecord { Outcome = FoodItemStatus.Wasted, RecordedAt = DateTime.UtcNow.AddDays(-2) },
        ]);

        var result = await _sut.GetSavingsMilestoneAsync();

        Assert.False(result.HasMilestone);
        Assert.Null(result.MilestoneMessage);
    }
}
