# Bun 安装脚本 (Windows PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "正在安装 Bun..." -ForegroundColor Cyan

powershell -c "irm bun.sh/install.ps1 | iex"

Write-Host ""
Write-Host "Bun 安装完成！" -ForegroundColor Green
bun --version
