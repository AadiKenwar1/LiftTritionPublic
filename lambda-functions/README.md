# Lambda Functions Deployment Guide

This directory contains AWS Lambda functions that proxy API calls to keep sensitive API keys secure on the server.

## Prerequisites

- AWS CLI installed and configured
- AWS credentials configured (`aws configure`)
- Verify credentials: `aws sts get-caller-identity`

## Creating the Lambda Function
- When creating, usually the default settings are good enough
- **Runtime:** Node.js 20.x or 24.x (both work with AWS SDK v3)
- Configure the permissions to allow SecretsManagerReadWrite
- Set the timeout to 45 seconds

## Deployment

**Note:** Both functions now use AWS SDK v3 and require dependencies.

### With dependencies (node_modules) - Required for both functions

```powershell
cd lambda-functions/your-function-name
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
aws lambda update-function-code --function-name YOUR_FUNCTION_NAME --zip-file fileb://function.zip --region YOUR_REGION
Remove-Item function.zip
```

**Important:** Make sure to include `node_modules` in the zip file. The script excludes `.cache` to prevent including unnecessary cache files.

### Quick Deploy Script

Each function folder has a `deploy.ps1` script. Just run:

```powershell
cd lambda-functions/your-function-name
.\deploy.ps1
```

The script handles:
- Installing dependencies
- Creating zip with all files (excluding cache)
- Deploying to Lambda
- Cleaning up

**For functions without dependencies:**
```powershell
Compress-Archive -Path index.js -DestinationPath function.zip -Force
aws lambda update-function-code --function-name YOUR_FUNCTION_NAME --zip-file fileb://function.zip --region YOUR_REGION
Remove-Item function.zip
```

## Troubleshooting

- **Function not found**: Check function name matches exactly (case-sensitive)
- **InvalidSignatureException**: Reconfigure AWS CLI credentials
- **Archive exists**: Use `-Force` flag when creating zip
- **PowerShell && error**: PowerShell doesn't support `&&`, use separate commands or scripts

## Testing

```powershell
aws lambda invoke --function-name YOUR_FUNCTION_NAME --payload '{"body":"{}"}' response.json
cat response.json
```

