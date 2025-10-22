# Production Deployment Guide - Flipstack CRM

## Multi-Domain Production Configuration

This document outlines the production-ready multi-domain configuration for Flipstack CRM.

### Domain Structure

- **Main Domain**: `kevnbenestate.org` - Primary domain
- **App Subdomain**: `flipstackk.kevnbenestate.org` - Main CRM application
- **Admin Subdomain**: `admin.flipstackk.kevnbenestate.org` - Administrative interface
- **API Endpoints**: `flipstackk.kevnbenestate.org/api` - API endpoints

### Production Environment Variables

Required environment variables for production deployment:

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth Configuration
NEXTAUTH_URL="https://flipstackk.kevnbenestate.org"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_TRUST_HOST="true"

# Domain Configuration
NEXT_PUBLIC_MAIN_DOMAIN="kevnbenestate.org"
NEXT_PUBLIC_APP_URL="https://flipstackk.kevnbenestate.org"
NEXT_PUBLIC_API_URL="https://flipstackk.kevnbenestate.org/api"

# Multi-Domain Support
ALLOWED_DOMAINS="kevnbenestate.org,*.kevnbenestate.org,flipstackk.kevnbenestate.org,admin.flipstackk.kevnbenestate.org"
CORS_ORIGINS="https://flipstackk.kevnbenestate.org,https://*.kevnbenestate.org,https://admin.flipstackk.kevnbenestate.org"

# Production Settings
NODE_ENV="production"
```

### Security Features

#### 1. Production Middleware
- **Rate Limiting**: 100 requests per minute per IP
- **Security Headers**: HSTS, CSP, XSS Protection
- **CORS Configuration**: Strict origin validation
- **Content Security Policy**: Prevents XSS attacks

#### 2. API Security
- **Production CORS**: Validates against allowed origins
- **Security Headers**: Applied to all API responses
- **Rate Limiting**: Applied to API and auth endpoints
- **Cache Control**: Optimized for production performance
- **API Versioning**: Version headers for compatibility

#### 3. Authentication Security
- **Secure Cookies**: Production-grade cookie configuration with __Secure- and __Host- prefixes
- **Cross-Domain Sessions**: Shared across subdomains with .kevnbenestate.org domain
- **CSRF Protection**: Enhanced token security with __Host- prefix
- **Session Management**: 24-hour session expiry with secure flags
- **SameSite Policy**: None for cross-domain, Lax for development

### Deployment Configuration

#### Vercel Configuration (`vercel.json`)
- **Multi-Domain Support**: Configured for all subdomains
- **SSL/TLS**: Automatic HTTPS enforcement
- **Security Headers**: Applied globally
- **Redirects**: www to non-www redirect
- **Rewrites**: Subdomain routing configuration

#### DNS Configuration
Required DNS records:
```
A     kevnbenestate.org                    → Vercel IP
CNAME flipstackk.kevnbenestate.org      → kevnbenestate.org
CNAME admin.flipstackk.kevnbenestate.org → kevnbenestate.org
CNAME www.kevnbenestate.org             → kevnbenestate.org
```

### Performance Optimizations

1. **CDN Configuration**: Vercel Edge Network
2. **Caching Strategy**: API responses cached for 5 minutes
3. **Static Assets**: Optimized delivery
4. **Image Optimization**: Next.js Image component
5. **Code Splitting**: Automatic route-based splitting

### Monitoring and Analytics

- **Error Tracking**: Production error logging
- **Performance Monitoring**: Core Web Vitals tracking
- **Security Monitoring**: Rate limit and security header validation
- **API Analytics**: Request/response monitoring

### Deployment Checklist

- [ ] Environment variables configured
- [ ] DNS records set up
- [ ] SSL certificates verified
- [ ] Security headers tested
- [ ] CORS configuration validated
- [ ] Rate limiting tested
- [ ] Multi-domain authentication verified
- [ ] Performance metrics baseline established

### Troubleshooting

#### Common Issues

1. **CORS Errors**: Verify allowed origins in environment variables
2. **Authentication Issues**: Check cookie domain configuration
3. **Rate Limiting**: Monitor rate limit headers
4. **SSL Issues**: Verify HTTPS enforcement

#### Debug Commands

```bash
# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Test API endpoints
curl -H "Origin: https://flipstackk.kevnbenestate.org" https://flipstackk.kevnbenestate.org/api/leads
```

### Security Best Practices

1. **Environment Variables**: Never commit secrets to repository
2. **API Keys**: Use environment-specific keys
3. **HTTPS Only**: Enforce HTTPS in production
4. **Regular Updates**: Keep dependencies updated
5. **Security Audits**: Regular security reviews

This configuration ensures a production-ready, secure, and scalable multi-domain deployment for Flipstack CRM.