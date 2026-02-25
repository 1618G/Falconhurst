#!/bin/bash
# ============================================
# Falconhurst Smoke Test Script V7.3
# Tests all pages, links, images, and security headers
# ============================================

set -e

# Configuration
DOMAIN="${1:-https://falconhurst.zzagroup.cloud}"
TIMEOUT=10
PASS=0
FAIL=0
WARN=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}PASS${NC} $1"; PASS=$((PASS + 1)); }
fail() { echo -e "  ${RED}FAIL${NC} $1"; FAIL=$((FAIL + 1)); }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; WARN=$((WARN + 1)); }

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Falconhurst Smoke Test V7.3                             ║"
echo "║   Target: $DOMAIN"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# ============================================
# Test 1: Page Availability
# ============================================
echo -e "${CYAN}[1/6] Page Availability${NC}"

for page in "/" "/blog.html" "/privacy.html" "/health"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$page" --connect-timeout $TIMEOUT 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
        pass "$page ($STATUS)"
    else
        fail "$page ($STATUS)"
    fi
done

echo ""

# ============================================
# Test 2: Security Headers
# ============================================
echo -e "${CYAN}[2/6] Security Headers${NC}"

HEADERS=$(curl -sI "$DOMAIN" --connect-timeout $TIMEOUT 2>/dev/null || echo "")

if [ -z "$HEADERS" ]; then
    fail "Could not retrieve headers from $DOMAIN"
else
    for header in "strict-transport-security" "x-frame-options" "x-content-type-options" "content-security-policy" "permissions-policy" "referrer-policy" "x-xss-protection"; do
        if echo "$HEADERS" | grep -qi "$header"; then
            pass "$header"
        else
            fail "$header missing"
        fi
    done
fi

echo ""

# ============================================
# Test 3: SSL Certificate
# ============================================
echo -e "${CYAN}[3/6] SSL Certificate${NC}"

SSL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN" --connect-timeout $TIMEOUT 2>/dev/null || echo "000")
if [ "$SSL_STATUS" = "200" ]; then
    pass "SSL certificate valid (HTTPS returns 200)"
else
    fail "SSL issue (status: $SSL_STATUS)"
fi

echo ""

# ============================================
# Test 4: Content Checks
# ============================================
echo -e "${CYAN}[4/6] Content Validation${NC}"

HOMEPAGE=$(curl -s "$DOMAIN/" --connect-timeout $TIMEOUT 2>/dev/null || echo "")

if [ -n "$HOMEPAGE" ]; then
    # Check for key content
    if echo "$HOMEPAGE" | grep -q "Falconhurst"; then
        pass "Brand name present"
    else
        fail "Brand name missing"
    fi

    if echo "$HOMEPAGE" | grep -q "Robin Hoods Bay"; then
        pass "Location reference present"
    else
        fail "Location reference missing"
    fi

    if echo "$HOMEPAGE" | grep -q "booking.com"; then
        pass "Booking.com link present"
    else
        fail "Booking.com link missing"
    fi

    if echo "$HOMEPAGE" | grep -q "falconhurstbay@gmail.com"; then
        pass "Contact email present"
    else
        fail "Contact email missing"
    fi

    if echo "$HOMEPAGE" | grep -q "googletagmanager.com"; then
        pass "Google Analytics present"
    else
        warn "Google Analytics may be missing"
    fi

    if echo "$HOMEPAGE" | grep -q "schema.org"; then
        pass "Schema.org structured data present"
    else
        fail "Schema.org structured data missing"
    fi

    if echo "$HOMEPAGE" | grep -q 'og:title'; then
        pass "Open Graph meta tags present"
    else
        fail "Open Graph meta tags missing"
    fi
else
    fail "Could not retrieve homepage content"
fi

echo ""

# ============================================
# Test 5: Image Availability
# ============================================
echo -e "${CYAN}[5/6] Key Images${NC}"

for img in "images/falconhurst-1.webp" "images/falconhurst-2.webp" "images/village-1.webp" "images/coast-1.webp"; do
    IMG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/$img" --connect-timeout $TIMEOUT 2>/dev/null || echo "000")
    if [ "$IMG_STATUS" = "200" ]; then
        pass "$img ($IMG_STATUS)"
    else
        fail "$img ($IMG_STATUS)"
    fi
done

echo ""

# ============================================
# Test 6: Response Time
# ============================================
echo -e "${CYAN}[6/6] Performance${NC}"

for page in "/" "/blog.html" "/privacy.html"; do
    TIME=$(curl -s -o /dev/null -w "%{time_total}" "$DOMAIN$page" --connect-timeout $TIMEOUT 2>/dev/null || echo "999")
    TIME_MS=$(echo "$TIME * 1000" | bc 2>/dev/null || echo "999")

    if (( $(echo "$TIME < 3" | bc -l 2>/dev/null || echo 0) )); then
        pass "$page (${TIME_MS%.*}ms)"
    elif (( $(echo "$TIME < 5" | bc -l 2>/dev/null || echo 0) )); then
        warn "$page (${TIME_MS%.*}ms - slow)"
    else
        fail "$page (${TIME_MS%.*}ms - too slow)"
    fi
done

echo ""

# ============================================
# Summary
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TOTAL=$((PASS + FAIL + WARN))
echo -e "Results: ${GREEN}$PASS passed${NC} / ${RED}$FAIL failed${NC} / ${YELLOW}$WARN warnings${NC} / $TOTAL total"

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}ALL TESTS PASSED${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo -e "${RED}$FAIL TESTS FAILED${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi
