# Docker Development Setup

This document describes the containerized development environment for the "What's the Chance?" game.

## 📦 Container Setup

### Services

- **Backend**: FastAPI application with hot reload
- **Frontend**: React/Vite application with hot reload
- **Redis**: High-performance caching and session storage
- **Network**: Custom bridge network for inter-service communication

### Files Created

- `backend/Dockerfile.dev` - Development backend container
- `Dockerfile.frontend` - Development frontend container
- `docker-compose.dev.yml` - Docker Compose configuration
- `dev-container.sh` - Container management script

## 🚀 Quick Start

### Start Development Environment

```bash
./dev-container.sh start
```

### Stop Development Environment

```bash
./dev-container.sh stop
```

### Rebuild After Code Changes

```bash
./dev-container.sh rebuild
```

## 📋 Available Commands

| Command                              | Description                         |
| ------------------------------------ | ----------------------------------- |
| `./dev-container.sh start`           | Start all containers                |
| `./dev-container.sh stop`            | Stop all containers                 |
| `./dev-container.sh restart`         | Restart all containers              |
| `./dev-container.sh rebuild`         | Rebuild and start containers        |
| `./dev-container.sh status`          | Show container status               |
| `./dev-container.sh logs [service]`  | Show logs (all or specific service) |
| `./dev-container.sh shell [service]` | Open shell in container             |

## 🌐 Access Points

- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs
- **Redis**: localhost:6379 (for debugging tools)

## 🔄 Development Workflow

### After Making Changes

1. **Code changes are automatically picked up** via volume mounts
2. **For dependency changes** (package.json, requirements.txt):
   ```bash
   ./dev-container.sh rebuild
   ```

### Viewing Logs

```bash
# All services
./dev-container.sh logs

# Specific service
./dev-container.sh logs frontend
./dev-container.sh logs backend
```

### Debugging

```bash
# Open shell in backend container
./dev-container.sh shell backend

# Open shell in frontend container
./dev-container.sh shell frontend
```

## 📁 Volume Mounts

- **Backend**: `./backend:/app` - Full backend directory with hot reload
- **Frontend**: `.:/app` - Full project directory with hot reload
- **Node Modules**: `/app/node_modules` - Prevents conflicts with host

## 🔧 Configuration

### Environment Variables

- Backend: Uses `./backend/.env` file
- Frontend: `VITE_API_URL=http://backend:8000` (internal network)

### Network

- Custom bridge network `app-network`
- Services communicate via service names (e.g., `backend:8000`)

## 🐛 Troubleshooting

### Container Won't Start

```bash
./dev-container.sh logs [service]
```

### Port Conflicts

- Backend uses port 8000
- Frontend uses port 8080
- Redis uses port 6379
- Ensure these ports are available on your host

### Dependency Issues

```bash
./dev-container.sh rebuild
```

### Reset Everything

```bash
./dev-container.sh stop
docker system prune -f
./dev-container.sh rebuild
```

## 📊 Container Details

### Backend Container

- **Base**: Python 3.9-slim
- **Port**: 8000
- **Command**: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
- **Hot Reload**: ✅ Enabled

### Frontend Container

- **Base**: Node 20-alpine
- **Port**: 8080
- **Command**: `npm run dev -- --host 0.0.0.0 --port 8080`
- **Hot Reload**: ✅ Enabled

### Redis Container

- **Base**: Redis 7-alpine
- **Port**: 6379
- **Persistence**: ✅ Volume mounted
- **Health Checks**: ✅ Enabled

## 🎯 Benefits

1. **Consistent Environment**: Same setup across different machines
2. **No Terminal Management**: Single command to start everything
3. **Hot Reload**: Code changes reflected immediately
4. **Easy Rebuilds**: Quick container rebuilds after changes
5. **Isolated Dependencies**: No conflicts with host system
6. **Network Isolation**: Services communicate via Docker network

## 🚀 Next Steps

After making any code changes:

1. Files are automatically synced via volume mounts
2. Services restart automatically (hot reload)
3. For new dependencies: `./dev-container.sh rebuild`
4. View logs: `./dev-container.sh logs`

The development environment is now fully containerized and ready for development! 🎉
