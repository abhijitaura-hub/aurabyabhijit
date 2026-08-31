# AURA BY ABHIJIT — PRD

## Original Problem Statement
Build a world-class personal technology authority website for Abhijit Debnath (aurabyabhijit.com): "Technology Leadership for an Intelligent Future." A personal leadership/advisory/thought-leadership platform — NOT a generic IT services site. Strict truth rules: only verified facts (20+ yrs IT, 10+ yrs leadership, 65+ distributed locations, enterprise/cloud/Azure/security/transformation/governance/automation/AI). Never fabricate awards, clients, testimonials, stats, or URLs. Premium Dark Editorial Technology design system; Sora headings / Inter body; obsidian + electric cyan + subtle violet; WCAG 2.2 AA; SEO foundation; future-proof content architecture.

## Architecture
- Frontend: React 19 + Tailwind (brand palette: red #ff2e3e "crimson" + black/white, per Abhijit's logo), framer-motion (reveals, masked line hero), lenis (smooth scroll), react-router-dom (11 routes), react-helmet-async (SEO + JSON-LD Person/WebSite/Article schema). Content separated in src/data/site.js. Official AURA logo + real portrait integrated (hero frame, home teaser, about page, navbar mark, footer lockup, favicons).
- Backend: FastAPI + MongoDB (motor). /api/articles (filter/search/pagination), /api/articles/{slug} (+related), /api/contact (validation + honeypot), /api/admin/login (bcrypt + JWT + brute-force lockout), /api/admin/messages (Bearer).
- Ops: robots.txt, sitemap.xml, Google Fonts preconnect, film-grain overlay, blueprint grid, prefers-reduced-motion respected.

## User Personas
CEO/CIO/CTO evaluating credibility; advisory clients; recruiters; YouTube/LinkedIn followers; first-time visitors (5-second test).

## Implemented (2026-08-31)
- Home: kinetic masked-line hero + abstract "AD" monogram portrait frame w/ canvas node network + mouse parallax; credibility strip (20+/10+/65+/Enterprise); editorial marquee; Six Dimensions interactive cards; Philosophy manifesto with contrast pairs; From the Field tabbed experience cards (Problem→Thinking→Approach→Outcome); AURA Decision Framework scroll-progress timeline; Perspective preview; About teaser; Speaking strip; Final CTA.
- Pages: About (story + verified experience + career timeline + principles), Expertise (6 dimensions deep-dive + framework + advisory areas), Perspective (featured + filters + search), Article detail (breadcrumbs, share, related, schema), Projects (honest "coming soon" + case-study structure), Speaking (topics + YouTube/LinkedIn placeholders + Invite Abhijit), Work With Me (6 advisory areas + engagement steps), Contact (validated form → MongoDB), Privacy & Terms (editable placeholders, marked for legal review), Admin inbox, 404.
- Backend: 4 seeded draft articles (marked "Draft — awaiting review"), contact storage, admin JWT auth with lockout.
- Verified: health/articles/article/contact/admin endpoints via curl; hero, framework, filters, article, contact success, mobile hero + menu via screenshots; no console errors.

## Backlog / Next
- P0: Abhijit reviews/edits the 4 draft articles; configure LinkedIn/YouTube URLs (SOCIALS in site.js). DONE 2026-08-31: official AURA logo integrated (navbar mark, footer full lockup, favicons) + Abhijit's real portrait integrated (hero frame, home about teaser, about page) with identity-safe treatment only (crop, grade, edge vignette).
- P1: Resend email notification on contact submit; GA4 analytics via env var; OG share images; case studies content. DONE 2026-08-31: Article Studio live in /admin (write/edit/publish/delete articles, draft vs published, featured flag, SEO fields, heading/quote/paragraph blocks, auto reading time, auto slugs) + hero image uploads via Emergent object storage (POST /api/admin/upload auth-guarded, public GET /api/media/{path}, covers render on cards + article pages).
- P2: Newsletter signup; videos/podcasts/courses sections (architecture ready); CMS migration; Lighthouse/perf audit pass; sitemap auto-generation including articles.
