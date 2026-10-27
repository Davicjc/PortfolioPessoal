# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS, and vanilla JavaScript (with GSAP / ScrollTrigger / Lenis and Firebase Firestore integration), zero build step, deployable to any static host (GitHub Pages / Cloudflare Pages at `davicjc.com`).

## Users

- **Recruiters, engineering managers, and potential clients** evaluating Davi Castro (`davicjc`) for full-stack software development, computer vision / access-control integration, and ISP network infrastructure work.
- **Open-source users, peers, and community members** using Davi's open-source tools (such as Telemetry Portal for MikroTik OSPF/BFD, ROAs Monitor Status for RPKI, Face Safety, and Base64 drawing libraries) who want to support his work or buy him a coffee (`coffee/`).

## Product Purpose

Showcase Davi Castro's work across software and network infrastructure ("from screen to router"), provide an editable Firestore-backed admin panel (`/adm`), printable bilingual ATS-ready résumés (`/Curriculo/`), and a dedicated, tactile support & sponsorship surface (`/coffee/` — "Give Me a Coffee") where visitors can fuel new open-source tools and late-night deploys via dynamic PIX (EMVCo BR Code), PayPal/Wise, GitHub Sponsors/Ko-fi, and Crypto.

## Positioning

A single engineer who writes the application software, integrates physical turnstiles and facial recognition, and operates the ISP network (MikroTik, Cisco, BGP/OSPF/RPKI, VMware, WireGuard) it runs on—presented through a hand-crafted, zero-build static architecture with embedded seed fallback and live Firestore synchronization.

## Operating Context

- Main portfolio at `/index.html` (hash routes `#/`, `#/projetos`, `#/sobre`, `#/contato`).
- Admin dashboard at `/adm/index.html` (Firebase Auth + Firestore).
- Printable bilingual CVs at `/Curriculo/index.html` and `/Curriculo/en.html`.
- Dedicated support & coffee experience at `/coffee/index.html` ("Give Me a Coffee").

## Capabilities and Constraints

- Pure static files without a bundler or server runtime.
- Bilingual/trilingual support (`pt-BR`, `en`, `es`).
- Dynamic client-side EMVCo PIX payload & CRC16 generation + zero-dependency SVG QR Code rendering.
- Multi-rail payment support: PIX, PayPal / Wise, GitHub Sponsors / Card links, and Cryptocurrency (BTC, ETH, SOL, USDT) with live QR generation.
- Respects `prefers-reduced-motion`.

## Brand Commitments

- Identity: Davi Castro (`davicjc`), signature monogram `D` and symbol `cjc` in `brand/`.
- Typography: `Archivo`, `IBM Plex Sans`, `IBM Plex Mono` (plus tactile editorial display accents where appropriate).
- Signature visual motifs: precision technical instrumentation, live interactive states, and high-craft motion.

## Evidence on Hand

- 24+ real projects documented in `index.html` seed and `fotos/projetos/*.webp`.
- 24+ verified certificates in `certificados/`.
- 5 real colleague and client testimonials in `fotos/sobremimterceiros/`.
- Contact channels: `davicjc@gmail.com`, `+55 34 99333-6186`, `github.com/Davicjc`, `linkedin.com/in/davicjc`.

## Product Principles

1. **Show the mechanism working:** Every surface demonstrates technical craft directly in the browser rather than merely claiming it.
2. **Instant resilience:** Pages render immediately from embedded data and work offline or without external build steps.
3. **Tactile reward:** Every user interaction (selecting a coffee dose, switching payment rails, generating a PIX/Crypto QR, printing a supporter receipt) responds with physical, satisfying visual feedback.
