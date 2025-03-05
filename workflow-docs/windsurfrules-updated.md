# Promptaat Windsurf AI Agent Rules

## Project Understanding Rules

- Always analyze the Next.js 15 app router structure before making changes
- Understand the complete codebase structure, especially the component relationships
- Identify and preserve key TypeScript interfaces and types
- Recognize the i18n implementation for Arabic and English support
- Be aware of the authentication flow and critical CMS functionality

## Development Workflow Rules

- Follow the development workflow outlined in workflow-docs/reliable-deployment-workflow.md
- Always complete the pre-development phase before starting work
- Make incremental changes with consistent commit messages
- Test components in both development and production modes
- Prioritize type safety and proper TypeScript usage
- Validate i18n compatibility for all UI components

## Code Quality Rules

- Enforce TypeScript types for all component props and functions
- Never use 'any' type without explicit justification
- Maintain consistent export patterns (avoid mixing default and named exports)
- Always import Link properly from 'next/link'
- Write clean, modular components that follow the established architecture
- Use shadcn/ui components for consistent UI across the application
- Implement responsive design for all UI components
- Follow Tailwind CSS best practices with consistent class naming

## Pre-Deployment Validation Rules

- Always run `npm run pre-deploy` before pushing changes
- Test in production mode using `npm run test:prod` or `npm run vercel:local`
- Complete the feature preservation checklist in feature-preservation-checklist.md
- Fix all TypeScript and ESLint errors without exceptions
- Verify all components work in both development and production modes
- Test both English and Arabic language versions
- Ensure responsive design works on mobile, tablet, and desktop

## Troubleshooting Rules

- Use the deployment troubleshooting guide to diagnose issues
- Understand the differences between Turbopack and standard Next.js builds
- Check for import/export mismatches as a first step for component errors
- Verify environment variables are properly configured
- Isolate component issues through incremental testing
- Document any new issues and their solutions

## Feature Preservation Rules

- Ensure core authentication features remain functional
- Maintain CMS capabilities for content management
- Preserve responsive design across all screen sizes
- Keep i18n support working correctly for both languages
- Verify critical user flows remain intact
- Test navigation patterns thoroughly
- Validate form submissions and data persistence

## Code Change Best Practices

- Make minimal, focused changes to solve specific problems
- Test all changes in production mode before submitting
- Document your changes thoroughly
- Provide clear explanations for complex logic
- Add appropriate comments for future reference
- Split large changes into smaller, manageable parts
- Verify backward compatibility with existing features

## Error Handling Rules

- Implement proper error boundaries around client components
- Use consistent error handling patterns across the application
- Display user-friendly error messages
- Log detailed errors for debugging purposes
- Handle edge cases and unexpected input
- Provide fallback UI for component failures
- Consider both client and server-side error scenarios

## Performance Optimization Rules

- Use proper code-splitting with dynamic imports for large components
- Optimize image loading with Next.js Image component
- Implement proper caching strategies for API requests
- Minimize unnecessary re-renders with React.memo and useMemo
- Keep bundle size in check by avoiding unnecessary dependencies
- Monitor and optimize database queries
- Ensure fast initial page load times

## Documentation Rules

- Update documentation when making significant changes
- Document complex business logic and architectural decisions
- Keep API documentation current
- Note any workarounds or special considerations
- Document environment variable requirements
- Maintain up-to-date deployment instructions
