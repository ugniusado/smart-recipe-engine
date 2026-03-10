using SmartRecipeEngine.Application.DTOs;
using SmartRecipeEngine.Application.Interfaces;
using SmartRecipeEngine.Domain.Entities;
using SmartRecipeEngine.Domain.Interfaces;

namespace SmartRecipeEngine.Application.Services;

public class PantryStapleService(IPantryStapleRepository repository) : IPantryStapleService
{
    public async Task<IEnumerable<PantryStapleDto>> GetAllAsync()
    {
        var items = await repository.GetAllAsync();
        return items.Select(s => new PantryStapleDto { Id = s.Id, Name = s.Name, IsEnabled = s.IsEnabled });
    }

    public async Task<PantryStapleDto> CreateAsync(CreatePantryStapleDto dto)
    {
        var staple = await repository.AddAsync(new PantryStaple { Name = dto.Name, IsEnabled = true });
        return new PantryStapleDto { Id = staple.Id, Name = staple.Name, IsEnabled = staple.IsEnabled };
    }

    public async Task ToggleAsync(int id)
    {
        var all = await repository.GetAllAsync();
        var staple = all.FirstOrDefault(s => s.Id == id)
            ?? throw new KeyNotFoundException($"PantryStaple {id} not found.");
        staple.IsEnabled = !staple.IsEnabled;
        await repository.UpdateAsync(staple);
    }

    public async Task DeleteAsync(int id) => await repository.DeleteAsync(id);
}
