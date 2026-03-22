@echo off

if "%~1"=="" (
  echo Debes enviar un mensaje de commit
  exit /b 1
)

git add .
git commit -m "%*"