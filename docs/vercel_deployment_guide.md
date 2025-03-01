# Vercel Deployment Guide for Promptaat

This guide provides step-by-step instructions for deploying the Promptaat application to Vercel.

## Prerequisites

1. A Vercel account
2. Git repository with your Promptaat codebase
3. Database (PostgreSQL) set up and accessible from the internet
4. Resend API key for email functionality

## Step 1: Prepare Your Environment Variables

Ensure you have all the required environment variables ready:

```
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=your_nextauth_url
JWT_SECRET=your_jwt_secret

# Email Service
RESEND_API_KEY=your_resend_api_key

# Application URLs
NEXT_PUBLIC_APP_URL=your_app_url
NEXT_PUBLIC_API_URL=your_api_url
```

## Step 2: Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your Git repository
4. Select the repository containing your Promptaat application

## Step 3: Configure Project Settings

1. **Framework Preset**: Select "Next.js"
2. **Root Directory**: Leave as default (if your project is at the root)
3. **Build Command**: Leave as default (it will use the one in package.json)
4. **Output Directory**: Leave as default (.next)
5. **Install Command**: Leave as default (npm install)

## Step 4: Add Environment Variables

1. Expand the "Environment Variables" section
2. Add all the required environment variables from Step 1
3. Make sure to set the correct values for each environment
   - Production environment
   - Preview environments (optional)
   - Development environment (optional)

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Vercel will provide a URL for your deployed application

## Step 6: Verify Deployment

1. Visit the provided URL
2. Test key functionality:
   - Authentication (login, register)
   - Prompt creation and viewing
   - Category navigation
   - Search functionality
   - Admin functionality (if applicable)

## Step 7: Set Up Custom Domain (Optional)

1. Go to your project settings
2. Click on "Domains"
3. Add your custom domain
4. Follow the instructions to configure DNS settings

## Troubleshooting

### Build Failures

If your build fails, check the build logs for errors:

1. Common issues include:
   - Missing environment variables
   - TypeScript errors
   - ESLint errors (should be bypassed with --no-lint)
   - Missing dependencies

2. Fix the issues locally, then push the changes to your repository

### Runtime Errors

If your application deploys but doesn't work correctly:

1. Check the Vercel logs for runtime errors
2. Verify that all environment variables are set correctly
3. Ensure your database is accessible from Vercel's servers
4. Check for CORS issues if your API isn't working

## Continuous Deployment

Vercel automatically deploys when you push changes to your repository. To optimize this workflow:

1. Use preview deployments for pull requests
2. Set up branch protection rules in your repository
3. Consider adding automated tests to run before deployment

## Conclusion

Your Promptaat application should now be successfully deployed to Vercel. If you encounter any issues, refer to the deployment_fixes.md and deployment_best_practices.md documents for additional guidance.
