import { NextResponse } from "next/server"

const getClientIp = (request) => {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    const [ip] = forwardedFor.split(",")
    return ip.trim()
  }

  return request.headers.get("x-real-ip") || null
}

const shouldSkipRequest = (request) => {
  if (request.method !== "GET") {
    return true
  }

  if (request.headers.get("x-nextjs-data")) {
    return true
  }

  return false
}

export function middleware(request) {
  if (shouldSkipRequest(request)) {
    return NextResponse.next()
  }

  const visitLog = {
    type: "visit_log",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.nextUrl.href,
    pathname: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
    acceptLanguage: request.headers.get("accept-language"),
    host: request.headers.get("host"),
    forwardedFor: request.headers.get("x-forwarded-for"),
    vercelCountry: request.headers.get("x-vercel-ip-country"),
    vercelRegion: request.headers.get("x-vercel-ip-country-region"),
    vercelCity: request.headers.get("x-vercel-ip-city"),
  }

  console.log(JSON.stringify(visitLog))

  return NextResponse.next()
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
