# Sakan Property Management System - Enhanced Server Setup (PowerShell)
Write-Host "🏢 Sakan Property Management System - Enhanced Setup" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Step 1: Check if Docker is running
Write-Host "📋 Step 1: Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Step 2: Check available ports
Write-Host "📋 Step 2: Checking port availability..." -ForegroundColor Yellow
$ports = @(3306, 4000, 5000, 8888)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "⚠️  Port $port is already in use" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port $port is available" -ForegroundColor Green
    }
}

# Step 3: Stop any running containers
Write-Host "📋 Step 3: Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Step 4: Clean up old data (optional)
$cleanData = Read-Host "Do you want to reset database? (y/N)"
if ($cleanData -eq 'y' -or $cleanData -eq 'Y') {
    Write-Host "🗑️  Cleaning old database data..." -ForegroundColor Yellow
    if (Test-Path ".\database\data") {
        Remove-Item ".\database\data" -Recurse -Force
        Write-Host "✅ Database data cleaned" -ForegroundColor Green
    }
}

# Step 5: Build and start containers
Write-Host "📋 Step 4: Building and starting containers..." -ForegroundColor Yellow
docker-compose up -d --build

# Step 6: Wait for database to be ready
Write-Host "📋 Step 5: Waiting for database to initialize..." -ForegroundColor Yellow
$maxWait = 60
$waited = 0
do {
    Start-Sleep -Seconds 5
    $waited += 5
    $dbHealth = docker inspect sakan-mysql --format='{{.State.Health.Status}}'
    Write-Host "⏳ Database status: $dbHealth (${waited}s/${maxWait}s)" -ForegroundColor Gray
} while ($dbHealth -ne "healthy" -and $waited -lt $maxWait)

if ($dbHealth -ne "healthy") {
    Write-Host "❌ Database failed to start properly. Check logs: docker-compose logs mysql" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database is ready!" -ForegroundColor Green

# Step 7: Create comprehensive test data
Write-Host "📋 Step 6: Creating comprehensive test data..." -ForegroundColor Yellow
docker-compose exec backend node create-sample-data.js

# Step 8: Health checks
Write-Host "📋 Step 7: Running health checks..." -ForegroundColor Yellow

# Check backend health
try {
    $backendHealth = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 10
    Write-Host "✅ Backend API is responding" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend API health check failed" -ForegroundColor Yellow
}

# Check database connection
try {
    $dbTest = Invoke-RestMethod -Uri "http://localhost:5000/api/test/customers" -TimeoutSec 10
    Write-Host "✅ Database connection successful. Found $($dbTest.count) customers" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database connection test failed" -ForegroundColor Yellow
}

# Step 9: Show container status
Write-Host "📋 Step 8: Container Status" -ForegroundColor Yellow
docker-compose ps

# Step 10: Show access information
Write-Host ""
Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Frontend: http://157.173.198.72:4000" -ForegroundColor Cyan
Write-Host "Backend API: http://157.173.198.72:5000" -ForegroundColor Cyan
Write-Host "phpMyAdmin: http://157.173.198.72:8888" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Login Credentials:" -ForegroundColor Yellow
Write-Host "Admin: admin@sakan.com / 123456" -ForegroundColor White
Write-Host "Customer 1: ahmed@sakan.com / 123456" -ForegroundColor White  
Write-Host "Customer 2: sara@sakan.com / 123456" -ForegroundColor White
Write-Host "Customer 3: mahmoud@sakan.com / 123456" -ForegroundColor White
Write-Host ""
Write-Host "📊 System Features:" -ForegroundColor Yellow
Write-Host "• Complete building management" -ForegroundColor Gray
Write-Host "• Unit and tenant tracking" -ForegroundColor Gray  
Write-Host "• Invoice and payment system" -ForegroundColor Gray
Write-Host "• Subscription management" -ForegroundColor Gray
Write-Host "• Comprehensive reporting" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Yellow
Write-Host "View logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "Stop system: docker-compose down" -ForegroundColor Gray
Write-Host "Restart: docker-compose restart" -ForegroundColor Gray
Write-Host "Update data: docker-compose exec backend node create-sample-data.js" -ForegroundColor Gray