param(
  [Parameter(Mandatory = $true)]
  [string]$Artifact
)

$ErrorActionPreference = 'Stop'

Write-Host "SHA-256"
Get-FileHash $Artifact -Algorithm SHA256 | Format-List

Write-Host "Authenticode"
$signature = Get-AuthenticodeSignature $Artifact
$signature | Format-List

if ($signature.Status -ne 'Valid') {
  throw "Artifact signature is not valid: $($signature.Status)"
}

if (Get-Command signtool.exe -ErrorAction SilentlyContinue) {
  signtool.exe verify /pa /all /v $Artifact
}
