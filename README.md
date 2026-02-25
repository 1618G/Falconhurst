# Falconhurst Holiday Let

A modern, responsive static website for Falconhurst Holiday Let in Robin Hoods Bay, Whitby, Yorkshire Coast.

## Overview

| Feature | Details |
|---------|---------|
| **Type** | Static website (HTML/CSS/JS) |
| **Hosting** | Docker (nginx:alpine) on ZZA VPS |
| **SSL** | Automatic via Traefik / Let's Encrypt |
| **Domains** | falconhurst.zzagroup.cloud, robinhoodsbaylet.co.uk, falconhurstbay.co.uk |
| **Analytics** | Google Analytics 4 (G-WXFB5L04Y8) |
| **Booking** | Booking.com integration |
| **Compliance** | ZZA Build V7.3 |

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with hero carousel, gallery, about, location, reviews, contact |
| Blog | `blog.html` | 6 articles about Robin Hoods Bay and local area |
| Privacy | `privacy.html` | GDPR-compliant privacy policy |

## Features

- Responsive design (mobile-first, breakpoints at 480px, 768px, 1024px)
- Hero image carousel with auto-rotation
- Interactive photo gallery with touch/swipe support
- Contact form with mailto: integration
- Schema.org structured data (LodgingBusiness, LocalBusiness, FAQPage, BreadcrumbList)
- Comprehensive SEO (meta tags, OG, Twitter Cards, sitemap, robots.txt)
- Optimized images (WebP format with responsive srcset variants)
- Scroll animations (Intersection Observer)
- Accessibility features (ARIA labels, semantic HTML, keyboard navigation)

## Project Structure

```
Falconhurst/
├── index.html              # Main landing page
├── blog.html               # Blog page
├── privacy.html            # Privacy policy
├── styles.css              # All styles
├── script.js               # Interactive features
├── sitemap.xml             # XML sitemap
├── robots.txt              # Crawler directives
├── .htaccess               # Apache fallback config
├── deploy/
│   ├── docker-compose.yml  # Docker Compose (V7.3 project isolation)
│   ├── deploy.sh           # Deployment script (V7.3 safety)
│   └── nginx.conf          # Nginx config (V7.3 security headers)
├── images/
│   ├── falconhurst-*.webp  # Property photos
│   ├── village-*.webp      # Village photos
│   ├── coast-*.webp        # Coastline photos
│   └── responsive/         # Responsive image variants
├── .cursor/
│   ├── rules/              # Cursor AI rules (deployment, security, gitignore)
│   ├── skills/             # VPS deployment skill
│   ├── agents/             # Validation agents
│   └── templates/          # QA checklists and protocols
└── .codacy/                # Code quality configuration
```

## Deployment

### Prerequisites

- SSH access to ZZA VPS (configured as `zza-vps` in `~/.ssh/config`)
- Traefik reverse proxy running on VPS
- DNS configured for all domains

### Deploy

```bash
./deploy/deploy.sh
```

The deploy script (V7.3) performs:
1. Pre-flight checks (git status, COMPOSE_PROJECT_NAME, security headers)
2. File upload via rsync
3. Docker container restart with V7.3 safety protocol
4. Post-deployment verification (HTTPS, security headers, all pages)

### Verify Deployment

```bash
# Check all domains
curl -I https://falconhurst.zzagroup.cloud
curl -I https://falconhurstbay.co.uk

# Check security headers
curl -sI https://falconhurst.zzagroup.cloud | grep -iE "strict-transport|x-frame|content-security|permissions-policy"

# Check container status
ssh zza-vps 'docker ps | grep falconhurst'
```

## Security (V7.3)

### HTTP Security Headers

All responses include:
- `Strict-Transport-Security` (HSTS with preload)
- `Content-Security-Policy` (strict CSP)
- `X-Frame-Options` (clickjacking prevention)
- `X-Content-Type-Options` (MIME sniffing prevention)
- `X-XSS-Protection` (XSS filter)
- `Referrer-Policy` (referrer control)
- `Permissions-Policy` (browser feature restrictions)

### Docker Safety (V7.3)

- COMPOSE_PROJECT_NAME set to `falconhurst` (prevents cross-app conflicts)
- Deploy script uses explicit `-f` flag (never bare `docker compose down`)
- Health checks configured on all services

## Development

### Local Preview

Open `index.html` directly in a browser, or use a local server:

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

### Making Changes

1. Edit HTML/CSS/JS files locally
2. Test in browser
3. Commit changes: `git add . && git commit -m "update: description"`
4. Deploy: `./deploy/deploy.sh`

## ZZA Build V7.3 Compliance

This project follows ZZA Build V7.3 methodology:

- [x] COMPOSE_PROJECT_NAME isolation (V7.1)
- [x] Docker safety protocol - no bare compose commands (V7.3)
- [x] Security header verification in deploy script (V7.0)
- [x] Pre-flight checks before deployment (V7.3)
- [x] Post-deployment verification (V7.0)
- [x] Cursor rules, skills, agents, templates configured
- [x] Codacy code quality integration
- [x] Comprehensive .gitignore

## Useful Commands

```bash
# Deploy
./deploy/deploy.sh

# View container logs
ssh zza-vps 'docker logs -f falconhurst-web'

# Restart container
ssh zza-vps 'cd /home/deploy/apps/falconhurst && docker compose -f deploy/docker-compose.yml restart'

# Check container status
ssh zza-vps 'docker ps | grep falconhurst'

# Run smoke tests
./scripts/smoke-test.sh
```

---

Built with ZZA Build V7.3 methodology. Security-hardened, deployment-ready.
