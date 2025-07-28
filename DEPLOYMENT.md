# Deployment Guide - Hostinger VPS with Traefik

This document describes how to deploy "What's the Chance?" to production using Docker containers with Traefik reverse proxy.

## Architecture Overview

- **Hostinger VPS**: Production server with existing Traefik v2.10 installation
- **Docker Compose**: Container orchestration
- **Traefik v2.10**: Existing reverse proxy with automatic SSL
- **Let's Encrypt**: Automatic SSL certificate management
- **Firebase**: Authentication and database backend
- **Watchtower**: Automatic container updates

## Prerequisites

1. **Hostinger VPS** with Docker and Docker Compose installed
2. **Domain name** pointing to your VPS IP
3. **Firebase project** configured
4. **Git** repository access on the server

## Server Setup

### 1. Prerequisites (Already Installed)

Your server already has:

- ✅ Docker and Docker Compose
- ✅ Traefik v2.10 running (ports 80, 443, 8080)
- ✅ Let's Encrypt SSL certificates configured
- ✅ Watchtower for automatic updates
- ✅ Existing portfolio app (sl-portfolio-prod)

### 2. Verify Traefik Network

```bash
# Check if Traefik network exists
docker network ls | grep traefik

# If it doesn't exist, create it (usually Traefik creates this automatically)
docker network create traefik

# Check existing containers and their networks
docker ps
docker network inspect traefik
```

### 3. Clone Repository

```bash
git clone https://github.com/StavLobel/whats-the-chance-game.git
cd whats-the-chance-game
```

### 4. Environment Configuration

Create `.env` file with production values:

```env
# Domain Configuration
DOMAIN_NAME=whatsthechance.yourdomain.com  # Subdomain for this app
ACME_EMAIL=admin@yourdomain.com

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-firebase-project.iam.gserviceaccount.com

# Production Settings
ENVIRONMENT=production
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
```

**Important**: Use a subdomain (e.g., `whatsthechance.yourdomain.com`) to avoid conflicts with your existing portfolio app.

### DNS Configuration

Before deploying, ensure your DNS is configured:

```bash
# Add these DNS records pointing to your VPS IP:
# A record: whatsthechance.yourdomain.com -> YOUR_VPS_IP
# A record: api.whatsthechance.yourdomain.com -> YOUR_VPS_IP
```

### 5. SSL Certificate Storage

```bash
# SSL certificates are managed by your existing Traefik installation
# No additional setup needed for this application
```

## Deployment

### 1. Start Production Services

```bash
# Start application services (Traefik is already running)
docker-compose --profile production up -d

# Check status
docker-compose ps

# Verify Traefik picked up the new services
docker logs traefik  # or whatever your Traefik container is named
```

### 2. Verify Deployment

- **Frontend**: https://whatsthechance.yourdomain.com
- **Backend API**: https://api.whatsthechance.yourdomain.com/api/docs
- **Traefik Dashboard**: http://yourdomain.com:8080 (existing dashboard)
- **Existing Portfolio**: Your current portfolio app will continue working at yourdomain.com

### 3. Monitor Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend-prod
docker-compose logs -f backend-prod

# Check Traefik logs (your existing Traefik container)
docker logs -f traefik  # Your Traefik container name from docker ps
```

## Traefik Configuration

### Automatic Features

- **SSL Certificates**: Automatically obtained from Let's Encrypt
- **HTTP → HTTPS**: Automatic redirection
- **Service Discovery**: Automatic backend detection via Docker labels
- **Load Balancing**: Built-in load balancing for multiple instances

### Dashboard Access

Your existing Traefik dashboard at `http://yourdomain.com:8080` can be used to monitor:

- Service status
- Request metrics
- SSL certificate status
- Route configuration

The "What's the Chance?" application will automatically appear in your Traefik dashboard alongside your existing portfolio app.

### Security Considerations

Your existing Traefik installation should already have proper security configured. The application containers will inherit your Traefik security settings.

## Maintenance

### SSL Certificate Renewal

Certificates are automatically renewed by your existing Traefik installation. No additional configuration needed for this application.

### Updating Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose --profile production down
docker-compose --profile production up -d --build
```

### Backup

```bash
# Backup environment configuration
cp .env .env.backup

# SSL certificates are managed by your existing Traefik installation
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**

   ```bash
   # Check your existing Traefik logs
   docker logs traefik  # or your Traefik container name

   # Verify DNS pointing to server
   nslookup yourdomain.com
   ```

2. **Service Not Accessible**

   ```bash
   # Check service status
   docker-compose ps

   # Verify Traefik routing
   curl -H "Host: yourdomain.com" http://localhost/
   ```

3. **Firebase Connection Issues**

   ```bash
   # Check backend logs
   docker-compose logs backend-prod

   # Verify Firebase credentials
   docker-compose exec backend-prod python -c "import firebase_admin; print('Firebase OK')"
   ```

### Health Checks

Services include health checks for monitoring:

```bash
# Check backend health
curl https://api.yourdomain.com/api/health

# Check all container health
docker-compose ps
```

## Performance Optimization

### Docker Resource Limits

Add resource limits to production services:

```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### Traefik Caching

Enable response caching by adding middleware:

```yaml
labels:
  - 'traefik.http.middlewares.cache.plugin.cache.maxage=3600'
```

## Security Hardening

1. **Firewall Configuration**

   ```bash
   sudo ufw allow 22    # SSH
   sudo ufw allow 80    # HTTP
   sudo ufw allow 443   # HTTPS
   sudo ufw enable
   ```

2. **Docker Security**

   ```bash
   # Run containers as non-root user
   # Use read-only file systems where possible
   # Limit container capabilities
   ```

3. **Environment Variables**
   ```bash
   # Store sensitive data in encrypted format
   # Use Docker secrets for production
   # Rotate credentials regularly
   ```

## Monitoring

Set up monitoring with Prometheus metrics (built into Traefik):

```yaml
# Add to traefik service
labels:
  - 'traefik.http.routers.metrics.rule=Host(`metrics.yourdomain.com`)'
  - 'traefik.http.services.metrics.loadbalancer.server.port=8080'
```

## Support

For deployment issues:

1. Check logs: `docker-compose logs`
2. Verify configuration: `docker-compose config`
3. Test connectivity: `curl` commands
4. Review Traefik dashboard for routing issues

---

This deployment setup provides automatic SSL, high availability, and easy maintenance for the "What's the Chance?" application.
