#!/bin/bash

# Development Container Management Script
# Usage: ./dev-container.sh [command]

set -e

COMPOSE_FILE="docker-compose.dev.yml"

case "$1" in
    "start")
        echo "🚀 Starting development containers..."
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Containers started!"
        echo "🌐 Frontend: http://localhost:8080"
        echo "🔧 Backend: http://localhost:8000"
        ;;
    
    "stop")
        echo "🛑 Stopping development containers..."
        docker-compose -f $COMPOSE_FILE down
        echo "✅ Containers stopped!"
        ;;
    
    "restart")
        echo "🔄 Restarting development containers..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Containers restarted!"
        ;;
    
    "rebuild")
        echo "🏗️ Rebuilding and starting containers..."
        docker-compose -f $COMPOSE_FILE down
        docker-compose -f $COMPOSE_FILE build --no-cache
        docker-compose -f $COMPOSE_FILE up -d
        echo "✅ Containers rebuilt and started!"
        ;;
    
    "logs")
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            echo "📋 Showing logs for all services..."
            docker-compose -f $COMPOSE_FILE logs -f
        else
            echo "📋 Showing logs for $SERVICE..."
            docker-compose -f $COMPOSE_FILE logs -f $SERVICE
        fi
        ;;
    
    "status")
        echo "📊 Container status:"
        docker-compose -f $COMPOSE_FILE ps
        ;;
    
    "shell")
        SERVICE=${2:-"backend"}
        echo "🐚 Opening shell in $SERVICE container..."
        docker-compose -f $COMPOSE_FILE exec $SERVICE /bin/bash
        ;;
    
    *)
        echo "🐳 Development Container Management"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  start     - Start all development containers"
        echo "  stop      - Stop all development containers" 
        echo "  restart   - Restart all development containers"
        echo "  rebuild   - Rebuild and start containers (use after code changes)"
        echo "  logs      - Show logs (optional: specify service name)"
        echo "  status    - Show container status"
        echo "  shell     - Open shell in container (default: backend)"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs backend"
        echo "  $0 shell frontend"
        ;;
esac 