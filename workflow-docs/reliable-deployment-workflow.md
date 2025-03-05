# Promptaat Reliable Deployment Workflow

This document outlines a comprehensive workflow for ensuring reliable deployments with Promptaat. Following these steps will help minimize the gap between local development and production environments, reducing deployment failures and preserving functionality.

## Workflow Overview

![Deployment Workflow](https://via.placeholder.com/800x400?text=Promptaat+Deployment+Workflow)

## 1. Pre-development Phase

Before starting work on a new feature or bug fix:

- [ ] Pull the latest changes from the main branch
- [ ] Create a feature branch with a descriptive name (e.g., `feature/auth-improvements`, `fix/sidebar-navigation`)
- [ ] Review the feature-preservation-checklist.md to understand what must be maintained
- [ ] Familiarize yourself with any new dependencies or architectural changes

```bash
git checkout main
git pull
git checkout -b feature/your-feature-name
```

## 2. Development Phase

During active development:

- [ ] Use standard development practices while coding (`npm run dev`)
- [ ] Add `// @ts-check` to the top of your files to get immediate TypeScript feedback
- [ ] Test components in isolation before integrating them into the full application
- [ ] Be consistent with imports, especially for Next.js components like `Link` from `next/link`
- [ ] Regularly commit your changes with descriptive messages

### Development Best Practices

- Separate UI components from data fetching logic
- Use TypeScript properly with defined interfaces for props and state
- Ensure all components support both languages (Arabic/English)
- Verify mobile and desktop views during development
- Follow the shadcn/ui component patterns consistently
- Test navigation flows thoroughly

## 3. Pre-commit Phase

Before committing significant changes:

- [ ] Run the pre-deployment check
  ```bash
  npm run pre-deploy
  ```
- [ ] Fix any TypeScript errors that are detected
- [ ] Resolve ESLint issues
- [ ] Fix any missing Link imports or export issues
- [ ] Manually test the feature in development mode

### Common Issues to Watch For

- Mixed export styles (using both named and default exports)
- Missing imports for `Link` components
- Inconsistent use of `useRouter` vs `usePathname`
- TypeScript errors that development mode ignores
- Missing environment variables

## 4. Local Production Testing

After your feature works in development:

- [ ] Build and test in production mode locally:
  ```bash
  npm run test:prod
  ```
- [ ] Verify all features still work as expected in production mode
- [ ] Pay special attention to:
  - Navigation
  - State management
  - API calls
  - Authentication flows
  - Responsive design
  - i18n functionality

### Alternative Command

If you need more control over the production build:

```bash
npm run vercel:local
```

## 5. Pre-push Checklist

Before pushing to GitHub:

- [ ] Update the feature-preservation-checklist.md for your changes
- [ ] Document what functionality needs to be verified after deployment
- [ ] Run the full suite of checks:
  ```bash
  npm run pre-push
  ```
- [ ] Ensure your branch is up-to-date with the main branch

## 6. Pull Request & Code Review

When your feature is ready:

- [ ] Create a pull request with a descriptive title and detailed description
- [ ] Ensure GitHub Actions passes all checks
- [ ] Address any review comments promptly
- [ ] Once approved, merge to main

## 7. Post-deployment Verification

After the code is deployed to Vercel:

- [ ] Go through the feature-preservation-checklist.md
- [ ] Verify that core functionality still works properly:
  - Authentication
  - CMS features
  - Navigation
  - Search functionality
  - Language switching
- [ ] Test any new features in the production environment
- [ ] Document any issues for future reference

## Troubleshooting Deployment Issues

If you encounter deployment failures:

1. Check the Vercel build logs for specific errors
2. Look for common issues:
   - Import/export mismatches
   - TypeScript errors
   - Missing environment variables
   - Library compatibility issues
3. Test the fix locally in production mode before redeploying
4. If necessary, revert to the previous working commit

## Rollback Plan

In case of critical failures:

1. Identify the last stable deployment
2. Revert to that commit:
   ```bash
   git revert HEAD~1
   ```
3. Push the revert commit to GitHub
4. Verify that the rollback resolves the issue
5. Document what went wrong

## Best Practices for Long-term Stability

- Regularly update dependencies with `npm update`
- Periodically run full production tests even without changes
- Keep documentation up-to-date
- Review and update the deployment workflow as needed
- Maintain a comprehensive test suite

---

**Remember**: The key differences between development and production environments in Next.js (especially with Turbopack) can cause unexpected issues. Always test in a production-like environment before deployment.
