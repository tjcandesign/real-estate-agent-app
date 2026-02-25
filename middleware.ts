import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/blog(.*)',
  '/portfolio(.*)',
  '/contact',
  '/agents/sign-in(.*)',
  '/agents/sign-up(.*)',
  '/agents/test',
  '/agents/simple-test',
  '/clients/onboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // If route is not public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
