# FlashFusion Secure Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Security Requirements](#security-requirements)
4. [Environment Setup](#environment-setup)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment](#post-deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)
10. [Backup & Recovery](#backup--recovery)

## Overview

This guide provides comprehensive instructions for securely deploying FlashFusion in production environments. The deployment includes:

- **Multi-stage Docker containers** with security hardening
- **Row-level security** for database access control
- **Comprehensive monitoring** with Prometheus and Grafana
- **Rate limiting and security headers** via Nginx
- **Automated backup procedures** with encryption
- **Health checks and alerting** for operational visibility

## Prerequisites

### System Requirements

- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **CPU**: 4+ cores (8+ recommended for production)
- **RAM**: 8GB+ (16GB+ recommended for production)
- **Storage**: 50GB+ available space
- **Network**: Stable internet connection for external services

### Required Software

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt-get update
sudo apt-get install -y curl wget git openssl certbot python3-certbot-nginx
```

### Security Tools (Optional but Recommended)

```bash
# Install Trivy for vulnerability scanning
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
echo deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy

# Install detect-secrets for secret scanning
pip3 install detect-secrets
```

## Security Requirements

### Environment Variables

Create a secure `.env.production` file with the following variables:

```bash
# Database Configuration
POSTGRES_PASSWORD=<strong-password-32+ chars>
REDIS_PASSWORD=<strong-password-32+ chars>

# Security Secrets (generate with: openssl rand -base64 32)
SESSION_SECRET=<32+ character secret>
JWT_SECRET=<32+ character secret>

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# External Services
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
NOTION_TOKEN=<your-notion-token>

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
GRAFANA_PASSWORD=<strong-password>

# Security Settings
NODE_ENV=production
FORCE_HTTPS=true
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

### SSL Certificate Setup

```bash
# Generate SSL certificate with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or use self-signed certificate for testing
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=yourdomain.com"
```

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/flashfusion-united.git
cd flashfusion-united
git checkout feature/secure-deployment-infrastructure
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with your values
nano .env.production

# Validate configuration
npm run validate-keys
```

### 3. Database Setup

```bash
# Initialize database schema
docker-compose up -d postgres
sleep 10
docker-compose exec postgres psql -U flashfusion -d flashfusion -f /docker-entrypoint-initdb.d/01-schema.sql
docker-compose exec postgres psql -U flashfusion -d flashfusion -f /docker-entrypoint-initdb.d/02-indexes.sql
docker-compose exec postgres psql -U flashfusion -d flashfusion -f /docker-entrypoint-initdb.d/03-row-level-security.sql
```

## Deployment Process

### Automated Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh production

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to development
./scripts/deploy.sh development
```

### Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Security scan
npm audit --audit-level=moderate
trivy image flashfusion-app:latest

# 2. Build images
docker-compose build --no-cache

# 3. Create backup
./scripts/backup.sh

# 4. Deploy
docker-compose down
docker-compose up -d

# 5. Verify deployment
curl -f http://localhost/health
```

## Post-Deployment

### Health Checks

```bash
# Basic health check
curl http://localhost/health

# Detailed health check
curl http://localhost/health/detailed

# Security health check
curl http://localhost/health/security

# Performance metrics
curl http://localhost/health/performance
```

### Service Verification

```bash
# Check all services are running
docker-compose ps

# Check service logs
docker-compose logs -f app
docker-compose logs -f nginx
docker-compose logs -f postgres

# Verify database connectivity
docker-compose exec postgres psql -U flashfusion -d flashfusion -c "SELECT version();"
```

### Monitoring Setup

1. **Access Grafana**: http://localhost:3001
   - Default credentials: admin / (password from .env)
   - Import dashboard from `monitoring/grafana/dashboards/`

2. **Access Prometheus**: http://localhost:9090
   - Verify targets are healthy
   - Check metrics collection

3. **Set up alerts** in Grafana for:
   - High error rates (>5%)
   - High response times (>2s)
   - Failed health checks
   - Security events

## Monitoring & Maintenance

### Regular Maintenance Tasks

```bash
# Daily: Check health and logs
curl http://localhost/health
docker-compose logs --tail=100

# Weekly: Update dependencies
npm audit fix
docker-compose pull
docker-compose up -d

# Monthly: Security updates
trivy image --update
./scripts/security-scan.sh
```

### Log Management

```bash
# View application logs
docker-compose logs -f app

# View security audit logs
docker-compose exec postgres psql -U flashfusion -d flashfusion -c "SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 10;"

# Clean old logs
find logs/ -name "*.log" -mtime +30 -delete
```

### Performance Monitoring

Monitor these key metrics:

- **Response Time**: < 500ms average
- **Error Rate**: < 1%
- **Memory Usage**: < 80%
- **CPU Usage**: < 70%
- **Database Connections**: < 80% of max

## Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check logs
docker-compose logs

# Check resource usage
docker stats

# Verify environment variables
docker-compose config
```

#### 2. Database Connection Issues

```bash
# Check database status
docker-compose exec postgres pg_isready -U flashfusion

# Check connection logs
docker-compose logs postgres

# Verify credentials
docker-compose exec postgres psql -U flashfusion -d flashfusion -c "SELECT 1;"
```

#### 3. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew

# Test SSL configuration
curl -I https://yourdomain.com
```

#### 4. Performance Issues

```bash
# Check resource usage
docker stats

# Analyze slow queries
docker-compose exec postgres psql -U flashfusion -d flashfusion -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check Redis performance
docker-compose exec redis redis-cli --latency
```

### Emergency Procedures

#### Rollback Deployment

```bash
# Stop current deployment
docker-compose down

# Restore from backup
./scripts/restore.sh <backup-timestamp>

# Start previous version
docker-compose up -d
```

#### Emergency Access

```bash
# Access database directly
docker-compose exec postgres psql -U flashfusion -d flashfusion

# Access Redis directly
docker-compose exec redis redis-cli

# Access application container
docker-compose exec app sh
```

## Security Best Practices

### 1. Access Control

- Use strong, unique passwords for all services
- Implement IP whitelisting for admin access
- Use SSH keys instead of passwords for server access
- Regularly rotate API keys and secrets

### 2. Network Security

- Configure firewall rules to restrict access
- Use VPN for remote administration
- Enable HTTPS everywhere
- Implement proper CORS policies

### 3. Data Protection

- Encrypt data at rest and in transit
- Regular security audits and penetration testing
- Implement proper backup encryption
- Use row-level security for database access

### 4. Monitoring & Alerting

- Monitor for suspicious activity
- Set up alerts for security events
- Regular log analysis
- Automated vulnerability scanning

### 5. Update Management

- Regular security updates
- Automated dependency scanning
- Test updates in staging environment
- Maintain update schedule

## Backup & Recovery

### Automated Backups

```bash
# Create backup
./scripts/backup.sh

# List available backups
ls -la backups/

# Restore from backup
./scripts/restore.sh 20241201_143022
```

### Manual Backup Procedures

```bash
# Database backup
docker-compose exec postgres pg_dump -U flashfusion flashfusion > backup.sql

# Redis backup
docker-compose exec redis redis-cli BGSAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb ./redis_backup.rdb

# Configuration backup
tar -czf config_backup.tar.gz .env* nginx/ monitoring/
```

### Disaster Recovery

1. **Document recovery procedures**
2. **Test recovery regularly**
3. **Maintain off-site backups**
4. **Have recovery time objectives (RTO)**
5. **Practice disaster recovery drills**

## Support

For additional support:

- **Documentation**: Check the `/docs` directory
- **Issues**: Create GitHub issues for bugs
- **Security**: Report security issues privately
- **Community**: Join our Discord/Slack channels

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Security Level**: Production Ready 