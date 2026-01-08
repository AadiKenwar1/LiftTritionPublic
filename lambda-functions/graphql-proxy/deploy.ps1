npm install
# Remove old zip if exists
if (Test-Path function.zip) { Remove-Item function.zip -Force }
# Get all items except zip and node_modules
$items = Get-ChildItem -Path * -Exclude function.zip,node_modules
if ($items) {
    $items | Compress-Archive -DestinationPath function.zip
}
# Add node_modules excluding .cache
if (Test-Path node_modules) {
    Get-ChildItem -Path node_modules -Exclude .cache | Compress-Archive -Update -DestinationPath function.zip
}
aws lambda update-function-code --function-name graphql-proxy --zip-file fileb://function.zip --region us-east-1
Remove-Item function.zip
Write-Host "✅ Deployment complete!"




