@echo off
echo Starting HAD BETTER Backend Server with Uvicorn...
echo.
cd /d %~dp0
uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000
