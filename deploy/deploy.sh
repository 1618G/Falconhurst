#!/bin/bash
# ============================================
# Falconhurst Deployment Script V7.3
# Static site deployment via ZZA_VPS
# V7.3: Docker safety, security header verification
# Domain: falconhurst.zzagroup.cloud
#         robinhoodsbaylet.co.uk
#         falconhurstbay.co.uk
# ============================================

set -e

# Configuration
VPS_HOST='zza-vps'
VPS_PATH='/home/deploy/apps/falconhurst'
LOCAL_SOURCE='/Users/jamesperry/Desktop/platforms/Falconhurst'
DOMAIN='falconhurst.zzagroup.cloud'
CUSTOM_DOMAIN='robinhoodsbaylet.co.uk'
CUSTOM_DOMAIN_2='falconhurstbay.co.uk'
COMPOSE_FILE="$VPS_PATH/deploy/docker-compose.yml"

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
echo "║   Falconhurst Deployment V7.3                             ║"
echo "║   Domain: $DOMAIN                              ║"
echo "║   Custom: $CUSTOM_DOMAIN / $CUSTOM_DOMAIN_2         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# Step 1: Pre-Flight Checks (V7.3)
# ============================================
print_step "Running pre-flight checks..."

# Check for uncommitted changes
if [ -d "$LOCAL_SOURCE/.git" ]; then
    cd "$LOCAL_SOURCE"
    if ! git diff --quiet 2>/dev/null; then
        print_warning "Uncommitted changes detected. Consider committing before deploy."
    else
        print_success "Git working directory clean"
    fi
fi

# Verify compose file has project name isolation (V7.1)
if grep -q "name: falconhurst" "$LOCAL_SOURCE/deploy/docker-compose.yml"; then
    print_success "COMPOSE_PROJECT_NAME isolation verified (V7.1)"
else
    print_error "COMPOSE_PROJECT_NAME not set in docker-compose.yml!"
    echo "This MUST be set to prevent cross-app conflicts on shared VPS."
    exit 1
fi

# Verify security headers in nginx.conf (V7.0)
NGINX_CONF="$LOCAL_SOURCE/deploy/nginx.conf"
MISSING_HEADERS=0
for header in "Strict-Transport-Security" "Content-Security-Policy" "X-Frame-Options" "X-Content-Type-Options" "Permissions-Policy"; do
    if ! grep -qi "$header" "$NGINX_CONF" 2>/dev/null; then
        print_error "Missing security header: $header"
        MISSING_HEADERS=1
    fi
done
if [ "$MISSING_HEADERS" -eq 0 ]; then
    print_success "All security headers present in nginx.conf (V7.0)"
else
    print_error "Fix missing security headers before deploying!"
    exit 1
fi

# Verify required HTML files exist
for file in index.html blog.html privacy.html cookies.html styles.css script.js cookie-consent.js; do
    if [ ! -f "$LOCAL_SOURCE/$file" ]; then
        print_error "Missing required file: $file"
        exit 1
    fi
done
print_success "All required files present"

# ============================================
# Step 2: Test SSH Connection
# ============================================
print_step "Testing SSH connection to VPS..."
if ! ssh -q $VPS_HOST exit; then
    print_error "SSH connection failed!"
    echo "Ensure SSH key is configured in ~/.ssh/config"
    exit 1
fi
print_success "SSH connection OK"

# ============================================
# Step 3: Create directory on VPS
# ============================================
print_step "Creating directory on VPS: $VPS_PATH"
ssh $VPS_HOST "mkdir -p $VPS_PATH/deploy"
print_success "Directory ready"

# ============================================
# Step 4: Upload static files
# ============================================
print_step "Uploading static files..."
rsync -avz --progress \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude 'deploy' \
    --exclude '.cursor' \
    --exclude '.codacy' \
    --exclude '*.zip' \
    --exclude 'node_modules' \
    --exclude 'scripts' \
    --exclude 'CHANGELOG.md' \
    --exclude 'README.md' \
    "$LOCAL_SOURCE/" "$VPS_HOST:$VPS_PATH/"
