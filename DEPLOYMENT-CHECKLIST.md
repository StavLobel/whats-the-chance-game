# Deployment Checklist - What's the Chance? Game

## Pre-Deployment Checklist

### ✅ Server Verification
- [ ] Traefik v2.10 is running (confirmed: `docker ps` shows traefik container)
- [ ] Existing portfolio app is working (sl-portfolio-prod)
- [ ] Watchtower is running for auto-updates
- [ ] Traefik network exists: `docker network ls | grep traefik`

### ✅ Domain Configuration
- [ ] Choose subdomain: `whatsthechance.yourdomain.com`
- [ ] Add DNS A record: `whatsthechance.yourdomain.com` → YOUR_VPS_IP
- [ ] Add DNS A record: `api.whatsthechance.yourdomain.com` → YOUR_VPS_IP
- [ ] Wait for DNS propagation (can take up to 24 hours)

### ✅ Environment Setup
- [ ] Clone repository: `git clone https://github.com/StavLobel/whats-the-chance-game.git`
- [ ] Navigate to project: `cd whats-the-chance-game`
- [ ] Create `.env` file with correct subdomain
- [ ] Configure Firebase credentials in `.env`

## Deployment Steps

### 1. Environment Configuration
```bash
# Create .env file
cp .env.example .env

# Edit .env with your values:
DOMAIN_NAME=whatsthechance.yourdomain.com
ACME_EMAIL=admin@yourdomain.com
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### 2. Deploy Application
```bash
# Start production services
docker-compose --profile production up -d

# Verify containers are running
docker ps | grep whatsthechance
```

### 3. Verify Deployment
- [ ] Frontend accessible: https://whatsthechance.yourdomain.com
- [ ] Backend API accessible: https://api.whatsthechance.yourdomain.com/api/docs
- [ ] Traefik dashboard shows new services: http://yourdomain.com:8080
- [ ] Existing portfolio app still works: https://yourdomain.com

## Post-Deployment Verification

### ✅ Application Health
- [ ] Frontend loads without errors
- [ ] Backend API responds to health check
- [ ] Firebase authentication works
- [ ] Game functionality is operational

### ✅ Traefik Integration
- [ ] Services appear in Traefik dashboard
- [ ] SSL certificates are automatically generated
- [ ] HTTP redirects to HTTPS
- [ ] CORS headers are properly configured

### ✅ Monitoring
- [ ] Check application logs: `docker-compose logs -f`
- [ ] Check Traefik logs: `docker logs -f traefik`
- [ ] Monitor Traefik dashboard for errors
- [ ] Verify SSL certificate status

## Troubleshooting

### Common Issues

#### DNS Issues
```bash
# Check DNS resolution
nslookup whatsthechance.yourdomain.com
nslookup api.whatsthechance.yourdomain.com
```

#### Container Issues
```bash
# Check container status
docker ps -a | grep whatsthechance

# Check container logs
docker logs whatsthechance-frontend-prod
docker logs whatsthechance-backend-prod
```

#### Traefik Issues
```bash
# Check Traefik logs
docker logs -f traefik

# Check Traefik configuration
docker exec traefik traefik version
```

#### Network Issues
```bash
# Check if containers are on Traefik network
docker network inspect traefik

# Verify network connectivity
docker exec whatsthechance-backend-prod ping frontend-prod
```

## Maintenance

### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose --profile production down
docker-compose --profile production up -d --build
```

### Backup
```bash
# Backup environment configuration
cp .env .env.backup.$(date +%Y%m%d)

# Backup container data (if any)
docker run --rm -v whatsthechance-redis:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup-$(date +%Y%m%d).tar.gz -C /data .
```

### Rollback
```bash
# If needed, rollback to previous version
git checkout <previous-commit>
docker-compose --profile production down
docker-compose --profile production up -d --build
```

## Security Notes

- ✅ SSL certificates are automatically managed by Traefik
- ✅ CORS is configured to only allow the frontend domain
- ✅ Firebase credentials are stored securely in environment variables
- ✅ Containers run with minimal privileges
- ✅ Network isolation via Docker networks

## Performance Monitoring

- Monitor Traefik dashboard for request metrics
- Check container resource usage: `docker stats`
- Monitor SSL certificate expiration
- Watch for any error logs in Traefik or application containers

---

**Deployment Status**: Ready for production deployment
**Traefik Version**: v2.10 (compatible)
**Network**: External Traefik network integration
**SSL**: Automatic Let's Encrypt via existing Traefik 