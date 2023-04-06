$Rebuild = $(git status --porcelain | Measure-Object | Select-Object -expand Count) -gt 0
if ($Rebuild) {
    Set-Location .\web

    Write-Output "toby-magick: Detected git changes! Rebuilding application to be safe..."
    Write-Output "toby-magick: If you want to avoid rebuilds on startup, stash your changes or commit!"
    
    #yarn build | out-null
    
    Set-Location ..
    
    Write-Output "toby-magick: Finished creating optimized production build!"
}

$ROOT = $PSScriptRoot

Start-Job -Name WEB -ScriptBlock { Set-Location $using:ROOT\web; yarn serve -s build; }
Start-Job -Name API -ScriptBlock { Set-Location $using:ROOT\api; Write-Output "In api dir!"; }

# Once jobs are started, load into the chrome page.
Start-Job -Name CHROME -ScriptBlock { Start "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" '--start-fullscreen "http://localhost:3000"'; }

# CTRL-C Signal
[console]::TreatControlCAsInput = $true
while ($true) {
    if ([console]::KeyAvailable) {
        $key = [system.console]::readkey($true)
        if (($key.modifiers -band [consolemodifiers]"control") -and ($key.key -eq "C")) {
            # WEB/API
            Write-Output "`ntoby-magick: Ending current jobs WEB and API..."
            Get-Job | Stop-Job
            Get-Job | Remove-Job

            # CHROME
            Write-Output "toby-magick: Killing chrome window..."
            Stop-Process -Name chrome
            break
        }
    }
}