print_success "Files uploaded"

# ============================================
# Step 5: Upload Docker configs
# ============================================
print_step "Uploading Docker configs..."
scp "$LOCAL_SOURCE/deploy/docker-compose.yml" "$VPS_HOST:$VPS_PATH/deploy/"
scp "$LOCAL_SOURCE/deploy/nginx.conf" "$VPS_HOST:$VPS_PATH/deploy/"
print_success "Configs uploaded"

# ============================================
# Step 6: Start container on VPS (V7.3 Docker Safety)
# ============================================
print_step "Starting container on VPS (V7.3 Docker Safety Protocol)..."

# V7.3: ALWAYS use -f flag with specific compose file
ssh $VPS_HOST << 'ENDSSH'
cd /home/deploy/apps/falconhurst

# V7.3: Stop ONLY our specific service using -f flag (never bare docker compose down)
docker compose -f deploy/docker-compose.yml stop falconhurst 2>/dev/null || true

# V7.3: Start with explicit compose file
docker compose -f deploy/docker-compose.yml up -d falconhurst

# Show status
echo ""
echo "Container status:"
docker compose -f deploy/docker-compose.yml ps
ENDSSH

print_success "Container started (V7.3 Docker Safety)"

# ============================================
# Step 7: Wait for Traefik
# ============================================
print_step "Waiting for Traefik to discover route and generate SSL (30s)..."
sleep 30

# ============================================
# Step 8: Verify deployment
# ============================================
print_step "Verifying deployment..."

# Test ZZA cloud domain
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" --connect-timeout 10 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    print_success "https://$DOMAIN: $HTTPS_STATUS OK"
else
    print_warning "https://$DOMAIN: $HTTPS_STATUS (may need more time for SSL)"
fi

# Test custom domains
for custom in "$CUSTOM_DOMAIN" "$CUSTOM_DOMAIN_2"; do
    CUSTOM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$custom" --connect-timeout 10 2>/dev/null || echo "000")
    if [ "$CUSTOM_STATUS" = "200" ]; then
        print_success "https://$custom: $CUSTOM_STATUS OK"
    else
        print_warning "https://$custom: $CUSTOM_STATUS (DNS propagation may be pending)"
    fi
done

# ============================================
# Step 9: Verify Security Headers (V7.0)
# ============================================
print_step "Verifying security headers (V7.0)..."
HEADERS=$(curl -sI "https://$DOMAIN" --connect-timeout 10 2>/dev/null || echo "")
if [ -n "$HEADERS" ]; then
    for header in "strict-transport-security" "x-frame-options" "x-content-type-options" "content-security-policy" "permissions-policy"; do
        if echo "$HEADERS" | grep -qi "$header"; then
            print_success "Header present: $header"
        else
            print_warning "Header missing: $header (check nginx.conf)"
        fi
    done
else
    print_warning "Could not verify headers (site may still be starting)"
fi

# ============================================
# Step 10: Verify all pages load
# ============================================
print_step "Verifying all pages load..."
for page in "/" "/blog.html" "/privacy.html" "/cookies.html" "/health"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN$page" --connect-timeout 10 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        print_success "https://$DOMAIN$page: $STATUS OK"
    else
        print_warning "https://$DOMAIN$page: $STATUS"
    fi
done

# ============================================
# Done
# ============================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Falconhurst Deployment Complete! (V7.3)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URLs:"
echo "   https://$DOMAIN"
echo "   https://$CUSTOM_DOMAIN"
echo "   https://$CUSTOM_DOMAIN_2"
echo ""
echo "Useful commands:"
echo "   View logs:    ssh $VPS_HOST 'docker logs -f falconhurst-web'"
echo "   Restart:      ssh $VPS_HOST 'cd $VPS_PATH && docker compose -f deploy/docker-compose.yml restart'"
echo "   Status:       ssh $VPS_HOST 'docker ps | grep falconhurst'"
echo ""
