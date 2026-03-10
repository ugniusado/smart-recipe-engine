using Microsoft.AspNetCore.Mvc;
using SmartRecipeEngine.Application.Interfaces;

namespace SmartRecipeEngine.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController(IReportService service) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard() =>
        Ok(await service.GetDashboardSummaryAsync());

    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthly([FromQuery] int months = 6) =>
        Ok(await service.GetMonthlyReportsAsync(months));

    [HttpGet("waste-frequency")]
    public async Task<IActionResult> GetWasteFrequency() =>
        Ok(await service.GetWasteFrequencyAsync());

    [HttpGet("milestones")]
    public async Task<IActionResult> GetMilestones() =>
        Ok(await service.GetSavingsMilestoneAsync());
}
