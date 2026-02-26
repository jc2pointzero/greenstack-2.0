# 1. Stage all JSX/CSS changes
git add .

# 2. Commit with a timestamp
$date = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Stable Build: $date"

# 3. Push to the cloud (if you have a remote set up)
# git push origin main

Write-Host "✅ Smyrna HQ Code Locked and Loaded!" -ForegroundColor Green