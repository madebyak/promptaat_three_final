[22:52:46.795] Running build in Washington, D.C., USA (East) – iad1
[22:52:46.923] Cloning github.com/madebyak/promptaat_three_final (Branch: main, Commit: 6ca755d)
[22:52:46.940] Skipping build cache, deployment was triggered without cache.
[22:52:47.402] Cloning completed: 481.000ms
[22:52:47.748] Running "vercel build"
[22:52:48.137] Vercel CLI 41.2.2
[22:52:51.767] Running "install" command: `npm install`...
[22:53:14.203] 
[22:53:14.204] added 688 packages, and audited 689 packages in 22s
[22:53:14.204] 
[22:53:14.204] 209 packages are looking for funding
[22:53:14.205]   run `npm fund` for details
[22:53:14.205] 
[22:53:14.205] found 0 vulnerabilities
[22:53:14.280] Detected Next.js version: 15.1.7
[22:53:14.281] Running "npm run build"
[22:53:14.397] 
[22:53:14.398] > promptaat_final_03@0.1.0 build
[22:53:14.398] > prisma generate && next build --no-lint
[22:53:14.398] 
[22:53:14.948] Prisma schema loaded from prisma/schema.prisma
[22:53:15.555] 
[22:53:15.555] ✔ Generated Prisma Client (v6.4.1) to ./node_modules/@prisma/client in 221ms
[22:53:15.556] 
[22:53:15.556] Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
[22:53:15.556] 
[22:53:15.556] Tip: Want real-time updates to your database without manual polling? Discover how with Pulse: https://pris.ly/tip-0-pulse
[22:53:15.556] 
[22:53:16.271]  ⚠ Linting is disabled.
[22:53:16.386] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[22:53:16.387] This information is used to shape Next.js' roadmap and prioritize features.
[22:53:16.387] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[22:53:16.387] https://nextjs.org/telemetry
[22:53:16.387] 
[22:53:16.488]    ▲ Next.js 15.1.7
[22:53:16.488] 
[22:53:16.521]    Creating an optimized production build ...
[22:53:37.404]  ⚠ Compiled with warnings
[22:53:37.405] 
[22:53:37.406] ./node_modules/handlebars/lib/index.js
[22:53:37.406] require.extensions is not supported by webpack. Use a loader instead.
[22:53:37.406] 
[22:53:37.406] Import trace for requested module:
[22:53:37.406] ./node_modules/handlebars/lib/index.js
[22:53:37.406] ./src/app/api/auth/verify/route.ts
[22:53:37.407] 
[22:53:37.407] ./node_modules/handlebars/lib/index.js
[22:53:37.407] require.extensions is not supported by webpack. Use a loader instead.
[22:53:37.407] 
[22:53:37.407] Import trace for requested module:
[22:53:37.407] ./node_modules/handlebars/lib/index.js
[22:53:37.407] ./src/app/api/auth/verify/route.ts
[22:53:37.408] 
[22:53:37.408] ./node_modules/handlebars/lib/index.js
[22:53:37.408] require.extensions is not supported by webpack. Use a loader instead.
[22:53:37.408] 
[22:53:37.408] Import trace for requested module:
[22:53:37.408] ./node_modules/handlebars/lib/index.js
[22:53:37.408] ./src/app/api/auth/verify/route.ts
[22:53:37.409] 
[22:53:56.801]  ✓ Compiled successfully
[22:53:56.808]    Checking validity of types ...
[22:54:11.106] Failed to compile.
[22:54:11.107] ./node_modules/handlebars/lib/index.js
./src/app/api/auth/verify/route.ts
./node_modules/handlebars/lib/index.js
require.extensions is not supported by webpack. Use a loader instead.
Import trace for requested module:
./node_modules/handlebars/lib/index.js
./src/app/api/auth/verify/route.ts
 ✓ Compiled successfully
   Checking validity of types ...
Failed to compile.
./src/app/api/cms/users/route.ts:26:13
Type error: Property 'OR' does not exist on type '{}'.
  24 |     
  25 |     if (search) {
> 26 |       where.OR = [
     |             ^
  27 |         { name: { contains: search, mode: "insensitive" } },
  28 |         { email: { contains: search, mode: "insensitive" } },
  29 |       ];
Next.js build worker exited with code: 1 and signal: null
Error: Command "npm run build" exited with 1
