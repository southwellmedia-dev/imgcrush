# Security

## Overview

ImgCrush is a client-side image processing tool that runs entirely in your browser. Your images never leave your device - all processing happens locally.

## Our Security Approach

- **100% Client-Side**: No server uploads, no backend, no data collection
- **Complete Privacy**: Your images are processed locally and never transmitted
- **Open Source**: All code is publicly auditable on GitHub
- **Minimal Dependencies**: We use well-maintained, trusted packages only

## Reporting Security Issues

While ImgCrush is a client-side tool, we still take security seriously. If you discover a security vulnerability:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to the repository's Security tab
   - Click "Report a vulnerability"

2. **GitHub Issues**
   - For non-sensitive issues, you can open a regular GitHub issue
   - Tag it with "security" label

## Security Best Practices

### When Using ImgCrush

- Always use the official deployment or build from source
- Keep your browser up to date
- Use HTTPS when accessing hosted versions

### When Self-Hosting

- Serve over HTTPS
- Implement Content Security Policy headers
- Keep dependencies updated with `npm audit`

## Scope

### In Scope
- Client-side code vulnerabilities (XSS, etc.)
- Dependency vulnerabilities
- Privacy concerns

### Out of Scope
- Browser vulnerabilities (report to browser vendors)
- Third-party service issues (GitHub, npm, CDNs)
- Performance issues without security impact

---

Thank you for helping keep ImgCrush safe and secure!
