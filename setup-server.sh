#!/bin/bash

echo "🏢 Sakan Property Management System - Enhanced Server Setup"
echo "=========================================================="

# Step 1: Check if Docker is running
echo "📋 Step 1: Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi
echo "✅ Docker is running"

# Step 2: Check available ports
echo "📋 Step 2: Checking port availability..."
ports=(3306 4000 5000 8888)
for port in "${ports[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port is already in use"
    else
        echo "✅ Port $port is available"
    fi
done

# Step 3: Stop any running containers
echo "📋 Step 3: Stopping existing containers..."
docker-compose down

# Step 4: Clean up old data (optional)
read -p "Do you want to reset database? (y/N): " cleanData
if [[ $cleanData =~ ^[Yy]$ ]]; then
    echo "🗑️  Cleaning old database data..."
    if [ -d "./database/data" ]; then
        rm -rf ./database/data
        echo "✅ Database data cleaned"
    fi
fi

# Step 5: Build and start containers
echo "📋 Step 4: Building and starting containers..."
docker-compose up -d --build

# Step 6: Wait for database to be ready
echo "📋 Step 5: Waiting for database to initialize..."
maxWait=60
waited=0
while [ $waited -lt $maxWait ]; do
    sleep 5
    waited=$((waited + 5))
    dbHealth=$(docker inspect sakan-mysql --format='{{.State.Health.Status}}')
    echo "⏳ Database status: $dbHealth (${waited}s/${maxWait}s)"
    
    if [ "$dbHealth" = "healthy" ]; then
        break
    fi
done

if [ "$dbHealth" != "healthy" ]; then
    echo "❌ Database failed to start properly. Check logs: docker-compose logs mysql"
    exit 1
fi

echo "✅ Database is ready!"

# Step 7: Create comprehensive test data
echo "📋 Step 6: Creating comprehensive test data..."
docker-compose exec backend node create-sample-data.js

# Step 8: Health checks
echo "📋 Step 7: Running health checks..."

# Check backend health
if curl -s "http://localhost:5000/api/health" > /dev/null; then
    echo "✅ Backend API is responding"
else
    echo "⚠️  Backend API health check failed"
fi

# Check database connection
if curl -s "http://localhost:5000/api/test/customers" > /dev/null; then
    echo "✅ Database connection successful"
else
    echo "⚠️  Database connection test failed"
fi

# Step 9: Show container status
echo "📋 Step 8: Container Status"
docker-compose ps

# Step 10: Show access information
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo "Frontend: http://157.173.198.72:4000"
echo "Backend API: http://157.173.198.72:5000"
echo "phpMyAdmin: http://157.173.198.72:8888"
echo ""
echo "🔑 Login Credentials:"
echo "Admin: admin@sakan.com / 123456"
echo "Customer 1: ahmed@sakan.com / 123456"
echo "Customer 2: sara@sakan.com / 123456"
echo "Customer 3: mahmoud@sakan.com / 123456"
echo ""
echo "📊 System Features:"
echo "• Complete building management"
echo "• Unit and tenant tracking"
echo "• Invoice and payment system"
echo "• Subscription management"
echo "• Comprehensive reporting"
echo ""
echo "🔧 Useful Commands:"
echo "View logs: docker-compose logs -f"
echo "Stop system: docker-compose down"
echo "Restart: docker-compose restart"
echo "Update data: docker-compose exec backend node create-sample-data.js"