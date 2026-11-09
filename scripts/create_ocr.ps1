$psCode = @'
Add-Type -AssemblyName System.Drawing
[Windows.Globalization.Language, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null

$dir = "c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\out\gameplay_inspection"
$files = Get-ChildItem -Path $dir -Filter "v*.png" | Where-Object { $_.Name -notmatch "header|buttons" } | Sort-Object Name

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))

foreach ($f in $files) {
    try {
        $fileStream = [System.IO.File]::OpenRead($f.FullName)
        $memStream = New-Object System.IO.MemoryStream
        $fileStream.CopyTo($memStream)
        $fileStream.Close()
        $memStream.Position = 0
        $randStream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($memStream)
        $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($randStream).GetAwaiter().GetResult()
        $bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()
        $res = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
        $memStream.Close()
        $cleanText = ($res.Text -replace "`r`n", " | " -replace "`n", " | ")
        Write-Host "[$($f.Name)] $cleanText"
    } catch {
        Write-Host "[$($f.Name)] Error: $_"
    }
}
'@

$psCode | Out-File -FilePath "scripts/run_ocr.ps1" -Encoding utf8
