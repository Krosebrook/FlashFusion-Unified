# FlashFusion Unified - Secure Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [SSL Certificate Setup](#ssl-certificate-setup)
4. [Database Setup](#database-setup)
5. [Docker Deployment](#docker-deployment)
6. [Security Configuration](#security-configuration)
7. [Monitoring Setup](#monitoring-setup)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Troubleshooting](#troubleshooting)
10. [Security Checklist](#security-checklist)

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Storage**: Minimum 50GB SSD
- **Network**: Static IP address, open ports 80, 443

### Required Software
```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Node.js 18+ (for development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Additional security tools
sudo apt-get update
sudo apt-get install -y ufw fail2ban certbot
```

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Krosebrook/FlashFusion-Unified.git
cd FlashFusion-Unified
```

### 2. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Generate secure secrets
export JWT_SECRET=$(openssl rand -base64 32)
export SESSION_SECRET=$(openssl rand -base64 32)
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
export REDIS_PASSWORD=$(openssl rand -base64 32)
export GRAFANA_PASSWORD=$(openssl rand -base64 32)

# Update .env file with your values
nano .env
```

### 3. Required Environment Variables
Update `.env` with production values:

```bash
# Application
NODE_ENV=production
DOMAIN=flashfusion.ai
CORS_ORIGIN=https://flashfusion.ai

# Database
DATABASE_URL=postgresql://flashfusion:${POSTGRES_PASSWORD}@postgres:5432/flashfusion
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}

# Security
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
GRAFANA_PASSWORD=${GRAFANA_PASSWORD}

# API Keys (add your actual keys)
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key
# ... other API keys
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Recommended)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Create certificates
sudo certbot certonly --standalone -d flashfusion.ai -d www.flashfusion.ai

# Create SSL directory for Docker
sudo mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/flashfusion.ai/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/flashfusion.ai/privkey.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/flashfusion.ai/chain.pem ./nginx/ssl/

# Set proper permissions
sudo chown -R $(whoami):$(whoami) ./nginx/ssl
chmod 644 ./nginx/ssl/*.pem
chmod 600 ./nginx/ssl/privkey.pem
```

### Option 2: Custom SSL Certificate
```bash
# Place your certificates in the nginx/ssl directory
mkdir -p ./nginx/ssl
cp your-certificate.pem ./nginx/ssl/fullchain.pem
cp your-private-key.pem ./nginx/ssl/privkey.pem
cp your-ca-bundle.pem ./nginx/ssl/chain.pem
```

## Database Setup

### 1. Database Migration
```bash
# Create database schema
docker-compose exec postgres psql -U flashfusion -d flashfusion -f /docker-entrypoint-initdb.d/01-schema.sql

# Run any additional migrations
npm run migrate
```

### 2. Database Backup Setup
```bash
# Create backup script
cat > backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U flashfusion flashfusion > $BACKUP_DIR/flashfusion_$(date +%H%M%S).sql
find /backups -type d -mtime +30 -exec rm -rf {} +
EOF

chmod +x backup-db.sh

# Add to crontab for daily backups
echo "0 2 * * * /path/to/backup-db.sh" | crontab -
```

## Docker Deployment

### 1. Build and Deploy
```bash
# Build the application
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### 2. Production Deployment with Deploy Script
```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy specific version
./scripts/deploy.sh v1.0.0

# Deploy with rollback capability
./scripts/deploy.sh v1.0.1 v1.0.0
```

### 3. Service Health Checks
```bash
# Check application health
curl https://flashfusion.ai/health

# Check individual services
curl https://flashfusion.ai/health/detailed
curl https://flashfusion.ai/metrics
```

## Security Configuration

### 1. Firewall Setup
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Fail2ban Configuration
```bash
# Create jail for nginx
sudo tee /etc/fail2ban/jail.local << 'EOF'
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
EOF

sudo systemctl restart fail2ban
```

### 3. System Hardening
```bash
# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install security updates automatically
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Monitoring Setup

### 1. Access Monitoring Dashboards
- **Grafana**: https://flashfusion.ai:3001 (admin/GRAFANA_PASSWORD)
- **Prometheus**: https://flashfusion.ai:9090
- **Application Metrics**: https://flashfusion.ai/metrics

### 2. Configure Alerts
```bash
# Create alertmanager config
mkdir -p monitoring/alertmanager
cat > monitoring/alertmanager/config.yml << 'EOF'
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@flashfusion.ai'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'

receivers:
- name: 'web.hook'
  email_configs:
  - to: 'admin@flashfusion.ai'
    subject: 'FlashFusion Alert: {{ .GroupLabels.alertname }}'
    body: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
EOF
```

### 3. Log Management
```bash
# Configure log rotation
sudo tee /etc/logrotate.d/flashfusion << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
```

## CI/CD Pipeline

### 1. GitHub Secrets Setup
Configure the following secrets in your GitHub repository:

```bash
# Deployment secrets
DEPLOY_HOST=your.server.ip
DEPLOY_USER=deploy
DEPLOY_SSH_KEY=your_private_ssh_key

# Registry secrets
REGISTRY_USER=your_registry_username
REGISTRY_PASSWORD=your_registry_password

# Notification secrets (optional)
SLACK_WEBHOOK_URL=your_slack_webhook
DISCORD_WEBHOOK_URL=your_discord_webhook
```

### 2. Deployment Key Setup
```bash
# On your server, create a deploy user
sudo adduser deploy
sudo usermod -aG docker deploy

# Generate SSH key for deployment
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys

# Add private key to GitHub secrets as DEPLOY_SSH_KEY
cat ~/.ssh/deploy_key
```

## Troubleshooting

### Common Issues

#### 1. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/fullchain.pem -text -noout

# Renew Let's Encrypt certificates
sudo certbot renew --dry-run
```

#### 2. Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Test database connection
docker-compose exec postgres psql -U flashfusion -d flashfusion -c "SELECT 1;"
```

#### 3. Memory Issues
```bash
# Check memory usage
docker stats

# Increase Docker memory limits in docker-compose.yml
```

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $(whoami):$(whoami) .
chmod +x scripts/*.sh
```

### Health Check Commands
```bash
# System health
curl https://flashfusion.ai/health

# Database health
curl https://flashfusion.ai/health/detailed

# Service status
docker-compose ps
docker-compose logs --tail=50 app
```

## Security Checklist

### Pre-Deployment Security Checklist

- [ ] **Environment Variables**
  - [ ] All secrets use strong, randomly generated values
  - [ ] No sensitive data in .env.example
  - [ ] Production .env file has restricted permissions (600)

- [ ] **SSL/TLS**
  - [ ] SSL certificates are valid and not expired
  - [ ] Strong TLS configuration (TLS 1.2+ only)
  - [ ] HSTS headers configured
  - [ ] Certificate chain is complete

- [ ] **Database Security**
  - [ ] Database uses strong passwords
  - [ ] Database is not exposed to public internet
  - [ ] Regular backups are configured
  - [ ] Database connections use SSL in production

- [ ] **Application Security**
  - [ ] Security headers are configured (CSP, X-Frame-Options, etc.)
  - [ ] Rate limiting is enabled
  - [ ] Input validation is implemented
  - [ ] XSS protection is enabled
  - [ ] CORS is properly configured

- [ ] **Infrastructure Security**
  - [ ] Firewall is configured and enabled
  - [ ] Fail2ban is configured
  - [ ] System packages are up to date
  - [ ] SSH is hardened (no root login, key-based auth)
  - [ ] Docker containers run as non-root users

- [ ] **Monitoring & Logging**
  - [ ] Application logs are configured
  - [ ] Security monitoring is enabled
  - [ ] Error tracking (Sentry) is configured
  - [ ] Metrics collection is working
  - [ ] Alerts are configured

- [ ] **Backup & Recovery**
  - [ ] Database backups are automated
  - [ ] Backup restoration has been tested
  - [ ] Deployment rollback procedure is tested
  - [ ] Disaster recovery plan is documented

### Post-Deployment Verification

```bash
# Run security scan
./scripts/security-check.sh

# Verify SSL configuration
curl -I https://flashfusion.ai

# Check security headers
curl -I https://flashfusion.ai | grep -E "(X-|Strict-Transport|Content-Security)"

# Verify health endpoints
curl https://flashfusion.ai/health
curl https://flashfusion.ai/metrics

# Check log files
docker-compose logs --tail=100
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review application logs
   - Check SSL certificate expiration
   - Verify backup integrity
   - Review security alerts

2. **Monthly**
   - Update system packages
   - Review and rotate logs
   - Update dependency packages
   - Conduct security scan

3. **Quarterly**
   - Review and update security policies
   - Conduct penetration testing
   - Review access permissions
   - Update disaster recovery procedures

### Getting Help

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/Krosebrook/FlashFusion-Unified/issues)
- **Security**: security@flashfusion.ai
- **Support**: support@flashfusion.ai

---

## Quick Start Commands

```bash
# Complete deployment in one go
git clone https://github.com/Krosebrook/FlashFusion-Unified.git
cd FlashFusion-Unified
cp .env.example .env
# Edit .env with your values
docker-compose up -d
./scripts/deploy.sh latest
```

For production deployments, please follow the complete guide above to ensure security and reliability.