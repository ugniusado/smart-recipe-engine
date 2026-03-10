using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Domain.Entities;

namespace SmartRecipeEngine.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<FoodItem> FoodItems => Set<FoodItem>();
    public DbSet<WasteRecord> WasteRecords => Set<WasteRecord>();
    public DbSet<PantryStaple> PantryStaples => Set<PantryStaple>();
    public DbSet<ItemPriceHistory> ItemPriceHistories => Set<ItemPriceHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FoodItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Cost).HasColumnType("decimal(10,2)");
            e.Ignore(x => x.DaysRemaining);
            e.Ignore(x => x.IsExpired);
            e.Ignore(x => x.IsUrgent);
            e.Ignore(x => x.IsSafe);
        });

        modelBuilder.Entity<WasteRecord>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ItemName).IsRequired().HasMaxLength(200);
            e.Property(x => x.Cost).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<PantryStaple>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<ItemPriceHistory>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.ItemName).IsRequired().HasMaxLength(200);
            e.Property(x => x.LastCost).HasColumnType("decimal(10,2)");
            e.HasIndex(x => x.ItemName).IsUnique();
        });

        // Seed default pantry staples
        modelBuilder.Entity<PantryStaple>().HasData(
            new PantryStaple { Id = 1, Name = "Salt", IsEnabled = true },
            new PantryStaple { Id = 2, Name = "Pepper", IsEnabled = true },
            new PantryStaple { Id = 3, Name = "Olive Oil", IsEnabled = true },
            new PantryStaple { Id = 4, Name = "Flour", IsEnabled = true },
            new PantryStaple { Id = 5, Name = "Sugar", IsEnabled = true },
            new PantryStaple { Id = 6, Name = "Butter", IsEnabled = true },
            new PantryStaple { Id = 7, Name = "Garlic", IsEnabled = true },
            new PantryStaple { Id = 8, Name = "Onion", IsEnabled = true }
        );
    }
}
