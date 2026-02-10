#!/bin/bash
# ============================================
# Falconhurst Deployment Script
# Static site deployment via ZZA_VPS
# Domain: falconhurst.zzagroup.cloud
#         robinhoodsbaylet.co.uk
# ============================================

set -e

# Configuration
VPS_HOST='zza-vps'
VPS_PATH='/home/deploy/apps/falconhurst'
LOCAL_SOURCE='/Users/jamesperry/Desktop/platforms/Falconhurst'
DOMAIN='falconhurst.zzagroup.cloud'
CUSTOM_DOMAIN='robinhoodsbaylet.co.uk'

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_step() { echo -e "${CYAN}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Falconhurst Deployment                                  ║"
echo "║   Domain: $DOMAIN                              ║"
echo "║   Custom: $CUSTOM_DOMAIN                         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# Step 1: Test SSH Connection
# ============================================
print_step "Testing SSH connection to VPS..."
if ! ssh -q $VPS_HOST exit; then
    print_error "SSH connection failed!"
    echo "Ensure SSH key is configured in ~/.ssh/config"
    exit 1
fi
print_success "SSH connection OK"

# ============================================
# Step 2: Create directory on VPS
# ============================================
print_step "Creating directory on VPS: $VPS_PATH"
ssh $VPS_HOST "mkdir -p $VPS_PATH/deploy"
print_success "Directory ready"

# ============================================
# Step 3: Upload static files
# ============================================
print_step "Uploading static files..."
rsync -avz --progress \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude 'deploy' \
    --exclude '.cursor' \
    --exclude '*.zip' \
    --exclude 'node_modules' \
    "$LOCAL_SOURCE/" "$VPS_HOST:$VPS_PATH/"
print_success "Files uploaded"

# ============================================
# Step 4: Upload Docker configs
# ============================================
print_step "Uploading Docker configs..."
scp "$LOCAL_SOURCE/deploy/docker-compose.yml" "$VPS_HOST:$VPS_PATH/deploy/"
scp "$LOCAL_SOURCE/deploy/nginx.conf" "$VPS_HOST:$VPS_PATH/deploy/"
print_success "Configs uploaded"

# ============================================
# Step 5: Start container on VPS
# ============================================
print_step "Starting container on VPS..."
ssh $VPS_HOST << 'ENDSSH'
cd /home/deploy/apps/falconhurst/deploy

# Stop existing container if running
docker compose down 2>/dev/null || true

# Start the container
docker compose up -d

# Show status
echo ""
echo "Container status:"
docker compose ps
ENDSSH

print_success "Container started"

# ============================================
# Step 6: Wait for Traefik
# ============================================
print_step "Waiting for Traefik to discover route and generate SSL (30s)..."
sleep 30

# ============================================
# Step 7: Verify deployment
# ============================================
print_step "Verifying deployment..."

# Test zzagroup.cloud subdomain
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" --connect-timeout 10 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    print_success "https://$DOMAIN: $HTTPS_STATUS OK"
else
    print_warning "https://$DOMAIN: $HTTPS_STATUS (may need more time for SSL)"
fi

# Test custom domain
CUSTOM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$CUSTOM_DOMAIN" --connect-timeout 10 2>/dev/null || echo "000")
if [ "$CUSTOM_STATUS" = "200" ]; then
    print_success "https://$CUSTOM_DOMAIN: $CUSTOM_STATUS OK"
else
    print_warning "https://$CUSTOM_DOMAIN: $CUSTOM_STATUS (DNS propagation may be pending)"
fi

# ============================================
# Done
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Falconhurst Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 URLs:"
echo "   https://$DOMAIN"
echo "   https://$CUSTOM_DOMAIN"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:    ssh $VPS_HOST 'docker logs -f falconhurst-web'"
echo "   Restart:      ssh $VPS_HOST 'cd $VPS_PATH/deploy && docker compose restart'"
echo "   Status:       ssh $VPS_HOST 'docker ps | grep falconhurst'"
echo ""
