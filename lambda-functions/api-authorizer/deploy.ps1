# Remove old zip if exists
if (Test-Path function.zip) { Remove-Item function.zip -Force }
# Get all items except zip
$items = Get-ChildItem -Path * -Exclude function.zip
if ($items) {
    $items | Compress-Archive -DestinationPath function.zip
}
aws lambda update-function-code --function-name api-authorizer --zip-file fileb://function.zip --region us-east-1
Remove-Item function.zip
Write-Host "✅ Deployment complete!"




