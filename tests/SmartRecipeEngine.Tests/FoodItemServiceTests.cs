using Moq;
using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Services;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Tests;

public class FoodItemServiceTests
{
    private readonly Mock<IFoodItemRepository> _foodRepo = new();
    private readonly Mock<IWasteRecordRepository> _wasteRepo = new();
    private readonly Mock<IPriceHistoryRepository> _priceRepo = new();
    private readonly FoodItemService _sut;

    public FoodItemServiceTests()
    {
        _sut = new FoodItemService(_foodRepo.Object, _wasteRepo.Object, _priceRepo.Object);
    }

    private static FoodItem MakeActiveItem(int id = 1, decimal cost = 5.00m) => new()
    {
        Id = id,
        Name = "Milk",
        Category = FoodCategory.Dairy,
        Unit = FoodUnit.Liter,
        Quantity = 1,
        PurchaseDate = DateTime.UtcNow.AddDays(-2),
        ExpiryDate = DateTime.UtcNow.AddDays(3),
        Cost = cost,
        Status = FoodItemStatus.Active
    };

    [Fact]
    public async Task ChangeStatusAsync_ToConsumed_CreatesWasteRecord()
    {
        var item = MakeActiveItem();
        _foodRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _foodRepo.Setup(r => r.UpdateAsync(It.IsAny<FoodItem>())).ReturnsAsync(item);
        _wasteRepo.Setup(r => r.AddAsync(It.IsAny<WasteRecord>())).ReturnsAsync(new WasteRecord());

        await _sut.ChangeStatusAsync(new ChangeStatusDto { Id = 1, StatusId = (int)FoodItemStatus.Consumed });

        _wasteRepo.Verify(r => r.AddAsync(It.Is<WasteRecord>(w =>
            w.ItemName == "Milk" &&
            w.Outcome == FoodItemStatus.Consumed &&
            w.Cost == 5.00m)), Times.Once);
    }

    [Fact]
    public async Task ChangeStatusAsync_ToWasted_CreatesWasteRecord()
    {
        var item = MakeActiveItem(cost: 8.99m);
        _foodRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _foodRepo.Setup(r => r.UpdateAsync(It.IsAny<FoodItem>())).ReturnsAsync(item);
        _wasteRepo.Setup(r => r.AddAsync(It.IsAny<WasteRecord>())).ReturnsAsync(new WasteRecord());

        await _sut.ChangeStatusAsync(new ChangeStatusDto { Id = 1, StatusId = (int)FoodItemStatus.Wasted });

        _wasteRepo.Verify(r => r.AddAsync(It.Is<WasteRecord>(w =>
            w.Outcome == FoodItemStatus.Wasted &&
            w.Cost == 8.99m)), Times.Once);
    }

    [Fact]
    public async Task ChangeStatusAsync_ToActive_DoesNotCreateWasteRecord()
    {
        var item = MakeActiveItem();
        _foodRepo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(item);
        _foodRepo.Setup(r => r.UpdateAsync(It.IsAny<FoodItem>())).ReturnsAsync(item);

        await _sut.ChangeStatusAsync(new ChangeStatusDto { Id = 1, StatusId = (int)FoodItemStatus.Active });

        _wasteRepo.Verify(r => r.AddAsync(It.IsAny<WasteRecord>()), Times.Never);
    }

    [Fact]
    public async Task ChangeStatusAsync_UnknownId_ThrowsKeyNotFoundException()
    {
        _foodRepo.Setup(r => r.GetByIdAsync(99)).ReturnsAsync((FoodItem?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            _sut.ChangeStatusAsync(new ChangeStatusDto { Id = 99, StatusId = 2 }));
    }

    [Fact]
    public async Task AutoCleanupExpiredAsync_MarksOldExpiredAsWasted()
    {
        var oldExpired = new FoodItem
        {
            Id = 1,
            Name = "Banana",
            Category = FoodCategory.Produce,
            Unit = FoodUnit.Piece,
            Quantity = 1,
            PurchaseDate = DateTime.UtcNow.AddDays(-10),
            ExpiryDate = DateTime.UtcNow.AddDays(-4), // 4 days expired > threshold of 3
            Cost = 1.49m,
            Status = FoodItemStatus.Active
        };
        var recentExpired = new FoodItem
        {
            Id = 2,
            Name = "Eggs",
            Category = FoodCategory.Dairy,
            Unit = FoodUnit.Dozen,
            Quantity = 1,
            PurchaseDate = DateTime.UtcNow.AddDays(-5),
            ExpiryDate = DateTime.UtcNow.AddDays(-1), // only 1 day expired, should NOT be cleaned
            Cost = 4.99m,
            Status = FoodItemStatus.Active
        };

        _foodRepo.Setup(r => r.GetActiveAsync()).ReturnsAsync([oldExpired, recentExpired]);
        _foodRepo.Setup(r => r.UpdateAsync(It.IsAny<FoodItem>())).ReturnsAsync((FoodItem f) => f);
        _wasteRepo.Setup(r => r.AddAsync(It.IsAny<WasteRecord>())).ReturnsAsync(new WasteRecord());

        await _sut.AutoCleanupExpiredAsync();

        // Only the item expired more than 3 days ago should be cleaned
        _foodRepo.Verify(r => r.UpdateAsync(It.Is<FoodItem>(i => i.Id == 1)), Times.Once);
        _foodRepo.Verify(r => r.UpdateAsync(It.Is<FoodItem>(i => i.Id == 2)), Times.Never);
        _wasteRepo.Verify(r => r.AddAsync(It.IsAny<WasteRecord>()), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_UpsertsPriceHistory()
    {
        var dto = new CreateFoodItemDto
        {
            Name = "Chicken",
            CategoryId = (int)FoodCategory.Meat,
            UnitId = (int)FoodUnit.Kilogram,
            Quantity = 1,
            PurchaseDate = DateTime.UtcNow,
            ExpiryDate = DateTime.UtcNow.AddDays(3),
            Cost = 8.99m
        };
        var created = new FoodItem { Id = 1, Name = dto.Name, Category = FoodCategory.Meat, Unit = FoodUnit.Kilogram, Quantity = 1, PurchaseDate = dto.PurchaseDate, ExpiryDate = dto.ExpiryDate, Cost = dto.Cost, Status = FoodItemStatus.Active };
        _foodRepo.Setup(r => r.AddAsync(It.IsAny<FoodItem>())).ReturnsAsync(created);
        _priceRepo.Setup(r => r.UpsertAsync(It.IsAny<ItemPriceHistory>())).Returns(Task.CompletedTask);

        await _sut.CreateAsync(dto);

        _priceRepo.Verify(r => r.UpsertAsync(It.Is<ItemPriceHistory>(h =>
            h.ItemName == "chicken" && h.LastCost == 8.99m)), Times.Once);
    }
}
