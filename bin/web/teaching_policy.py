"""HTTP policy for the composed public lesson; no API or private UI is served."""

CSP = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'"
HEADERS = {
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-Robots-Tag': 'noindex, nofollow',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cache-Control': 'no-store',
}


def exported_headers() -> str:
    """Static-host format. Render needs the same rules applied explicitly."""
    return '/*\n' + ''.join(f'  {key}: {value}\n' for key, value in HEADERS.items())


# The existing authenticated clients need same-origin API/workers and explicit
# microphone capture. This policy does not grant device consent or Core access.
PRIVATE_CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
PRIVATE_HEADERS = {**HEADERS, 'Content-Security-Policy':PRIVATE_CSP,
                   'Permissions-Policy':'camera=(), microphone=(self), geolocation=()'}


def integrated_routes():
    """Closed client-only routes; no implicit API proxy or catch-all SPA."""
    return [
        {'src':'/.*','headers':dict(PRIVATE_HEADERS),'continue':True},
        {'src':'/study(?:/.*)?$','status':503,'dest':'/_integration/backend-unavailable.json'},
        {'src':'/$','dest':'/index.html'},
        {'src':'/studio/?$','dest':'/studio/index.html'},
        {'src':'/ops/release/?$','dest':'/ops/release/index.html'},
        {'handle':'filesystem'},
        {'src':'/.*','status':404,'dest':'/404.html'},
    ]
