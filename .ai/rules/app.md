---
paths:
  - 'app/**/*.php'
---

# App

## Strip UTF-8 BOM when writing multiple PHP files
When generating several PHP/Blade files via scripting/here-strings, PowerShell can write a UTF-8 BOM at the top of each file, causing the fatal "Namespace declaration statement has to be the very first statement" error on the first line even though the file looks fine. If that happens, strip BOMs from all source files with: `$enc = New-Object System.Text.UTF8Encoding($false); Get-ChildItem app,routes,tests,database,resources -Recurse -Include *.php,*.blade.php | ForEach-Object { $b=[IO.File]::ReadAllBytes($_.FullName); if($b.Count-ge 3 -and $b[0]-eq 239 -and $b[1]-eq 187 -and $b[2]-eq 191){ $t=[IO.File]::ReadAllText($_.FullName); [IO.File]::WriteAllText($_.FullName,$t,$enc) } }`. Verify with first bytes `60,63,112` (<?p).
