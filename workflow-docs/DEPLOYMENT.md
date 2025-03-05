# Deployment Guide for Promptaat

This guide outlines the process for safely deploying Promptaat to production using Vercel.

## Pre-Deployment Testing

To avoid deployment issues, always test your changes in a production-like environment before pushing to GitHub:

### 1. Run Pre-Deployment Checks

```bash
npm run pre-deploy
```

This script checks for:
- TypeScript errors
- ESLint issues
- Missing Link imports
- Mixed exports that could cause problems
- Other common issues

### 2. Test in Production Mode Locally

```bash
npm run test:prod
```

This builds and runs the application in production mode locally, allowing you to test your changes in an environment similar to Vercel.

Alternatively, you can use:

```bash
npm run vercel:local
```

### 3. Complete the Feature Preservation Checklist

Before deploying, document the critical features in the `feature-preservation-checklist.md` file. This helps ensure that important functionality isn't lost during deployment.

## Common Issues and Solutions

### Import/Export Issues

One of the most common causes of deployment failures is inconsistent imports and exports. Make sure:

- Components are exported consistently (either as default exports or named exports, not both)
- All imports match the corresponding exports
- No circular dependencies exist

### Environment Variables

Ensure all required environment variables are:
1. Set in your local `.env` file for testing
2. Added to the Vercel project settings for production

### TypeScript and ESLint Errors

While development builds may ignore these with `--no-lint`, production builds on Vercel will fail if there are errors. Fix all TypeScript and ESLint errors before deploying.

## Deployment Process

1. Run `npm run pre-push` to perform all checks
2. Commit your changes with a descriptive message
3. Push to GitHub
4. Monitor the Vercel deployment
5. After deployment, verify all features using the feature preservation checklist

## Rollback Plan

If a deployment fails or causes issues:
1. Revert to the previous commit in GitHub
2. Vercel will automatically deploy the previous version
3. Document what went wrong for future reference

## Troubleshooting Vercel Deployments

If you encounter issues with Vercel deployments:

1. Check the Vercel build logs for specific errors
2. Look for import/export mismatches
3. Verify that all dependencies are correctly installed
4. Check for environment variable issues
5. Test the problematic code in a local production build

Remember: Local development with Turbopack may behave differently than Vercel's production environment. Always test in a production-like environment before deploying.
