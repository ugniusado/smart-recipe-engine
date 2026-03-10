@echo off
echo Starting Smart Recipe Engine...
echo.
echo API: http://localhost:5000
echo Swagger: http://localhost:5000/swagger
echo React Dev: http://localhost:5173
echo.

start "API" cmd /k "cd /d %~dp0src\SmartRecipeEngine.WebAPI && dotnet run --urls http://localhost:5000"
timeout /t 2 /nobreak >nul
start "React" cmd /k "cd /d %~dp0client && npm run dev"
