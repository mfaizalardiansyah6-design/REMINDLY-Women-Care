---
paths:
  - routes/web.php
---

# Routes

## SPA catch-all must exclude backend prefixes
The SPA catch-all route in routes/web.php uses where('any', '^(?!api/|sanctum/|storage/|_boost).*') so unmatched /api/v1/* and /sanctum/* requests return a proper 404 (JSON per bootstrap/app.php) instead of being swallowed by the SPA fallback and returning 200 HTML.
