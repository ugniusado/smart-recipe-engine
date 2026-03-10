using System.ComponentModel.DataAnnotations;

namespace SmartRecipeEngine.Application.DTOs;

public class FoodItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public double Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public int UnitId { get; set; }
    public DateTime PurchaseDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public decimal Cost { get; set; }
    public string Status { get; set; } = string.Empty;
    public int StatusId { get; set; }
    public int DaysRemaining { get; set; }
    public string Urgency { get; set; } = string.Empty; // "expired" | "urgent" | "soon" | "safe"
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateFoodItemDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 7)]
    public int CategoryId { get; set; }

    [Range(0.001, 99_999)]
    public double Quantity { get; set; }

    [Range(1, 10)]
    public int UnitId { get; set; }

    public DateTime PurchaseDate { get; set; }
    public DateTime ExpiryDate { get; set; }

    [Range(0, 9_999.99)]
    public decimal Cost { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class UpdateFoodItemDto
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Range(1, 7)]
    public int CategoryId { get; set; }

    [Range(0.001, 99_999)]
    public double Quantity { get; set; }

    [Range(1, 10)]
    public int UnitId { get; set; }

    public DateTime PurchaseDate { get; set; }
    public DateTime ExpiryDate { get; set; }

    [Range(0, 9_999.99)]
    public decimal Cost { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }
}

public class ChangeStatusDto
{
    public int Id { get; set; }
    public int StatusId { get; set; }
}
