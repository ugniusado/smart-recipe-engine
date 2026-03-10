using Microsoft.EntityFrameworkCore;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Application.Services;
using SmartRecipeEngine.Domain.Interfaces;
using SmartRecipeEngine.Infrastructure.Data;
using SmartRecipeEngine.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database - stored in LocalAppData for desktop-style persistence
var dbPath = Path.Combine(
    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
    "SmartRecipeEngine", "app.db");
Directory.CreateDirectory(Path.GetDirectoryName(dbPath)!);
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite($"Data Source={dbPath}"));

// Repositories
builder.Services.AddScoped<IFoodItemRepository, FoodItemRepository>();
builder.Services.AddScoped<IWasteRecordRepository, WasteRecordRepository>();
builder.Services.AddScoped<IPantryStapleRepository, PantryStapleRepository>();
builder.Services.AddScoped<IPriceHistoryRepository, PriceHistoryRepository>();

// Application Services
builder.Services.AddScoped<IFoodItemService, FoodItemService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IPantryStapleService, PantryStapleService>();
builder.Services.AddScoped<IPriceHistoryService, PriceHistoryService>();

// CORS for React dev server
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173", "http://localhost:3000")
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();

// Auto-migrate on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

// Serve React build in production
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");

app.Run();
