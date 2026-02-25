# Changelog - Falconhurst Holiday Let

All notable changes to this project will be documented in this file.

---

## [1.1.0] - 2026-02-25

### Added - ZZA Build V7.3 Compliance
- **Cursor Rules**: Added deployment.mdc, security.mdc, gitignore.mdc rules
- **Cursor Skills**: Added VPS deployment skill (V7.3 adapted for static sites)
- **Cursor Agents**: Added deployment-validator, security-auditor, code-reviewer, pre-flight-validator
- **Cursor Templates**: Added POST-LAUNCH-CHECKLIST, UAT-PROTOCOL, CLIENT-HANDOVER-PACKAGE, MASTER-QA-CHECKLIST
- **README.md**: Full project documentation
- **CHANGELOG.md**: Version history tracking
- **Smoke test script**: Automated link and page verification

### Changed
- **deploy/docker-compose.yml**: Added COMPOSE_PROJECT_NAME isolation (V7.1), added falconhurstbay.co.uk domain
- **deploy/deploy.sh**: V7.3 safety-first deployment with pre-flight checks, security header verification, Docker safety protocol
- **deploy/nginx.conf**: Full V7.3 security headers (CSP, HSTS, Permissions-Policy, X-XSS-Protection), blocked hidden files and config directories
- **.gitignore**: Comprehensive patterns matching ZZA Build V7.3 standards
- **sitemap.xml**: Updated lastmod dates to current

### Security Enhancements (V7.3)
- Content Security Policy (CSP) configured for all allowed sources
- Strict-Transport-Security with preload directive
- Permissions-Policy restricting camera, microphone, geolocation, payment
- Nginx blocks access to hidden files, deploy/, .cursor/, .git/ directories
- Docker safety protocol prevents accidental container removal on shared VPS

---

## [1.0.0] - 2026-02-10

### Added - Initial Release
- **Homepage** (index.html): Hero carousel, welcome section, photo gallery, about section, location, reviews, contact form
- **Blog** (blog.html): 6 articles about Robin Hoods Bay and local area
- **Privacy Policy** (privacy.html): GDPR-compliant privacy policy
- **Styles** (styles.css): Responsive design with CSS custom properties
- **Scripts** (script.js): Carousel, gallery, smooth scrolling, scroll animations
- **SEO**: Schema.org structured data, meta tags, OG/Twitter cards, sitemap, robots.txt
- **Images**: WebP format with responsive variants
- **Deployment**: Docker Compose with nginx:alpine, Traefik SSL, deploy script
- **Code Quality**: Codacy integration with ESLint, Semgrep, Trivy

### Infrastructure
- Docker container (nginx:alpine)
- Traefik reverse proxy with automatic Let's Encrypt SSL
- Domains: falconhurst.zzagroup.cloud, robinhoodsbaylet.co.uk
- ZZA VPS deployment
