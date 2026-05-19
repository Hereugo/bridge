from starlette.types import ASGIApp, Receive, Scope, Send


class StripApiPrefixMiddleware:
    """Strip leading /api so routes work behind a /api reverse proxy without path rewrite."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path.startswith("/api/"):
                scope["path"] = path[4:] or "/"
            elif path == "/api":
                scope["path"] = "/"
        await self.app(scope, receive, send)
