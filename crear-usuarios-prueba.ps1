# Script para crear usuarios de prueba en FlowNote
$base = "http://localhost:3000/api"

$usuarios = @(
  @{ nombre="Carlos"; apellido="García"; username="carlos_dev"; email="carlos@flownote.test"; contrasena="Test1234!" },
  @{ nombre="Ana"; apellido="Martínez"; username="ana_design"; email="ana@flownote.test"; contrasena="Test1234!" },
  @{ nombre="Luis"; apellido="Rodríguez"; username="luis_pm"; email="luis@flownote.test"; contrasena="Test1234!" }
)

foreach ($u in $usuarios) {
  try {
    $body = $u | ConvertTo-Json
    $res = Invoke-RestMethod -Method POST -Uri "$base/auth/register" -Body $body -ContentType "application/json"
    Write-Host "✓ Creado: @$($u.username) — contraseña: $($u.contrasena)" -ForegroundColor Green
  } catch {
    Write-Host "⚠ @$($u.username) ya existe o hubo error" -ForegroundColor Yellow
  }
}

Write-Host "`nUsuarios de prueba listos. Puedes iniciar sesión con cualquiera de ellos." -ForegroundColor Cyan
