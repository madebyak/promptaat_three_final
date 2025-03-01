[19:57:46.167] Running build in Washington, D.C., USA (East) – iad1
[19:57:46.286] Cloning github.com/madebyak/promptaat_three_final (Branch: main, Commit: 3874dac)
[19:57:46.417] Previous build caches not available
[19:57:46.823] Cloning completed: 536.000ms
[19:57:47.169] Running "vercel build"
[19:57:47.548] Vercel CLI 41.2.2
[19:57:48.399] Running "install" command: `npm install`...
[19:57:52.247] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[19:57:52.859] npm warn deprecated npmlog@5.0.1: This package is no longer supported.
[19:57:53.392] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[19:57:53.900] npm warn deprecated gauge@3.0.2: This package is no longer supported.
[19:57:54.380] npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
[19:57:55.958] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[19:57:56.122] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[19:57:57.495] npm warn deprecated jose@1.28.2: this version is no longer supported
[19:58:14.372] 
[19:58:14.373] added 783 packages, and audited 784 packages in 26s
[19:58:14.374] 
[19:58:14.374] 214 packages are looking for funding
[19:58:14.374]   run `npm fund` for details
[19:58:14.399] 
[19:58:14.399] 4 vulnerabilities (2 moderate, 2 critical)
[19:58:14.400] 
[19:58:14.400] To address all issues, run:
[19:58:14.400]   npm audit fix
[19:58:14.400] 
[19:58:14.400] Run `npm audit` for details.
[19:58:14.445] Detected Next.js version: 15.1.7
[19:58:14.445] Running "npm run build"
[19:58:15.121] 
[19:58:15.121] > promptaat_final_03@0.1.0 build
[19:58:15.122] > next build
[19:58:15.122] 
[19:58:15.714] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[19:58:15.715] This information is used to shape Next.js' roadmap and prioritize features.
[19:58:15.715] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[19:58:15.715] https://nextjs.org/telemetry
[19:58:15.715] 
[19:58:15.817]    ▲ Next.js 15.1.7
[19:58:15.818] 
[19:58:15.850]    Creating an optimized production build ...
[19:58:34.795]  ⚠ Compiled with warnings
[19:58:34.795] 
[19:58:34.796] ./src/components/cms/categories/categories-management.tsx
[19:58:34.796] Attempted import error: 'EditCategory' is not exported from './edit-category' (imported as 'EditCategory').
[19:58:34.796] 
[19:58:34.796] Import trace for requested module:
[19:58:34.796] ./src/components/cms/categories/categories-management.tsx
[19:58:34.796] 
[19:58:34.796] ./src/components/cms/categories/edit-category.tsx
[19:58:34.796] Attempted import error: './category-form' does not contain a default export (imported as 'CategoryForm').
[19:58:34.796] 
[19:58:34.796] Import trace for requested module:
[19:58:34.796] ./src/components/cms/categories/edit-category.tsx
[19:58:34.796] ./src/components/cms/categories/categories-management.tsx
[19:58:34.796] 
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.797] require.extensions is not supported by webpack. Use a loader instead.
[19:58:34.797] 
[19:58:34.797] Import trace for requested module:
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.797] ./src/app/api/auth/verify/route.ts
[19:58:34.797] 
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.797] require.extensions is not supported by webpack. Use a loader instead.
[19:58:34.797] 
[19:58:34.797] Import trace for requested module:
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.797] ./src/app/api/auth/verify/route.ts
[19:58:34.797] 
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.797] require.extensions is not supported by webpack. Use a loader instead.
[19:58:34.797] 
[19:58:34.797] Import trace for requested module:
[19:58:34.797] ./node_modules/handlebars/lib/index.js
[19:58:34.798] ./src/app/api/auth/verify/route.ts
[19:58:34.798] 
[19:58:34.798] ./src/app/[locale]/my-prompts/page.tsx
[19:58:34.798] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.798] 
[19:58:34.798] Import trace for requested module:
[19:58:34.798] ./src/app/[locale]/my-prompts/page.tsx
[19:58:34.798] 
[19:58:34.798] ./src/app/[locale]/profile/page.tsx
[19:58:34.798] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.798] 
[19:58:34.798] Import trace for requested module:
[19:58:34.798] ./src/app/[locale]/profile/page.tsx
[19:58:34.798] 
[19:58:34.798] ./src/app/api/auth/verify/route.ts
[19:58:34.799] Attempted import error: 'resend' does not contain a default export (imported as 'Resend').
[19:58:34.799] 
[19:58:34.799] Import trace for requested module:
[19:58:34.799] ./src/app/api/auth/verify/route.ts
[19:58:34.799] 
[19:58:34.799] ./src/app/api/cms/auth/me/route.ts
[19:58:34.799] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.799] 
[19:58:34.799] Import trace for requested module:
[19:58:34.799] ./src/app/api/cms/auth/me/route.ts
[19:58:34.799] 
[19:58:34.799] ./src/app/api/cms/tools/route.ts
[19:58:34.799] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.799] 
[19:58:34.799] Import trace for requested module:
[19:58:34.799] ./src/app/api/cms/tools/route.ts
[19:58:34.799] 
[19:58:34.799] ./src/app/api/cms/tools/route.ts
[19:58:34.799] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.800] 
[19:58:34.800] Import trace for requested module:
[19:58:34.800] ./src/app/api/cms/tools/route.ts
[19:58:34.800] 
[19:58:34.800] ./src/app/api/cms/tools/route.ts
[19:58:34.800] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.800] 
[19:58:34.800] Import trace for requested module:
[19:58:34.800] ./src/app/api/cms/tools/route.ts
[19:58:34.800] 
[19:58:34.800] ./src/app/api/cms/tools/route.ts
[19:58:34.800] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.800] 
[19:58:34.800] Import trace for requested module:
[19:58:34.800] ./src/app/api/cms/tools/route.ts
[19:58:34.800] 
[19:58:34.800] ./src/app/api/prompts/[id]/copy/route.ts
[19:58:34.801] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.801] 
[19:58:34.801] Import trace for requested module:
[19:58:34.801] ./src/app/api/prompts/[id]/copy/route.ts
[19:58:34.801] 
[19:58:34.801] ./src/app/cms/categories/page.tsx
[19:58:34.801] Attempted import error: '@/components/cms/categories/categories-management' does not contain a default export (imported as 'CategoriesManagement').
[19:58:34.801] 
[19:58:34.801] Import trace for requested module:
[19:58:34.801] ./src/app/cms/categories/page.tsx
[19:58:34.801] 
[19:58:34.801] ./src/app/cms/layout.tsx
[19:58:34.801] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[19:58:34.802] 
[19:58:34.802] Import trace for requested module:
[19:58:34.802] ./src/app/cms/layout.tsx
[19:58:34.802] 
[19:58:42.380] request to https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8gMEwSGFWNOITddY4.woff2 failed, reason: 
[19:58:42.381] 
[19:58:42.381] Retrying 1/3...
[19:58:42.382] request to https://fonts.gstatic.com/s/geist/v1/gyByhwUxId8gMEwcGFWNOITd.woff2 failed, reason: 
[19:58:42.382] 
[19:58:42.382] Retrying 1/3...
[19:58:51.863]  ⚠ Compiled with warnings
[19:58:51.864] 
[19:58:51.864] ./src/components/cms/categories/categories-management.tsx
[19:58:51.865] Attempted import error: 'EditCategory' is not exported from './edit-category' (imported as 'EditCategory').
[19:58:51.865] 
[19:58:51.865] Import trace for requested module:
[19:58:51.865] ./src/components/cms/categories/categories-management.tsx
[19:58:51.865] 
[19:58:51.865] ./src/components/cms/categories/edit-category.tsx
[19:58:51.866] Attempted import error: './category-form' does not contain a default export (imported as 'CategoryForm').
[19:58:51.866] 
[19:58:51.866] Import trace for requested module:
[19:58:51.866] ./src/components/cms/categories/edit-category.tsx
[19:58:51.866] ./src/components/cms/categories/categories-management.tsx
[19:58:51.866] 
[19:58:51.929]  ✓ Compiled successfully
[19:58:51.934]    Linting and checking validity of types ...
[19:59:00.317] 
[19:59:00.318] Failed to compile.
[19:59:00.318] 
[19:59:00.319] ./src/app/[locale]/my-prompts/page.tsx
[19:59:00.320] 41:14  Error: 'Link' is not defined.  react/jsx-no-undef
[19:59:00.320] 
[19:59:00.320] ./src/app/api/cms/prompts/route.ts
[19:59:00.321] 27:6  Error: 'PromptInput' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.321] 29:11  Error: 'SearchParams' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.321] 38:11  Error: 'ErrorResponse' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.322] 68:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.323] 109:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.323] 
[19:59:00.323] ./src/app/api/debug/db-test/route.ts
[19:59:00.324] 25:78  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.326] 
[19:59:00.326] ./src/components/cms/categories/categories-management.tsx
[19:59:00.327] 3:27  Error: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.327] 23:3  Error: 'MoveVertical' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.328] 120:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.328] 121:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.328] 153:3  Error: 'children' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.328] 162:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.329] 185:14  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.329] 348:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.329] 401:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.329] 404:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.329] 418:9  Error: 'handleDragEndForSubcategories' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.329] 438:66  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.330] 441:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.338] 
[19:59:00.339] ./src/components/cms/categories/category-form.tsx
[19:59:00.339] 31:10  Error: 'toast' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.339] 32:10  Error: 'Spinner' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.339] 35:11  Error: 'Category' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.339] 119:45  Error: 'isCategoriesLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.339] 125:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.340] 132:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.340] 137:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.340] 149:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.340] 154:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.340] 177:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.341] 258:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.341] 
[19:59:00.341] ./src/components/cms/categories/create-category.tsx
[19:59:00.341] 11:11  Error: 'Category' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.342] 24:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.342] 
[19:59:00.342] ./src/components/cms/categories/delete-category.tsx
[19:59:00.342] 61:58  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.342] 61:65  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.343] 
[19:59:00.343] ./src/components/cms/categories/draggable-category-table.tsx
[19:59:00.343] 52:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.343] 67:10  Error: 'isDragging' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.343] 
[19:59:00.343] ./src/components/cms/categories/edit-category.tsx
[19:59:00.343] 71:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.344] 79:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.344] 95:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.344] 101:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.344] 
[19:59:00.344] ./src/components/cms/categories/icon-picker.tsx
[19:59:00.344] 69:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.345] 163:38  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.345] 163:52  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.345] 248:9  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.345] 
[19:59:00.345] ./src/components/cms/dashboard/admin-dashboard.tsx
[19:59:00.345] 40:42  Error: 'admin' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.345] 
[19:59:00.346] ./src/components/cms/dashboard/dashboard.tsx
[19:59:00.346] 4:10  Error: 'AdminUser' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.346] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.346] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.346] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.346] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.347] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[19:59:00.348] 
[19:59:00.348] ./src/components/cms/prompts/create-prompt.tsx
[19:59:00.349] 19:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.349] 54:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.349] 
[19:59:00.349] ./src/components/cms/prompts/edit-prompt.tsx
[19:59:00.349] 31:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.349] 85:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.349] 
[19:59:00.349] ./src/components/cms/prompts/prompt-form.tsx
[19:59:00.350] 88:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 143:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 380:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 381:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 412:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 504:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.350] 
[19:59:00.351] ./src/components/cms/prompts/prompts-management.tsx
[19:59:00.351] 14:3  Error: 'buttonVariants' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.351] 50:3  Error: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.351] 57:3  Error: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.351] 59:3  Error: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.351] 172:16  Error: 'isCategoriesLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.351] 306:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.352] 
[19:59:00.352] ./src/components/cms/prompts/view-prompt.tsx
[19:59:00.352] 20:3  Error: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.352] 258:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.352] 
[19:59:00.352] ./src/components/cms/tools/create-tool.tsx
[19:59:00.353] 47:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.353] 53:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.353] 
[19:59:00.353] ./src/components/cms/tools/delete-tool.tsx
[19:59:00.353] 52:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.353] 
[19:59:00.354] ./src/components/cms/tools/edit-tool.tsx
[19:59:00.354] 47:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.354] 54:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.354] 60:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.354] 
[19:59:00.355] ./src/components/cms/tools/tool-form.tsx
[19:59:00.355] 3:10  Error: 'useState' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.355] 18:19  Error: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.365] 20:10  Error: 'Alert' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.365] 20:17  Error: 'AlertDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.365] 104:54  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.365] 104:62  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.365] 104:65  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.366] 104:72  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.366] 104:75  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.366] 104:86  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[19:59:00.366] 127:38  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[19:59:00.367] 155:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[19:59:00.368] 
[19:59:00.368] ./src/components/cms/users/users-management.tsx
[19:59:00.368] 11:10  Error: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.368] 18:17  Error: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.368] 
[19:59:00.368] ./src/components/layout/app-sidebar.tsx
[19:59:00.369] 59:10  Error: 'activeCategoryPath' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.369] 
[19:59:00.369] ./src/components/layout/category-drawer.tsx
[19:59:00.369] 13:10  Error: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.369] 17:10  Error: 'useTheme' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.369] 58:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.369] 132:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.370] 170:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.370] 
[19:59:00.370] ./src/components/layout/main-content/search-section.tsx
[19:59:00.370] 11:9  Error: 'isRTL' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.370] 
[19:59:00.370] ./src/components/layout/mobile-nav.tsx
[19:59:00.370] 50:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.371] 
[19:59:00.371] ./src/components/layout/sidebar.tsx
[19:59:00.371] 51:11  Error: 'theme' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.371] 51:18  Error: 'setTheme' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.371] 238:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.371] 276:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.371] 
[19:59:00.372] ./src/components/layout/user-menu.tsx
[19:59:00.372] 18:10  Error: 'routes' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.372] 
[19:59:00.372] ./src/components/prompts/prompt-modal.tsx
[19:59:00.372] 34:6  Warning: React Hook useEffect has a missing dependency: 'fetchPromptDetails'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[19:59:00.372] 
[19:59:00.372] ./src/components/ui/input.tsx
[19:59:00.372] 4:18  Error: An interface declaring no members is equivalent to its supertype.  @typescript-eslint/no-empty-object-type
[19:59:00.373] 
[19:59:00.373] ./src/components/ui/sidebar.tsx
[19:59:00.373] 32:3  Error: 'collapsible' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[19:59:00.373] 
[19:59:00.373] ./src/components/ui/textarea.tsx
[19:59:00.373] 5:18  Error: An interface declaring no members is equivalent to its supertype.  @typescript-eslint/no-empty-object-type
[19:59:00.373] 
[19:59:00.374] ./src/components/ui/use-toast.ts
[19:59:00.374] 19:7  Error: 'actionTypes' is assigned a value but only used as a type.  @typescript-eslint/no-unused-vars
[19:59:00.374] 
[19:59:00.374] ./src/lib/cms/auth/admin-auth.ts
[19:59:00.374] 17:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.374] 
[19:59:00.374] ./src/lib/constants/category-icons.tsx
[19:59:00.375] 169:18  Error: '_' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.375] 
[19:59:00.375] ./src/lib/prisma/client.ts
[19:59:00.375] 4:3  Error: ES2015 module syntax is preferred over namespaces.  @typescript-eslint/no-namespace
[19:59:00.375] 16:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.375] 17:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.376] 19:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[19:59:00.376] 
[19:59:00.376] ./src/middleware.ts
[19:59:00.376] 61:12  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[19:59:00.376] 
[19:59:00.377] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[19:59:00.384] Error: Command "npm run build" exited with 1
[19:59:00.724] 