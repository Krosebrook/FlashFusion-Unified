$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("C:\Users\kyler\Desktop\FlashFusion-United.lnk")
$Shortcut.TargetPath = "C:\Users\kyler\Downloads\flashfusion-united\start-flashfusion.bat"
$Shortcut.WorkingDirectory = "C:\Users\kyler\Downloads\flashfusion-united"
$Shortcut.Description = "FlashFusion-United Development Environment with Cursor IDE"
$Shortcut.IconLocation = "shell32.dll,283"
$Shortcut.Save()

Write-Host "✅ Desktop shortcut created successfully!"