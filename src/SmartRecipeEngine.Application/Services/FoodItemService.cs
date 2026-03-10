using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Enums;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Application.Services;

public class FoodItemService(
    IFoodItemRepository foodItemRepository,
    IWasteRecordRepository wasteRecordRepository,
    IPriceHistoryRepository priceHistoryRepository) : IFoodItemService
{
    public async Task<IEnumerable<FoodItemDto>> GetAllActiveAsync()
    {
        var items = await foodItemRepository.GetActiveAsync();
        return items.Select(MapToDto);
    }

    public async Task<IEnumerable<FoodItemDto>> GetAllAsync()
    {
        var items = await foodItemRepository.GetAllAsync();
        return items.Select(MapToDto);
    }

    public async Task<FoodItemDto?> GetByIdAsync(int id)
    {
        var item = await foodItemRepository.GetByIdAsync(id);
        return item is null ? null : MapToDto(item);
    }

    public async Task<FoodItemDto> CreateAsync(CreateFoodItemDto dto)
    {
        var item = new FoodItem
        {
            Name = dto.Name,
            Category = (FoodCategory)dto.CategoryId,
            Quantity = dto.Quantity,
            Unit = (FoodUnit)dto.UnitId,
            PurchaseDate = dto.PurchaseDate,
            ExpiryDate = dto.ExpiryDate,
            Cost = dto.Cost,
            Notes = dto.Notes,
            Status = FoodItemStatus.Active,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        var created = await foodItemRepository.AddAsync(item);

        await priceHistoryRepository.UpsertAsync(new ItemPriceHistory
        {
            ItemName = dto.Name.ToLowerInvariant(),
            LastCost = dto.Cost,
            LastPurchased = DateTime.UtcNow,
            DefaultExpiryDays = (dto.ExpiryDate - dto.PurchaseDate).Days,
            DefaultUnit = dto.UnitId
        });

        return MapToDto(created);
    }

    public async Task<FoodItemDto> UpdateAsync(UpdateFoodItemDto dto)
    {
        var item = await foodItemRepository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"FoodItem {dto.Id} not found.");

        item.Name = dto.Name;
        item.Category = (FoodCategory)dto.CategoryId;
        item.Quantity = dto.Quantity;
        item.Unit = (FoodUnit)dto.UnitId;
        item.PurchaseDate = dto.PurchaseDate;
        item.ExpiryDate = dto.ExpiryDate;
        item.Cost = dto.Cost;
        item.Notes = dto.Notes;
        item.UpdatedAt = DateTime.UtcNow;

        var updated = await foodItemRepository.UpdateAsync(item);
        return MapToDto(updated);
    }

    public async Task DeleteAsync(int id) => await foodItemRepository.DeleteAsync(id);

    public async Task<FoodItemDto> ChangeStatusAsync(ChangeStatusDto dto)
    {
        var item = await foodItemRepository.GetByIdAsync(dto.Id)
            ?? throw new KeyNotFoundException($"FoodItem {dto.Id} not found.");

        var newStatus = (FoodItemStatus)dto.StatusId;
        item.Status = newStatus;
        item.StatusChangedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        var updated = await foodItemRepository.UpdateAsync(item);

        if (newStatus is FoodItemStatus.Consumed or FoodItemStatus.Wasted)
        {
            await wasteRecordRepository.AddAsync(new WasteRecord
            {
                ItemName = item.Name,
                Category = item.Category,
                Cost = item.Cost,
                Outcome = newStatus,
                FoodItemId = item.Id,
                RecordedAt = DateTime.UtcNow
            });
        }

        return MapToDto(updated);
    }

    public async Task<IEnumerable<FoodItemDto>> GetUrgentAsync()
    {
        var items = await foodItemRepository.GetUrgentAsync();
        return items.Select(MapToDto);
    }

    public async Task AutoCleanupExpiredAsync()
    {
        var active = await foodItemRepository.GetActiveAsync();
        var oldExpired = active.Where(i => i.DaysRemaining < -3);
        foreach (var item in oldExpired)
        {
            item.Status = FoodItemStatus.Wasted;
            item.StatusChangedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            await foodItemRepository.UpdateAsync(item);
            await wasteRecordRepository.AddAsync(new WasteRecord
            {
                ItemName = item.Name,
                Category = item.Category,
                Cost = item.Cost,
                Outcome = FoodItemStatus.Wasted,
                FoodItemId = item.Id,
                RecordedAt = DateTime.UtcNow
            });
        }
    }

    private static FoodItemDto MapToDto(FoodItem item)
    {
        string urgency = item.IsExpired ? "expired"
            : item.IsUrgent ? "urgent"
            : item.IsSoon   ? "soon"
            : "safe";
        return new FoodItemDto
        {
            Id = item.Id,
            Name = item.Name,
            Category = item.Category.ToString(),
            CategoryId = (int)item.Category,
            Quantity = item.Quantity,
            Unit = item.Unit.ToString(),
            UnitId = (int)item.Unit,
            PurchaseDate = item.PurchaseDate,
            ExpiryDate = item.ExpiryDate,
            Cost = item.Cost,
            Status = item.Status.ToString(),
            StatusId = (int)item.Status,
            DaysRemaining = item.DaysRemaining,
            Urgency = urgency,
            Notes = item.Notes,
            CreatedAt = item.CreatedAt
        };
    }
}
