import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"

// Base config that's Edge-compatible (no Prisma/bcrypt)
export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/admin/login",
        error: "/admin/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isAdminRoute = nextUrl.pathname.startsWith("/admin")
            const isAdminLoginPage = nextUrl.pathname === "/admin/login" || nextUrl.pathname === "/admin/signup"

            // Allow login/signup pages
            if (isAdminLoginPage) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/admin/dashboard", nextUrl))
                }
                return true
            }

            // Protect admin routes
            if (isAdminRoute) {
                return isLoggedIn
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as any
            }
            return session
        },
    },
    providers: [], // Providers are added in auth.ts (Node.js runtime)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
}

export const { auth: middleware } = NextAuth(authConfig)
