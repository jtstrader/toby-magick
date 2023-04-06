$Shell = New-Object -ComObject WScript.Shell
$Location = "$PSScriptRoot\.." | Convert-Path

$TobyShortcut = $Shell.CreateShortcut("$Location\TobyMagick.lnk")
$TobyShortcut.TargetPath = "$Location\TobyMagick.ps1"
$TobyShortcut.IconLocation = "$PSScriptRoot\toby.ico"
$TobyShortcut.Save()

Write-Output "toby-magick: Runnable shortcut created in: $Location"