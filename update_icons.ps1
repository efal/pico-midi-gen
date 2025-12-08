$source = "public\icon-192x192.png"
$destBase = "android\app\src\main\res"
$dirs = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
$files = @("ic_launcher.png", "ic_launcher_round.png", "ic_launcher_foreground.png")

foreach ($dir in $dirs) {
    foreach ($file in $files) {
        $destPath = "$destBase\$dir\$file"
        Write-Host "Copying to $destPath"
        Copy-Item $source -Destination $destPath -Force
    }
}
