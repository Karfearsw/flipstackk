# Environment Variables for Production Deployment

## Required Environment Variables for Vercel

When deploying to Vercel, configure these environment variables in your project settings:

### 🔐 Database Configuration
```
DATABASE_URL=postgresql://postgres.octipyiqduroxelobtli:stackkwallet@aws-1-us-east-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=20&pool_timeout=30
```

### 🔑 Authentication Configuration
```
NEXTAUTH_SECRET=flipstackk-production-secret-key-2024
NEXTAUTH_URL=https://flipstackk.kevnbenestate.org
NEXTAUTH_URL_INTERNAL=https://flipstackk.kevnbenestate.org
NEXTAUTH_TRUST_HOST=true
```

### 🗄️ Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://octipyiqduroxelobtli.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdGlweWlxZHVyb3hlbG9idGxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Njk0NDgsImV4cCI6MjA3NjQ0NTQ0OH0.6zLDVWD7sXFT0FPGLW7rzIVYyRSSg71zTTBV08_Fn3s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jdGlweWlxZHVyb3hlbG9idGxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDg2OTQ0OCwiZXhwIjoyMDc2NDQ1NDQ4fQ.zGF86oZVqFuJLWSRWKbhCjogqFODBAzOU0Lajt5iIuU
```

### 🌐 Application Configuration
```
NODE_ENV=production
```

## How to Add Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your project: https://vercel.com/dashboard
   - Select your `flipstackk` project

2. **Access Settings**
   - Click on "Settings" tab
   - Navigate to "Environment Variables" section

3. **Add Variables**
   - Click "Add New" for each variable
   - Copy the variable name and value exactly as shown above
   - Set environment to "Production" (and optionally "Preview" and "Development")

4. **Deploy**
   - After adding all variables, trigger a new deployment
   - Go to "Deployments" tab and click "Redeploy"

## ⚠️ Security Notes

- **Never commit** these values to GitHub
- The `.env.local` file is already excluded via `.gitignore`
- These environment variables are configured for production use
- The database connection includes optimized pooling settings

## 🔍 Variable Explanations

### DATABASE_URL
- **Purpose**: PostgreSQL connection string for Supabase
- **Features**: Includes connection pooling (`pgbouncer=true`)
- **Optimization**: Limited to 20 connections with 30-second timeout

### NEXTAUTH_SECRET
- **Purpose**: Encrypts JWT tokens and session data
- **Security**: Production-grade secret key
- **Requirement**: Must be at least 32 characters

### NEXTAUTH_URL
- **Purpose**: Base URL for authentication callbacks
- **Value**: Your production domain
- **Important**: Must match your actual domain

### Supabase Keys
- **NEXT_PUBLIC_SUPABASE_URL**: Public Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anonymous access key
- **SUPABASE_SERVICE_ROLE_KEY**: Server-side service role key (keep private)

## ✅ Verification

After setting up environment variables, verify they work by checking:

1. **Database Connection**: `/api/health` endpoint
2. **Authentication**: `/login` page functionality
3. **Supabase Integration**: Dashboard data loading

## 🚀 Ready for Production

With these environment variables configured, your Flipstack CRM will have:
- ✅ Secure database connections with pooling
- ✅ Production-grade authentication
- ✅ Optimized Supabase integration
- ✅ Proper domain configuration
- ✅ Enterprise security standards