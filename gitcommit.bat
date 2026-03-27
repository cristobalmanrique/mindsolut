@echo on

if "%~1"=="" (
  echo Debes enviar un mensaje de commit
  exit /b 1
)

echo Paso 1: Git Add
git add .
Echo Paso 2 Git Commit
git commit -m "%*"
Echo Terminado