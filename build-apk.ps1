Write-Host "=== Iniciando Compilacao do APK do App OS ===" -ForegroundColor Green

# Define a variavel JAVA_HOME apontando para o Java do Android Studio
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Define a variavel ANDROID_HOME apontando para o SDK do Android
$env:ANDROID_HOME = "C:\Users\Lucas Nunes\AppData\Local\Android\Sdk"

# 1. Copia e sincroniza os recursos estaticos da pasta www para a pasta nativa do Android
Write-Host "Sincronizando recursos web (www) com o projeto Android..." -ForegroundColor Yellow
npx cap sync android

# 2. Navega para a pasta do projeto Android nativo
Write-Host "Entrando no diretorio nativo Android e compilando com o Gradle..." -ForegroundColor Yellow
cd android

# 3. Executa a compilacao Gradle local do APK em modo Debug
.\gradlew.bat assembleDebug

# 4. Copia o APK gerado para a Area de Trabalho do usuario para facilitar o acesso
$sourceApk = "app/build/outputs/apk/debug/app-debug.apk"
$destApk = "C:\Users\Lucas Nunes\Desktop\app-os-debug.apk"

if (Test-Path $sourceApk) {
    Copy-Item -Path $sourceApk -Destination $destApk -Force
    Write-Host "`n[SUCESSO] APK compilado e entregue na sua Area de Trabalho!" -ForegroundColor Green
    Write-Host "Caminho: $destApk" -ForegroundColor Green
} else {
    Write-Host "`n[ERRO] O Gradle nao gerou o APK. Por favor, verifique os logs acima para erros de compilacao." -ForegroundColor Red
}

cd ..
