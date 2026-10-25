@echo off
echo ========================================================
echo   Pushing Earpa Codebase to GitHub
echo   Target: https://github.com/Udbkdszx/EARPA.git
echo ========================================================
git branch -M main
git push -u origin main
echo.
echo Push completed successfully!
pause
