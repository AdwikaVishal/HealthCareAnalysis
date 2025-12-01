#!/bin/bash

echo "🏥 Starting Health Care Analysis Portal..."
echo ""

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd health-backend-java/health-backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "⚠️  Virtual environment not found. Running setup..."
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
    else
        source venv/bin/activate
    fi
    
    # Start backend in background
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
    BACKEND_PID=$!
    echo "✅ Backend started on http://localhost:8000 (PID: $BACKEND_PID)"
    cd ../..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd FrontEnd
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "⚠️  Node modules not found. Installing dependencies..."
        npm install
    fi
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend started on http://localhost:5173 (PID: $FRONTEND_PID)"
    cd ..
}

# Check if ports are already in use
if check_port 8000; then
    echo "⚠️  Port 8000 is already in use. Please stop the existing backend server."
    exit 1
fi

if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Please stop the existing frontend server."
    exit 1
fi

# Start services
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "🎉 Health Care Analysis Portal is starting up!"
echo ""
echo "📊 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "📁 Sample data file: sample_health_data_wide.csv"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    echo "👋 Goodbye!"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait