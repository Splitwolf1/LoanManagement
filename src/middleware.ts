export { middleware as default } from "@/auth.config"

export const config = {
    matcher: [
        // Match admin routes
        "/admin/:path*",
    ],
}
