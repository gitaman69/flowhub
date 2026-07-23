# Security Policy

## Supported Versions

FlowKit is pre-1.0 (`0.0.x`). Only the latest published version of each `@flowhub/*` package receives security fixes.

| Version | Supported |
|---|---|
| latest `0.0.x` | ✅ |
| anything older | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email **amanevilbhakar@gmail.com** 

- A description of the vulnerability and its impact
- Steps to reproduce (a minimal repro is ideal)
- Which `@flowhub/*` package(s) and version(s) are affected

You'll get an acknowledgment within 3 business days. We'll work with you on a disclosure timeline once the issue is confirmed and a fix is ready — please don't disclose publicly until then.

## Scope

In scope: any `@flowhub/*` package published from this repository. Vulnerabilities in third-party provider SDKs you integrate via a `*Provider`/`*Verifier` implementation (Twilio, Stripe, AWS SDKs, etc.) should be reported to that vendor directly.
