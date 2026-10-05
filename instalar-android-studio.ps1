Write-Host "=== Baixando o Android Studio Oficial ===" -ForegroundColor Green
$url = "https://edgedl.me.gvt1.com/android/studio/install/2026.1.1.10/android-studio-quail1-patch2-windows.exe"
$output = "C:\Users\Lucas Nunes\Downloads\android-studio-setup.exe"

Write-Host "URL: $url"
Write-Host "Destino: $output"
Write-Host "Iniciando download... Por favor, aguarde." -ForegroundColor Yellow

# Executa o download exibindo barra de progresso no terminal
Invoke-WebRequest -Uri $url -OutFile $output -UseBasicParsing

if (Test-Path $output) {
    Write-Host "`n[SUCESSO] Download concluido!" -ForegroundColor Green
    Write-Host "Iniciando o instalador..." -ForegroundColor Green
    Start-Process -FilePath $output
} else {
    Write-Host "`n[ERRO] Falha ao baixar o arquivo. Verifique sua conexao." -ForegroundColor Red
}
