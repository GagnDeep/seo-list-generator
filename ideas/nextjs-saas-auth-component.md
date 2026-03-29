# NextJS SaaS Auth Component

## What It Is
A production-grade authentication UI component library for Next.js SaaS applications. Provides drop-in email/password authentication, OAuth (GitHub, Google, Discord), email verification flows, and password reset — all with zero backend knowledge required. Styled with Tailwind CSS and fully typed with TypeScript.

## Why It Doesn't Exist Well as Open Source
Auth.js (formerly NextAuth) is the standard but its UI components are basic and unstyled. `clerk` and `stytch` are excellent but closed-source and require vendor lock-in. Most open-source auth UIs are either abandonware, poorly typed, or don't support App Router properly.

## Developer Pain Point
Every Next.js SaaS developer rebuilds the same auth UI from scratch: login forms, OAuth buttons, email verification pages, password reset flows. This is boilerplate that takes days and is security-critical. Developers would npm install this TODAY to save a week of work and get battle-tested auth UI instantly.

## Suggested Tech Stack
- TypeScript, React 18+, Next.js 14+ (App Router)
- Tailwind CSS for styling
- Zod for validation
- TypeScript strict mode throughout

## What's Close (GitHub repos to reference)
- [next-auth](https://github.com/nextauthjs/next-auth) — excellent core, but no styled UI components
- [clerk](https://github.com/clerkinc/clerk) — great UI but closed source, expensive
- [kinde-auth-react](https://github.com/kinde-oss/kinde-auth-react) — decent but limited customization

## What to Build (MVP Scope)
1. Login/Register forms with email/password
2. OAuth providers (GitHub, Google) — 2 core providers
3. Email verification flow with magic links
4. Password reset flow
5. Session management hook (`useSession`, `useUser`)
6. Protected route HOC and middleware helper

## Category
Component
