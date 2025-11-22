import { NextRequest, NextResponse } from "next/server"
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge"
import { clientConfig, serverConfig } from "./lib/config"

const PUBLIC_PATHS = ["/auth/signup", "/auth/login", "/reset-password", "/"]

const LANDING_PATHS = ["/"]

export async function middleware(request: NextRequest) {
  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: clientConfig.apiKey,
    cookieName: serverConfig.cookieName,
    cookieSignatureKeys: serverConfig.cookieSignatureKeys,
    cookieSerializeOptions: serverConfig.cookieSerializeOptions,
    serviceAccount: serverConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      if (PUBLIC_PATHS.includes(request.nextUrl.pathname) && !LANDING_PATHS.includes(request.nextUrl.pathname)) {
        return redirectToHome(request, {
          path: "/account/home",
        })
      }

      return NextResponse.next({
        request: {
          headers,
        },
      })
    },
    handleInvalidToken: async (reason) => {
      console.info("Missing or malformed credentials", { reason })

      return redirectToLogin(request, {
        path: "/auth/login",
        publicPaths: PUBLIC_PATHS,
      })
    },
    handleError: async (error) => {
      console.error("Unhandled authentication error", { error })

      return redirectToLogin(request, {
        path: "/auth/login",
        publicPaths: PUBLIC_PATHS,
      })
    },
  })
}

export const config = {
  matcher: [
    "/account/home",
    "/((?!_next|favicon.ico|__/auth|__/firebase|api|.*\\.).*)",
    "/api/login",
    "/api/logout",
    "/api/refresh-token",
    // Note: /api/oauth/callback is excluded from auth middleware via the api exclusion above
  ],
}
