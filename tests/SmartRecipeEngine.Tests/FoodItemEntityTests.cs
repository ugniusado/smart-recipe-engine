using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;

namespace SmartRecipeEngine.Tests;

public class FoodItemEntityTests
{
    private static FoodItem MakeItem(int daysFromNow) => new()
    {
        Name = "Test",
        Category = FoodCategory.Produce,
        Unit = FoodUnit.Piece,
        Quantity = 1,
        PurchaseDate = DateTime.UtcNow.AddDays(-1),
        ExpiryDate = DateTime.UtcNow.Date.AddDays(daysFromNow),
        Cost = 1.00m,
        Status = FoodItemStatus.Active
    };

    [Fact]
    public void IsExpired_WhenExpiryIsYesterday_ReturnsTrue()
    {
        var item = MakeItem(-1);
        Assert.True(item.IsExpired);
        Assert.False(item.IsUrgent);
        Assert.False(item.IsSoon);
        Assert.False(item.IsSafe);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    public void IsUrgent_WhenDaysRemainingIs0To2_ReturnsTrue(int days)
    {
        var item = MakeItem(days);
        Assert.False(item.IsExpired);
        Assert.True(item.IsUrgent);
        Assert.False(item.IsSoon);
        Assert.False(item.IsSafe);
    }

    [Theory]
    [InlineData(3)]
    [InlineData(5)]
    [InlineData(7)]
    public void IsSoon_WhenDaysRemainingIs3To7_ReturnsTrue(int days)
    {
        var item = MakeItem(days);
        Assert.False(item.IsExpired);
        Assert.False(item.IsUrgent);
        Assert.True(item.IsSoon);
        Assert.False(item.IsSafe);
    }

    [Theory]
    [InlineData(8)]
    [InlineData(30)]
    [InlineData(365)]
    public void IsSafe_WhenDaysRemainingIs8OrMore_ReturnsTrue(int days)
    {
        var item = MakeItem(days);
        Assert.False(item.IsExpired);
        Assert.False(item.IsUrgent);
        Assert.False(item.IsSoon);
        Assert.True(item.IsSafe);
    }

    [Fact]
    public void DaysRemaining_ReflectsCorrectValue()
    {
        var item = MakeItem(5);
        Assert.Equal(5, item.DaysRemaining);
    }

    [Fact]
    public void DaysRemaining_IsNegativeWhenExpired()
    {
        var item = MakeItem(-3);
        Assert.True(item.DaysRemaining < 0);
    }
}
