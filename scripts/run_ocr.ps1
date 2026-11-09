Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Globalization.Language, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType=WindowsRuntime] | Out-Null

$dir = "c:\Users\Hp\.gemini\antigravity\scratch\mobile-app-studio\earpa-video\out\gameplay_inspection"
$files = Get-ChildItem -Path $dir -Filter "v*.png" | Where-Object { $_.Name -notmatch "header|buttons" } | Sort-Object Name

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))

function Await-Async($asyncOp) {
    $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod } | Select-Object -First 1
    $targetType = $asyncOp.GetType().GetInterfaces() | Where-Object { $_.IsGenericType -and $_.GetGenericTypeDefinition().FullName -match 'Windows.Foundation.IAsyncOperation' } | ForEach-Object { $_.GetGenericArguments()[0] }
    $asTask = $asTaskGeneric.MakeGenericMethod($targetType)
    $task = $asTask.Invoke($null, @($asyncOp))
    $task.Wait()
    return $task.Result
}

foreach ($f in $files) {
    try {
        $fileStream = [System.IO.File]::OpenRead($f.FullName)
        $memStream = New-Object System.IO.MemoryStream
        $fileStream.CopyTo($memStream)
        $fileStream.Close()
        $memStream.Position = 0
        $randStream = [System.IO.WindowsRuntimeStreamExtensions]::AsRandomAccessStream($memStream)
        $decoder = Await-Async ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($randStream))
        $bitmap = Await-Async ($decoder.GetSoftwareBitmapAsync())
        $res = Await-Async ($engine.RecognizeAsync($bitmap))
        $memStream.Close()
        $cleanText = ($res.Text -replace "`r`n", " | " -replace "`n", " | ")
        Write-Host "[$($f.Name)] $cleanText"
    } catch {
        Write-Host "[$($f.Name)] Error: $_"
    }
}
