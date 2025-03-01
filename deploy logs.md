[22:13:33.368] Running build in Washington, D.C., USA (East) – iad1
[22:13:33.504] Cloning github.com/madebyak/promptaat_three_final (Branch: main, Commit: 3874dac)
[22:13:33.521] Skipping build cache, deployment was triggered without cache.
[22:13:34.530] Cloning completed: 1.025s
[22:13:34.848] Running "vercel build"
[22:13:35.235] Vercel CLI 41.2.2
[22:13:35.575] Running "install" command: `npm install`...
[22:13:41.035] npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
[22:13:41.557] npm warn deprecated npmlog@5.0.1: This package is no longer supported.
[22:13:42.113] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[22:13:42.596] npm warn deprecated gauge@3.0.2: This package is no longer supported.
[22:13:43.018] npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
[22:13:44.611] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[22:13:44.740] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[22:13:46.136] npm warn deprecated jose@1.28.2: this version is no longer supported
[22:14:06.091] 
[22:14:06.092] added 783 packages, and audited 784 packages in 30s
[22:14:06.092] 
[22:14:06.093] 214 packages are looking for funding
[22:14:06.093]   run `npm fund` for details
[22:14:06.114] 
[22:14:06.115] 4 vulnerabilities (2 moderate, 2 critical)
[22:14:06.115] 
[22:14:06.116] To address all issues, run:
[22:14:06.116]   npm audit fix
[22:14:06.116] 
[22:14:06.116] Run `npm audit` for details.
[22:14:06.169] Detected Next.js version: 15.1.7
[22:14:06.170] Running "npm run build"
[22:14:06.298] 
[22:14:06.298] > promptaat_final_03@0.1.0 build
[22:14:06.298] > next build
[22:14:06.298] 
[22:14:06.892] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[22:14:06.893] This information is used to shape Next.js' roadmap and prioritize features.
[22:14:06.893] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[22:14:06.893] https://nextjs.org/telemetry
[22:14:06.893] 
[22:14:06.996]    ▲ Next.js 15.1.7
[22:14:06.996] 
[22:14:07.029]    Creating an optimized production build ...
[22:14:26.649]  ⚠ Compiled with warnings
[22:14:26.649] 
[22:14:26.649] ./src/components/cms/categories/categories-management.tsx
[22:14:26.649] Attempted import error: 'EditCategory' is not exported from './edit-category' (imported as 'EditCategory').
[22:14:26.649] 
[22:14:26.649] Import trace for requested module:
[22:14:26.650] ./src/components/cms/categories/categories-management.tsx
[22:14:26.650] 
[22:14:26.650] ./src/components/cms/categories/edit-category.tsx
[22:14:26.650] Attempted import error: './category-form' does not contain a default export (imported as 'CategoryForm').
[22:14:26.650] 
[22:14:26.650] Import trace for requested module:
[22:14:26.650] ./src/components/cms/categories/edit-category.tsx
[22:14:26.650] ./src/components/cms/categories/categories-management.tsx
[22:14:26.650] 
[22:14:26.650] ./node_modules/handlebars/lib/index.js
[22:14:26.650] require.extensions is not supported by webpack. Use a loader instead.
[22:14:26.650] 
[22:14:26.650] Import trace for requested module:
[22:14:26.650] ./node_modules/handlebars/lib/index.js
[22:14:26.651] ./src/app/api/auth/verify/route.ts
[22:14:26.651] 
[22:14:26.651] ./node_modules/handlebars/lib/index.js
[22:14:26.651] require.extensions is not supported by webpack. Use a loader instead.
[22:14:26.651] 
[22:14:26.651] Import trace for requested module:
[22:14:26.651] ./node_modules/handlebars/lib/index.js
[22:14:26.651] ./src/app/api/auth/verify/route.ts
[22:14:26.651] 
[22:14:26.651] ./node_modules/handlebars/lib/index.js
[22:14:26.651] require.extensions is not supported by webpack. Use a loader instead.
[22:14:26.651] 
[22:14:26.651] Import trace for requested module:
[22:14:26.651] ./node_modules/handlebars/lib/index.js
[22:14:26.651] ./src/app/api/auth/verify/route.ts
[22:14:26.651] 
[22:14:26.651] ./src/app/[locale]/my-prompts/page.tsx
[22:14:26.652] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.652] 
[22:14:26.652] Import trace for requested module:
[22:14:26.652] ./src/app/[locale]/my-prompts/page.tsx
[22:14:26.652] 
[22:14:26.652] ./src/app/[locale]/profile/page.tsx
[22:14:26.652] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.652] 
[22:14:26.652] Import trace for requested module:
[22:14:26.652] ./src/app/[locale]/profile/page.tsx
[22:14:26.652] 
[22:14:26.652] ./src/app/api/auth/verify/route.ts
[22:14:26.652] Attempted import error: 'resend' does not contain a default export (imported as 'Resend').
[22:14:26.653] 
[22:14:26.653] Import trace for requested module:
[22:14:26.653] ./src/app/api/auth/verify/route.ts
[22:14:26.653] 
[22:14:26.653] ./src/app/api/cms/auth/me/route.ts
[22:14:26.653] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.653] 
[22:14:26.653] Import trace for requested module:
[22:14:26.653] ./src/app/api/cms/auth/me/route.ts
[22:14:26.653] 
[22:14:26.653] ./src/app/api/cms/tools/route.ts
[22:14:26.653] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.653] 
[22:14:26.653] Import trace for requested module:
[22:14:26.653] ./src/app/api/cms/tools/route.ts
[22:14:26.653] 
[22:14:26.653] ./src/app/api/cms/tools/route.ts
[22:14:26.654] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.654] 
[22:14:26.654] Import trace for requested module:
[22:14:26.654] ./src/app/api/cms/tools/route.ts
[22:14:26.654] 
[22:14:26.654] ./src/app/api/cms/tools/route.ts
[22:14:26.654] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.654] 
[22:14:26.654] Import trace for requested module:
[22:14:26.654] ./src/app/api/cms/tools/route.ts
[22:14:26.654] 
[22:14:26.654] ./src/app/api/cms/tools/route.ts
[22:14:26.654] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.654] 
[22:14:26.654] Import trace for requested module:
[22:14:26.654] ./src/app/api/cms/tools/route.ts
[22:14:26.655] 
[22:14:26.655] ./src/app/api/prompts/[id]/copy/route.ts
[22:14:26.655] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.655] 
[22:14:26.655] Import trace for requested module:
[22:14:26.655] ./src/app/api/prompts/[id]/copy/route.ts
[22:14:26.655] 
[22:14:26.655] ./src/app/cms/categories/page.tsx
[22:14:26.655] Attempted import error: '@/components/cms/categories/categories-management' does not contain a default export (imported as 'CategoriesManagement').
[22:14:26.655] 
[22:14:26.661] Import trace for requested module:
[22:14:26.661] ./src/app/cms/categories/page.tsx
[22:14:26.662] 
[22:14:26.662] ./src/app/cms/layout.tsx
[22:14:26.662] Attempted import error: 'authOptions' is not exported from '@/lib/auth/auth' (imported as 'authOptions').
[22:14:26.662] 
[22:14:26.662] Import trace for requested module:
[22:14:26.662] ./src/app/cms/layout.tsx
[22:14:26.663] 
[22:14:43.724]  ⚠ Compiled with warnings
[22:14:43.725] 
[22:14:43.725] ./src/components/cms/categories/categories-management.tsx
[22:14:43.725] Attempted import error: 'EditCategory' is not exported from './edit-category' (imported as 'EditCategory').
[22:14:43.725] 
[22:14:43.726] Import trace for requested module:
[22:14:43.726] ./src/components/cms/categories/categories-management.tsx
[22:14:43.726] 
[22:14:43.726] ./src/components/cms/categories/edit-category.tsx
[22:14:43.726] Attempted import error: './category-form' does not contain a default export (imported as 'CategoryForm').
[22:14:43.727] 
[22:14:43.727] Import trace for requested module:
[22:14:43.727] ./src/components/cms/categories/edit-category.tsx
[22:14:43.727] ./src/components/cms/categories/categories-management.tsx
[22:14:43.727] 
[22:14:43.789]  ✓ Compiled successfully
[22:14:43.793]    Linting and checking validity of types ...
[22:14:52.551] 
[22:14:52.552] Failed to compile.
[22:14:52.553] 
[22:14:52.553] ./src/app/[locale]/my-prompts/page.tsx
[22:14:52.553] 41:14  Error: 'Link' is not defined.  react/jsx-no-undef
[22:14:52.553] 
[22:14:52.553] ./src/app/api/cms/prompts/route.ts
[22:14:52.554] 27:6  Error: 'PromptInput' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.554] 29:11  Error: 'SearchParams' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.554] 38:11  Error: 'ErrorResponse' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.554] 68:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.554] 109:18  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.555] 
[22:14:52.555] ./src/app/api/debug/db-test/route.ts
[22:14:52.555] 25:78  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.555] 
[22:14:52.556] ./src/components/cms/categories/categories-management.tsx
[22:14:52.556] 3:27  Error: 'useEffect' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.556] 23:3  Error: 'MoveVertical' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.556] 120:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.556] 121:46  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.557] 153:3  Error: 'children' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.557] 162:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.557] 185:14  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.557] 348:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.558] 401:64  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.558] 404:36  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.559] 418:9  Error: 'handleDragEndForSubcategories' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.559] 438:66  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.559] 441:38  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.559] 
[22:14:52.559] ./src/components/cms/categories/category-form.tsx
[22:14:52.560] 31:10  Error: 'toast' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.560] 32:10  Error: 'Spinner' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.560] 35:11  Error: 'Category' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.560] 119:45  Error: 'isCategoriesLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.560] 125:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.561] 132:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.561] 137:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.561] 149:15  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.561] 154:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.561] 177:42  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.562] 258:60  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.562] 
[22:14:52.562] ./src/components/cms/categories/create-category.tsx
[22:14:52.562] 11:11  Error: 'Category' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.562] 24:37  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.563] 
[22:14:52.563] ./src/components/cms/categories/delete-category.tsx
[22:14:52.563] 61:58  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.563] 61:65  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.563] 
[22:14:52.563] ./src/components/cms/categories/draggable-category-table.tsx
[22:14:52.564] 52:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.564] 67:10  Error: 'isDragging' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.564] 
[22:14:52.565] ./src/components/cms/categories/edit-category.tsx
[22:14:52.565] 71:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.565] 79:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.565] 95:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.577] 101:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.578] 
[22:14:52.578] ./src/components/cms/categories/icon-picker.tsx
[22:14:52.578] 69:50  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.579] 163:38  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.579] 163:52  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.579] 248:9  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.579] 
[22:14:52.588] ./src/components/cms/dashboard/admin-dashboard.tsx
[22:14:52.589] 40:42  Error: 'admin' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.589] 
[22:14:52.589] ./src/components/cms/dashboard/dashboard.tsx
[22:14:52.589] 4:10  Error: 'AdminUser' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.590] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.590] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.590] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.591] 88:15  Error: Do not use an `<a>` element to navigate to `/cms/prompts/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.591] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.592] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.592] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.592] 91:15  Error: Do not use an `<a>` element to navigate to `/cms/categories/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.592] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.592] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.593] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.593] 94:15  Error: Do not use an `<a>` element to navigate to `/cms/users/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.593] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.593] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.593] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.594] 97:15  Error: Do not use an `<a>` element to navigate to `/cms/settings/`. Use `<Link />` from `next/link` instead. See: https://nextjs.org/docs/messages/no-html-link-for-pages  @next/next/no-html-link-for-pages
[22:14:52.594] 
[22:14:52.594] ./src/components/cms/prompts/create-prompt.tsx
[22:14:52.594] 19:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.594] 54:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.594] 
[22:14:52.595] ./src/components/cms/prompts/edit-prompt.tsx
[22:14:52.595] 31:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.595] 85:35  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 
[22:14:52.596] ./src/components/cms/prompts/prompt-form.tsx
[22:14:52.596] 88:17  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 143:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 380:49  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 381:45  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 412:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.596] 504:51  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.597] 
[22:14:52.597] ./src/components/cms/prompts/prompts-management.tsx
[22:14:52.597] 14:3  Error: 'buttonVariants' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.597] 50:3  Error: 'Plus' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.597] 57:3  Error: 'ArrowUpDown' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.597] 59:3  Error: 'Check' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.597] 172:16  Error: 'isCategoriesLoading' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.597] 306:63  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.598] 
[22:14:52.598] ./src/components/cms/prompts/view-prompt.tsx
[22:14:52.598] 20:3  Error: 'CardDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.598] 258:54  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.598] 
[22:14:52.598] ./src/components/cms/tools/create-tool.tsx
[22:14:52.598] 47:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.598] 53:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.599] 
[22:14:52.599] ./src/components/cms/tools/delete-tool.tsx
[22:14:52.599] 52:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.602] 
[22:14:52.602] ./src/components/cms/tools/edit-tool.tsx
[22:14:52.608] 47:24  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.609] 54:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.609] 60:31  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.609] 
[22:14:52.609] ./src/components/cms/tools/tool-form.tsx
[22:14:52.609] 3:10  Error: 'useState' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.610] 18:19  Error: 'AlertCircle' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.610] 20:10  Error: 'Alert' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.610] 20:17  Error: 'AlertDescription' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.610] 104:54  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.610] 104:62  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.610] 104:65  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.610] 104:72  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.611] 104:75  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.611] 104:86  Error: `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;`.  react/no-unescaped-entities
[22:14:52.611] 127:38  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
[22:14:52.611] 155:21  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element
[22:14:52.611] 
[22:14:52.611] ./src/components/cms/users/users-management.tsx
[22:14:52.612] 11:10  Error: 'Button' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.612] 18:17  Error: 'setError' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.612] 
[22:14:52.612] ./src/components/layout/app-sidebar.tsx
[22:14:52.612] 59:10  Error: 'activeCategoryPath' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.613] 
[22:14:52.613] ./src/components/layout/category-drawer.tsx
[22:14:52.613] 13:10  Error: 'Input' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.613] 17:10  Error: 'useTheme' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.613] 58:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.613] 132:58  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.613] 170:55  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.613] 
[22:14:52.614] ./src/components/layout/main-content/search-section.tsx
[22:14:52.614] 11:9  Error: 'isRTL' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.614] 
[22:14:52.614] ./src/components/layout/mobile-nav.tsx
[22:14:52.614] 50:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.615] 
[22:14:52.615] ./src/components/layout/sidebar.tsx
[22:14:52.615] 51:11  Error: 'theme' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.615] 51:18  Error: 'setTheme' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.615] 238:56  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.615] 276:53  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.616] 
[22:14:52.616] ./src/components/layout/user-menu.tsx
[22:14:52.616] 18:10  Error: 'routes' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.616] 
[22:14:52.616] ./src/components/prompts/prompt-modal.tsx
[22:14:52.617] 34:6  Warning: React Hook useEffect has a missing dependency: 'fetchPromptDetails'. Either include it or remove the dependency array.  react-hooks/exhaustive-deps
[22:14:52.617] 
[22:14:52.617] ./src/components/ui/input.tsx
[22:14:52.617] 4:18  Error: An interface declaring no members is equivalent to its supertype.  @typescript-eslint/no-empty-object-type
[22:14:52.617] 
[22:14:52.617] ./src/components/ui/sidebar.tsx
[22:14:52.618] 32:3  Error: 'collapsible' is assigned a value but never used.  @typescript-eslint/no-unused-vars
[22:14:52.618] 
[22:14:52.618] ./src/components/ui/textarea.tsx
[22:14:52.618] 5:18  Error: An interface declaring no members is equivalent to its supertype.  @typescript-eslint/no-empty-object-type
[22:14:52.618] 
[22:14:52.619] ./src/components/ui/use-toast.ts
[22:14:52.619] 19:7  Error: 'actionTypes' is assigned a value but only used as a type.  @typescript-eslint/no-unused-vars
[22:14:52.619] 
[22:14:52.619] ./src/lib/cms/auth/admin-auth.ts
[22:14:52.619] 17:40  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.619] 
[22:14:52.620] ./src/lib/constants/category-icons.tsx
[22:14:52.620] 169:18  Error: '_' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.620] 
[22:14:52.620] ./src/lib/prisma/client.ts
[22:14:52.620] 4:3  Error: ES2015 module syntax is preferred over namespaces.  @typescript-eslint/no-namespace
[22:14:52.621] 16:19  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.621] 17:16  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.621] 19:23  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[22:14:52.621] 
[22:14:52.621] ./src/middleware.ts
[22:14:52.621] 61:12  Error: 'error' is defined but never used.  @typescript-eslint/no-unused-vars
[22:14:52.621] 
[22:14:52.621] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[22:14:52.629] Error: Command "npm run build" exited with 1
[22:14:53.894] 