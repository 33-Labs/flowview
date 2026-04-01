import { NextResponse } from "next/server"

const AUTOMATED_UA_PATTERN = /bot|crawler|spider|headlesschrome|lighthouse|pingdom|monitor|uptime/i

const POSSIBLE_IP_HEADER_NAMES = [
  "x-vercel-forwarded-for",
  "x-forwarded-for",
  "x-real-ip",
  "forwarded",
  "cf-connecting-ip",
  "true-client-ip",
  "fastly-client-ip",
  "x-client-ip",
  "x-cluster-client-ip",
  "x-forwarded",
  "forwarded-for",
  "forwarded",
  "client-ip",
  "remote-addr",
  "x-original-forwarded-for",
]

const normalizeToken = (value) => {
  if (!value) {
    return null
  }

  return value.trim().replace(/^for=/i, "").replace(/^"|"$/g, "")
}

const extractIpCandidates = (value) => {
  if (!value) {
    return []
  }

  return value
    .split(/[,\s;]+/)
    .map(normalizeToken)
    .filter(Boolean)
    .filter((token) => token.toLowerCase() !== "unknown")
    .filter((token) => token !== "_hidden")
}
const getIpDetails = (request) => {
  const ipHeaders = {}
  const ipCandidates = []

  for (const headerName of POSSIBLE_IP_HEADER_NAMES) {
    const headerValue = request.headers.get(headerName)
    if (!headerValue) {
      continue
    }

    ipHeaders[headerName] = headerValue

    for (const candidate of extractIpCandidates(headerValue)) {
      if (!ipCandidates.includes(candidate)) {
        ipCandidates.push(candidate)
      }
    }
  }

  return {
    ip: ipCandidates[0] || null,
    ipCandidates,
    ipHeaders,
  }
}

const decodeHeaderValue = (value) => {
  if (!value) {
    return null
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const isLikelyAutomatedRequest = (request) => {
  const userAgent = request.headers.get("user-agent") || ""
  const purpose = request.headers.get("purpose") || ""
  const secPurpose = request.headers.get("sec-purpose") || ""

  return (
    AUTOMATED_UA_PATTERN.test(userAgent) ||
    purpose.toLowerCase() === "prefetch" ||
    secPurpose.toLowerCase() === "prefetch"
  )
}

const shouldSkipRequest = (request) => {
  if (request.method !== "GET") {
    return true
  }

  if (request.headers.get("x-nextjs-data")) {
    return true
  }

  const accept = request.headers.get("accept") || ""
  const secFetchDest = request.headers.get("sec-fetch-dest") || ""

  if (accept && !accept.includes("text/html")) {
    return true
  }

  if (secFetchDest && secFetchDest !== "document") {
    return true
  }

  if (isLikelyAutomatedRequest(request)) {
    return true
  }

  return false
}

export function middleware(request) {
  if (shouldSkipRequest(request)) {
    return NextResponse.next()
  }

  const ipDetails = getIpDetails(request)

  const visitLog = {
    type: "visit_log",
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.nextUrl.href,
    pathname: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    ip: ipDetails.ip,
    ipCandidates: ipDetails.ipCandidates,
    ipHeaders: ipDetails.ipHeaders,
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
    acceptLanguage: request.headers.get("accept-language"),
    accept: request.headers.get("accept"),
    host: request.headers.get("host"),
    vercelCountry: request.headers.get("x-vercel-ip-country"),
    vercelRegion: request.headers.get("x-vercel-ip-country-region"),
    vercelCity: decodeHeaderValue(request.headers.get("x-vercel-ip-city")),
    vercelId: request.headers.get("x-vercel-id"),
    secFetchSite: request.headers.get("sec-fetch-site"),
    secFetchMode: request.headers.get("sec-fetch-mode"),
    secFetchDest: request.headers.get("sec-fetch-dest"),
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
