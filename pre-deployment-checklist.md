# Pre-Deployment Checklist for Promptaat

Use this checklist before pushing changes to GitHub for Vercel deployment to ensure a smooth production deployment.

## 1. Code Quality Checks

- [ ] Run `npm run build:test` to check for TypeScript and ESLint errors
- [ ] Fix all TypeScript errors (especially those related to missing imports or exports)
- [ ] Fix all ESLint warnings that might cause build failures
- [ ] Ensure all components that use `Link` have proper imports from 'next/link'

## 2. Local Production Testing

- [ ] Run `npm run vercel:local` to test a production build locally
- [ ] Verify all main features work in the production build:
  - [ ] Authentication
  - [ ] CMS features
  - [ ] Prompt creation and management
  - [ ] Category navigation
  - [ ] User profile features
- [ ] Test all new features in this production-like environment

## 3. Common Issues to Check

- [ ] Verify all imports/exports are consistent (no mix of default and named exports)
- [ ] Check for any `any` types that should be properly typed
- [ ] Ensure no circular dependencies exist in the codebase
- [ ] Verify all environment variables are properly set in .env.local and Vercel

## 4. Feature Preservation

- [ ] Document all key features that must be preserved in this deployment
- [ ] Take screenshots of critical UI components before deployment for comparison
- [ ] Create a rollback plan in case of deployment issues

## 5. Deployment Process

- [ ] Commit changes with a descriptive message
- [ ] Push to GitHub and monitor Vercel deployment
- [ ] After deployment, immediately test the live site for:
  - [ ] Broken links
  - [ ] Missing features
  - [ ] Visual regressions
  - [ ] Authentication flows

## Notes for This Deployment

*Add specific notes about what features are being deployed and what to watch for during testing:*

- 
- 
- 

## Post-Deployment Verification

- [ ] All features from the "Feature Preservation" list are working
- [ ] No new errors appear in the browser console
- [ ] Site performance is acceptable
- [ ] Mobile responsiveness is maintained
