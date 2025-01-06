$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir = Split-Path -Parent $scriptPath

if ($Host.Name -eq 'ConsoleHost') {
    # Running as a script
    $filePath = Join-Path $scriptDir "index.html"
} else {
    # Running from an IDE or other host
    $filePath = Join-Path (Get-Location) "index.html"
}

Start-Process "chrome.exe" "file:///$filePath"
