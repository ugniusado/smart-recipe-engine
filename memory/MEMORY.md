# Smart Recipe Engine — Project Memory

## Architecture
- **Clean Architecture** with 4 layers: Domain → Application → Infrastructure → WebAPI
- **React frontend** (Vite + TypeScript) in `/client/`
- **SQLite** database via EF Core, stored in `%LocalAppData%\SmartRecipeEngine\app.db`

## Key Paths
- Solution: `SmartRecipeEngine.sln`
- Domain: `src/SmartRecipeEngine.Domain/`
- Application: `src/SmartRecipeEngine.Application/`
- Infrastructure: `src/SmartRecipeEngine.Infrastructure/`
- WebAPI: `src/SmartRecipeEngine.WebAPI/` (port 5000)
- React: `client/` (dev port 5173, proxies /api to 5000)
- React build output → `src/SmartRecipeEngine.WebAPI/wwwroot/`

## Running
- Dev: `start-dev.bat` (opens 2 terminals)
- API only: `dotnet run` in WebAPI folder
- Frontend only: `npm run dev` in client folder

## Key Features Implemented
- Dashboard with expiry heatmap (red/yellow/green), at-risk ticker, stat cards
- Inventory CRUD with category-grouped card view + bulk-add mode
- FoodItemForm with smart defaults (price memory + category defaults)
- Reports: 6-month bar chart, Wall of Shame, savings milestones
- Recipe Engine: urgent-ingredient search with external links (Google, AllRecipes, Yummly)
- Pantry Staples management (seeded with 8 defaults)
- Auto-cleanup of items expired 3+ days (POST /api/fooditems/auto-cleanup)

## Stack
- .NET 10, EF Core 10, SQLite, Swashbuckle (Swagger)
- React 18, Vite 7, TypeScript, recharts, react-router-dom, lucide-react, axios
